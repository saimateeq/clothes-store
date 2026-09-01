import Product from "../models/Product.js";
import Order from "../models/Order.js";
import User from "../models/User.js";

// "Recommended For You" is deliberately NOT an LLM call — running a chat
// completion on every homepage/account load for every visitor would be
// slow and needlessly expensive for something a plain scoring query does
// well. It scores active products by category/tag overlap against the
// shopper's own recent signals (viewed products for guests and logged-in
// users, plus past orders for logged-in users), which is what the AI
// features' retrieval layer is doing under the hood anyway — just without
// a model call wrapped around it.

const MAX_SIGNAL_PRODUCTS = 20;
const MAX_RESULTS = 12;

async function getSignalProducts({ userId, viewedIds = [] }) {
  const ids = new Set(viewedIds.filter(Boolean));
  let purchasedIds = new Set();

  if (userId) {
    const [orders, user] = await Promise.all([
      Order.find({ user: userId }).select("items.product").limit(10).lean(),
      User.findById(userId).select("recentlyViewed").lean(),
    ]);
    purchasedIds = new Set(orders.flatMap((o) => o.items.map((i) => i.product?.toString())).filter(Boolean));
    purchasedIds.forEach((id) => ids.add(id));
    (user?.recentlyViewed || []).forEach((id) => ids.add(id.toString()));
  }

  const validIds = [...ids].filter(Boolean).slice(0, MAX_SIGNAL_PRODUCTS);
  if (!validIds.length) return { signalDocs: [], purchasedIds };

  const signalDocs = await Product.find({ _id: { $in: validIds } }).select("category subcategory tags price");
  return { signalDocs, purchasedIds };
}

export async function getRecommendedProducts({ userId, viewedIds = [], excludeIds = [], limit = MAX_RESULTS }) {
  const { signalDocs, purchasedIds } = await getSignalProducts({ userId, viewedIds });
  const exclude = new Set([...excludeIds, ...viewedIds, ...purchasedIds].filter(Boolean));

  if (!signalDocs.length) {
    // No signal yet (new guest, nothing viewed) — fall back to a sensible
    // default rather than an empty section: best sellers.
    return Product.find({ isActive: true, _id: { $nin: [...exclude] } })
      .sort({ isBestSeller: -1, reviewCount: -1 })
      .limit(limit)
      .populate("category", "name slug");
  }

  const categoryCounts = new Map();
  const tagCounts = new Map();
  let priceSum = 0;
  signalDocs.forEach((d) => {
    const catId = d.category?.toString();
    if (catId) categoryCounts.set(catId, (categoryCounts.get(catId) || 0) + 1);
    (d.tags || []).forEach((t) => tagCounts.set(t, (tagCounts.get(t) || 0) + 1));
    priceSum += d.price || 0;
  });
  const avgPrice = priceSum / signalDocs.length;
  const topCategoryIds = [...categoryCounts.keys()];

  const candidates = await Product.find({
    isActive: true,
    _id: { $nin: [...exclude] },
    category: { $in: topCategoryIds },
  })
    .limit(60)
    .populate("category", "name slug");

  const scored = candidates.map((p) => {
    let score = 0;
    const catId = p.category?._id?.toString();
    score += (categoryCounts.get(catId) || 0) * 3;
    (p.tags || []).forEach((t) => {
      if (tagCounts.has(t)) score += tagCounts.get(t);
    });
    // Mild preference for similarly-priced items over wildly different ones.
    if (avgPrice > 0) score -= Math.min(2, Math.abs(p.price - avgPrice) / avgPrice);
    if (p.isBestSeller) score += 0.5;
    return { p, score };
  });

  scored.sort((a, b) => b.score - a.score);
  let results = scored.slice(0, limit).map((s) => s.p);

  if (results.length < limit) {
    const have = new Set(results.map((p) => p._id.toString()));
    const fill = await Product.find({
      isActive: true,
      _id: { $nin: [...exclude, ...have] },
    })
      .sort({ isBestSeller: -1, reviewCount: -1 })
      .limit(limit - results.length)
      .populate("category", "name slug");
    results = results.concat(fill);
  }

  return results;
}

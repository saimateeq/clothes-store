import Product from "../models/Product.js";
import Category from "../models/Category.js";
import { buildProductQuery } from "./productQueryService.js";

// Shared retrieval layer for every AI feature (Stylist, Shopping Assistant,
// and later Visual Search / Outfit Generator): it wraps the SAME
// buildProductQuery() the public /api/products endpoints use, so the AI
// only ever sees products that genuinely exist, are active, and match a
// real Mongo filter — never a hand-rolled parallel search implementation.

const MAX_RESULTS = 12;
const OBJECT_ID_RE = /^[0-9a-fA-F]{24}$/;
const NO_MATCH_ID = "000000000000000000000000";

async function resolveCategory(category) {
  if (!category || typeof category !== "string") return undefined;
  if (OBJECT_ID_RE.test(category)) return category;
  const cat = await Category.findOne({ slug: category.toLowerCase().trim() }).select("_id");
  return cat ? cat._id.toString() : NO_MATCH_ID;
}

// A short "women, men, shirts, ..." hint fed into the AI's system prompt so
// it uses real category slugs instead of guessing.
export async function getCategoryHint() {
  const categories = await Category.find({ isActive: true }).select("slug").sort("sortOrder").limit(40);
  return categories.map((c) => c.slug).join(", ");
}

// Compact shape fed INTO the OpenAI prompt — small, token-conscious, and
// deliberately excludes anything internal (costPrice, SKUs, raw ids beyond
// the one the model needs to reference). Client-facing responses use the
// full Product document instead (see hydrateProductDocs) so the existing
// frontend normalizeProduct() keeps working unchanged.
export function toAiPrompt(doc) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    category: doc.category?.name,
    price: doc.price,
    onSale: Boolean(doc.compareAtPrice && doc.compareAtPrice > doc.price),
    colors: (doc.colors ?? []).map((c) => c.name),
    sizes: doc.sizes ?? [],
    material: doc.material || undefined,
    tags: (doc.tags ?? []).slice(0, 6),
    rating: doc.rating || undefined,
    inStock: (doc.variants ?? []).some((v) => v.inventory > 0),
    description: (doc.shortDescription || doc.description || "").slice(0, 160),
  };
}

export async function searchProductDocs({
  q,
  category,
  minPrice,
  maxPrice,
  colors,
  sizes,
  inStock,
  limit = MAX_RESULTS,
} = {}) {
  const resolvedCategory = await resolveCategory(category);
  const { filter, sort } = buildProductQuery(
    {
      q,
      category: resolvedCategory,
      minPrice,
      maxPrice,
      colors: Array.isArray(colors) ? colors.join(",") : colors,
      sizes: Array.isArray(sizes) ? sizes.join(",") : sizes,
      inStock: inStock ? "true" : undefined,
    },
    { defaultActiveOnly: true }
  );

  return Product.find(filter)
    .sort(q ? { score: { $meta: "textScore" } } : sort)
    .select(q ? { score: { $meta: "textScore" } } : {})
    .limit(Math.min(MAX_RESULTS, Math.max(1, Number(limit) || MAX_RESULTS)))
    .populate("category", "name slug");
}

export async function getProductDoc(id) {
  if (!id || !OBJECT_ID_RE.test(id)) return null;
  return Product.findOne({ _id: id, isActive: true }).populate("category", "name slug");
}

export async function checkAvailability({ id, size, color }) {
  if (!id || !OBJECT_ID_RE.test(id)) return { available: false, reason: "Unknown product" };
  const doc = await Product.findOne({ _id: id, isActive: true });
  if (!doc) return { available: false, reason: "Product not found" };

  const variant = doc.variants.find(
    (v) =>
      v.size?.toLowerCase() === String(size).toLowerCase() &&
      v.color?.toLowerCase() === String(color).toLowerCase()
  );
  if (!variant) return { available: false, reason: "That size/color combination isn't offered for this product" };
  return { available: variant.inventory > 0, inventory: variant.inventory };
}

// Re-fetches the real, current documents for a set of ids, preserving the
// given order — used any time the AI has referenced products by id, so
// whatever the customer ends up seeing (name/price/image/stock) always
// comes straight from the database, never from the model's own text.
export async function hydrateProductDocs(ids = []) {
  const validIds = [...new Set(ids)].filter((id) => OBJECT_ID_RE.test(id));
  if (!validIds.length) return [];

  const docs = await Product.find({ _id: { $in: validIds }, isActive: true }).populate("category", "name slug");
  const byId = new Map(docs.map((d) => [d._id.toString(), d]));
  return validIds.map((id) => byId.get(id)).filter(Boolean);
}

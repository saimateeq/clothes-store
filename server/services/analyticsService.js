import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";

const RANGE_DAYS = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 };

export function rangeToDates(range = "30d") {
  const days = RANGE_DAYS[range] ?? 30;
  const end = new Date();
  const start = new Date(end.getTime() - days * 86400000);
  const prevStart = new Date(start.getTime() - days * 86400000);
  return { start, end, prevStart, prevEnd: start };
}

// A "counted" order is one that actually represents revenue — unpaid/failed
// carts that never became real sales shouldn't inflate the numbers.
const REVENUE_MATCH = { paymentStatus: "paid" };

export async function getOverviewStats(range) {
  const { start, end, prevStart, prevEnd } = rangeToDates(range);

  const [current, previous, customerCount, productsSoldAgg] = await Promise.all([
    Order.aggregate([
      { $match: { ...REVENUE_MATCH, createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: null, revenue: { $sum: "$total" }, orders: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { ...REVENUE_MATCH, createdAt: { $gte: prevStart, $lt: prevEnd } } },
      { $group: { _id: null, revenue: { $sum: "$total" }, orders: { $sum: 1 } } },
    ]),
    User.countDocuments({ role: "customer", createdAt: { $gte: start, $lte: end } }),
    Order.aggregate([
      { $match: { ...REVENUE_MATCH, createdAt: { $gte: start, $lte: end } } },
      { $unwind: "$items" },
      { $group: { _id: null, count: { $sum: "$items.quantity" } } },
    ]),
  ]);

  const currentRevenue = current[0]?.revenue ?? 0;
  const currentOrders = current[0]?.orders ?? 0;
  const previousRevenue = previous[0]?.revenue ?? 0;
  const previousOrders = previous[0]?.orders ?? 0;

  const pctChange = (curr, prev) => (prev === 0 ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / prev) * 1000) / 10);

  return {
    revenue: currentRevenue,
    revenueChange: pctChange(currentRevenue, previousRevenue),
    orders: currentOrders,
    ordersChange: pctChange(currentOrders, previousOrders),
    averageOrderValue: currentOrders ? Math.round((currentRevenue / currentOrders) * 100) / 100 : 0,
    newCustomers: customerCount,
    productsSold: productsSoldAgg[0]?.count ?? 0,
  };
}

export async function getRevenueOverTime(range) {
  const { start, end } = rangeToDates(range);
  return Order.aggregate([
    { $match: { ...REVENUE_MATCH, createdAt: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        revenue: { $sum: "$total" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: "$_id", revenue: 1, orders: 1 } },
  ]);
}

export async function getSalesByCategory(range) {
  const { start, end } = rangeToDates(range);
  return Order.aggregate([
    { $match: { ...REVENUE_MATCH, createdAt: { $gte: start, $lte: end } } },
    { $unwind: "$items" },
    { $lookup: { from: "products", localField: "items.product", foreignField: "_id", as: "product" } },
    { $unwind: "$product" },
    { $lookup: { from: "categories", localField: "product.category", foreignField: "_id", as: "category" } },
    { $unwind: "$category" },
    {
      $group: {
        _id: "$category.name",
        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
      },
    },
    { $sort: { revenue: -1 } },
    { $project: { _id: 0, category: "$_id", revenue: 1 } },
  ]);
}

export async function getTopProducts(range, limit = 5) {
  const { start, end } = rangeToDates(range);
  return Order.aggregate([
    { $match: { ...REVENUE_MATCH, createdAt: { $gte: start, $lte: end } } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        name: { $first: "$items.name" },
        image: { $first: "$items.image" },
        unitsSold: { $sum: "$items.quantity" },
        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: limit },
  ]);
}

export async function getRecentOrders(limit = 8) {
  return Order.find(REVENUE_MATCH).sort({ createdAt: -1 }).limit(limit).populate("user", "name email");
}

export async function getLowStockProducts(limit = 8) {
  const products = await Product.find({ isActive: true }).select(
    "name slug images variants lowStockThreshold"
  );
  return products
    .map((p) => ({
      _id: p._id,
      name: p.name,
      slug: p.slug,
      image: p.images?.[0]?.url,
      totalInventory: p.variants.reduce((sum, v) => sum + v.inventory, 0),
      lowStockThreshold: p.lowStockThreshold,
    }))
    .filter((p) => p.totalInventory <= p.lowStockThreshold)
    .sort((a, b) => a.totalInventory - b.totalInventory)
    .slice(0, limit);
}

import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ok } from "../utils/apiResponse.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import * as analytics from "../services/analyticsService.js";

export const getDashboard = asyncHandler(async (req, res) => {
  const range = req.query.range || "30d";
  const [overview, revenueOverTime, salesByCategory, topProducts, recentOrders, lowStock] =
    await Promise.all([
      analytics.getOverviewStats(range),
      analytics.getRevenueOverTime(range),
      analytics.getSalesByCategory(range),
      analytics.getTopProducts(range),
      analytics.getRecentOrders(),
      analytics.getLowStockProducts(),
    ]);

  ok(res, { overview, revenueOverTime, salesByCategory, topProducts, recentOrders, lowStock });
});

export const listAllOrders = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.orderStatus = req.query.status;

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("user", "name email"),
    Order.countDocuments(filter),
  ]);

  ok(res, { orders, page, pages: Math.ceil(total / limit) || 1, total });
});

export const listCustomers = asyncHandler(async (req, res) => {
  const customers = await User.aggregate([
    { $match: { role: "customer" } },
    {
      $lookup: {
        from: "orders",
        let: { userId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$user", "$$userId"] }, paymentStatus: "paid" } },
        ],
        as: "orders",
      },
    },
    {
      $project: {
        name: 1,
        email: 1,
        isActive: 1,
        createdAt: 1,
        totalOrders: { $size: "$orders" },
        totalSpent: { $sum: "$orders.total" },
        lastOrderAt: { $max: "$orders.createdAt" },
      },
    },
    { $sort: { createdAt: -1 } },
  ]);

  ok(res, { customers });
});

export const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await User.findOne({ _id: req.params.id, role: "customer" });
  if (!customer) throw ApiError.notFound("Customer not found");

  const orders = await Order.find({ user: customer._id }).sort({ createdAt: -1 });
  ok(res, { customer: customer.toSafeJSON(), orders });
});

export const setCustomerActive = asyncHandler(async (req, res) => {
  const customer = await User.findOneAndUpdate(
    { _id: req.params.id, role: "customer" },
    { isActive: req.body.isActive },
    { new: true }
  );
  if (!customer) throw ApiError.notFound("Customer not found");
  ok(res, { customer: customer.toSafeJSON() }, customer.isActive ? "Customer enabled" : "Customer disabled");
});

// ── Product bulk actions ────────────────────────────────────────────────

export const bulkUpdateProducts = asyncHandler(async (req, res) => {
  const { ids, action } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) throw ApiError.badRequest("No products selected");

  if (action === "activate") {
    await Product.updateMany({ _id: { $in: ids } }, { isActive: true });
  } else if (action === "deactivate") {
    await Product.updateMany({ _id: { $in: ids } }, { isActive: false });
  } else if (action === "delete") {
    await Product.deleteMany({ _id: { $in: ids } });
  } else {
    throw ApiError.badRequest("Unknown bulk action");
  }

  ok(res, {}, `Bulk ${action} complete`);
});

export const duplicateProduct = asyncHandler(async (req, res) => {
  const original = await Product.findById(req.params.id).lean();
  if (!original) throw ApiError.notFound("Product not found");

  delete original._id;
  const copy = await Product.create({
    ...original,
    name: `${original.name} (Copy)`,
    slug: `${original.slug}-copy-${Date.now().toString(36)}`,
    sku: `${original.sku}-COPY`,
    isActive: false,
  });

  ok(res, { product: copy }, "Product duplicated");
});

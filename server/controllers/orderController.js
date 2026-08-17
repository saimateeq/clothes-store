import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ok, created } from "../utils/apiResponse.js";
import Order from "../models/Order.js";
import stripe, { isStripeConfigured } from "../config/stripe.js";
import { computeCheckoutTotals, toStripeCents } from "../services/checkoutPricingService.js";
import { decrementInventoryForLines } from "../services/inventoryService.js";
import { assertValidTransition } from "../services/orderStatusService.js";
import { getOrCreateCart } from "../services/cartService.js";
import { incrementCouponUsage } from "../services/couponService.js";

export const createOrder = asyncHandler(async (req, res) => {
  if (!isStripeConfigured) {
    throw new ApiError(503, "Payments are not configured yet. Set STRIPE_SECRET_KEY in server/.env.");
  }

  const { paymentIntentId, shippingAddress, billingAddress, shippingMethod } = req.body;

  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (!intent || intent.metadata?.userId !== req.user._id.toString()) {
    throw ApiError.forbidden("This payment does not belong to your account");
  }
  if (intent.status !== "succeeded") {
    throw ApiError.badRequest(`Payment has not completed (status: ${intent.status})`);
  }

  const existing = await Order.findOne({ paymentIntentId });
  if (existing) return ok(res, { order: existing }, "Order already placed");

  // Recompute totals from the CURRENT cart rather than trusting anything
  // the client sent — this also re-validates stock right before we commit.
  // The coupon code comes from the PaymentIntent's own metadata (what was
  // actually charged), not a fresh value the client could swap in here.
  const couponCode = intent.metadata?.couponCode || null;
  const totals = await computeCheckoutTotals(req.user._id, shippingMethod, couponCode);
  if (toStripeCents(totals.total) !== intent.amount) {
    throw ApiError.conflict(
      "Your bag changed after payment was authorized. Please contact support with your payment reference."
    );
  }

  await decrementInventoryForLines(totals.lines);

  const order = await Order.create({
    user: req.user._id,
    items: totals.lines.map((l) => ({
      product: l.productId,
      name: l.name,
      image: l.image,
      price: l.price,
      quantity: l.quantity,
      size: l.size,
      color: l.color,
    })),
    subtotal: totals.subtotal,
    shipping: totals.shipping,
    tax: totals.tax,
    discount: totals.discount,
    total: totals.total,
    shippingAddress,
    billingAddress,
    shippingMethod,
    paymentStatus: "paid",
    orderStatus: "confirmed",
    paymentIntentId,
    coupon: totals.coupon ? { code: totals.coupon.code, discountAmount: totals.discount } : undefined,
    statusHistory: [{ status: "confirmed", note: "Payment received" }],
  });

  if (totals.coupon) await incrementCouponUsage(totals.coupon._id);

  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  await cart.save();

  created(res, { order }, "Order placed");
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  ok(res, { orders });
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound("Order not found");

  const isOwner = String(order.user) === String(req.user._id);
  const isStaff = ["admin", "manager"].includes(req.user.role);
  if (!isOwner && !isStaff) throw ApiError.forbidden("You do not have access to this order");

  ok(res, { order });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound("Order not found");

  const { orderStatus, trackingNumber, note } = req.body;
  if (!assertValidTransition(order.orderStatus, orderStatus)) {
    throw ApiError.badRequest(`Cannot move an order from "${order.orderStatus}" to "${orderStatus}"`);
  }

  order.orderStatus = orderStatus;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  order.statusHistory.push({ status: orderStatus, note });
  if (orderStatus === "refunded") order.paymentStatus = "refunded";
  await order.save();

  ok(res, { order }, "Order updated");
});

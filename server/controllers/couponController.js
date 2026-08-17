import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ok, created } from "../utils/apiResponse.js";
import Coupon from "../models/Coupon.js";
import { computeCheckoutTotals } from "../services/checkoutPricingService.js";

// POST /api/coupons/validate — lets the checkout UI preview a coupon's
// effect on the current cart before payment, using the exact same pricing
// logic that will run at payment-intent creation and order finalization.
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, shippingMethod } = req.body;
  if (!code) throw ApiError.badRequest("Enter a coupon code");

  const totals = await computeCheckoutTotals(req.user._id, shippingMethod, code);
  ok(res, {
    code: totals.coupon?.code,
    discount: totals.discount,
    subtotal: totals.subtotal,
    shipping: totals.shipping,
    total: totals.total,
  });
});

export const listCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  ok(res, { coupons });
});

export const createCoupon = asyncHandler(async (req, res) => {
  const existing = await Coupon.findOne({ code: req.body.code.toUpperCase() });
  if (existing) throw ApiError.conflict("A coupon with this code already exists");

  const coupon = await Coupon.create(req.body);
  created(res, { coupon }, "Coupon created");
});

export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!coupon) throw ApiError.notFound("Coupon not found");
  ok(res, { coupon }, "Coupon updated");
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) throw ApiError.notFound("Coupon not found");
  ok(res, {}, "Coupon deleted");
});

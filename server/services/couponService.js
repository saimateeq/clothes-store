import { ApiError } from "../utils/ApiError.js";
import Coupon from "../models/Coupon.js";
import Product from "../models/Product.js";

// Discount calculation and eligibility rules live here — validated on the
// server every time, whether the request is a checkout "apply coupon"
// preview or the actual order creation. Never trust a discount amount
// computed on the client.
export async function validateCouponForCart(code, lines, subtotal) {
  if (!code) return { coupon: null, discountAmount: 0 };

  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) throw ApiError.badRequest("This coupon code is not valid");

  const now = new Date();
  if (now < coupon.startDate || now > coupon.expiryDate) {
    throw ApiError.badRequest("This coupon has expired");
  }
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    throw ApiError.badRequest("This coupon has reached its usage limit");
  }
  if (subtotal < coupon.minimumOrder) {
    throw ApiError.badRequest(`This coupon requires a minimum order of $${coupon.minimumOrder}`);
  }

  const hasScope = coupon.applicableProducts.length > 0 || coupon.applicableCategories.length > 0;
  if (hasScope) {
    const productIds = lines.map((l) => String(l.productId));
    const products = await Product.find({ _id: { $in: productIds } }).select("category");
    const categoryIds = products.map((p) => String(p.category));

    const matchesProduct = coupon.applicableProducts.some((id) => productIds.includes(String(id)));
    const matchesCategory = coupon.applicableCategories.some((id) => categoryIds.includes(String(id)));
    if (!matchesProduct && !matchesCategory) {
      throw ApiError.badRequest("This coupon does not apply to the items in your bag");
    }
  }

  let discountAmount =
    coupon.type === "percentage" ? subtotal * (coupon.value / 100) : coupon.value;
  if (coupon.type === "percentage" && coupon.maximumDiscount) {
    discountAmount = Math.min(discountAmount, coupon.maximumDiscount);
  }
  discountAmount = Math.min(discountAmount, subtotal);
  discountAmount = Math.round(discountAmount * 100) / 100;

  return { coupon, discountAmount };
}

// Conditioned on the usage limit so a burst of concurrent checkouts can't
// push usedCount past usageLimit even if they all passed the earlier
// validateCouponForCart check before any of them had incremented yet.
export async function incrementCouponUsage(couponId) {
  await Coupon.updateOne(
    {
      _id: couponId,
      $expr: { $or: [{ $eq: ["$usageLimit", null] }, { $lt: ["$usedCount", "$usageLimit"] }] },
    },
    { $inc: { usedCount: 1 } }
  );
}

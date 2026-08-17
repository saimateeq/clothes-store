import { ApiError } from "../utils/ApiError.js";
import { getOrCreateCart, hydrateCart } from "./cartService.js";
import { validateCouponForCart } from "./couponService.js";

const FREE_SHIPPING_THRESHOLD = 100;
const SHIPPING_RATES = { standard: 8, express: 20 };
const TAX_RATE = 0; // configurable via admin settings in a later phase

// The single source of truth for order totals — used identically when
// creating the Stripe PaymentIntent and when finalizing the order, so the
// two can never compute different numbers for the same cart. Never derive
// pricing (or the coupon discount) from anything the client sends — the
// coupon *code* is client input, but its validity and discount amount are
// always recomputed here.
export async function computeCheckoutTotals(userId, shippingMethod = "standard", couponCode = null) {
  const cart = await getOrCreateCart(userId);
  const { lines, subtotal } = await hydrateCart(cart);

  if (lines.length === 0) throw ApiError.badRequest("Your bag is empty");

  const outOfStock = lines.filter((l) => l.quantity > l.inventory);
  if (outOfStock.length > 0) {
    throw ApiError.badRequest(
      `${outOfStock[0].name} (${outOfStock[0].color} / ${outOfStock[0].size}) no longer has enough stock`
    );
  }

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_RATES[shippingMethod] ?? SHIPPING_RATES.standard;
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const { coupon, discountAmount } = await validateCouponForCart(couponCode, lines, subtotal);
  const total = Math.round((subtotal + shipping + tax - discountAmount) * 100) / 100;

  return { lines, subtotal, shipping, tax, discount: discountAmount, coupon, total };
}

export const toStripeCents = (amount) => Math.round(amount * 100);

import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ok } from "../utils/apiResponse.js";
import stripe, { isStripeConfigured } from "../config/stripe.js";
import { computeCheckoutTotals, toStripeCents } from "../services/checkoutPricingService.js";

function assertStripeConfigured() {
  if (!isStripeConfigured) {
    throw new ApiError(
      503,
      "Payments are not configured yet. Set STRIPE_SECRET_KEY in server/.env to enable checkout."
    );
  }
}

export const createPaymentIntent = asyncHandler(async (req, res) => {
  assertStripeConfigured();

  const shippingMethod = req.body.shippingMethod === "express" ? "express" : "standard";
  const couponCode = req.body.couponCode || null;
  const totals = await computeCheckoutTotals(req.user._id, shippingMethod, couponCode);

  const intent = await stripe.paymentIntents.create({
    amount: toStripeCents(totals.total),
    currency: "usd",
    automatic_payment_methods: { enabled: true },
    metadata: { userId: req.user._id.toString(), shippingMethod, couponCode: couponCode || "" },
  });

  ok(res, {
    clientSecret: intent.client_secret,
    paymentIntentId: intent.id,
    subtotal: totals.subtotal,
    shipping: totals.shipping,
    tax: totals.tax,
    discount: totals.discount,
    total: totals.total,
  });
});

// POST /api/payments/webhook — mounted with express.raw() in app.js, ahead
// of the global JSON body parser, because Stripe's signature verification
// needs the exact raw bytes of the request body.
export const stripeWebhook = asyncHandler(async (req, res) => {
  assertStripeConfigured();

  const signature = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    throw ApiError.badRequest(`Webhook signature verification failed: ${err.message}`);
  }

  switch (event.type) {
    case "payment_intent.succeeded":
      console.log(`Payment succeeded: ${event.data.object.id}`);
      break;
    case "payment_intent.payment_failed":
      console.warn(`Payment failed: ${event.data.object.id}`);
      break;
    case "charge.refunded":
      console.log(`Charge refunded: ${event.data.object.id}`);
      break;
    default:
      break;
  }

  res.json({ received: true });
});

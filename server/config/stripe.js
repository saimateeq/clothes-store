import Stripe from "stripe";

export const isStripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);

if (!isStripeConfigured) {
  console.warn(
    "Stripe is not configured — set STRIPE_SECRET_KEY in server/.env. " +
      "Payment routes will return a 503 until then."
  );
}

const stripe = isStripeConfigured
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-12-18.acacia" })
  : null;

export default stripe;

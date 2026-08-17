import { loadStripe } from "@stripe/stripe-js";
import { STRIPE_PUBLISHABLE_KEY } from "../constants/config";

export const isStripeEnabled = Boolean(STRIPE_PUBLISHABLE_KEY);

// Only ever call loadStripe once — it must be invoked outside component
// render per Stripe's own guidance, and calling it with an empty key
// throws, so guard it behind isStripeEnabled.
export const stripePromise = isStripeEnabled ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;

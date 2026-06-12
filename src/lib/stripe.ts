import Stripe from "stripe";

/**
 * Returns a Stripe client, or null when STRIPE_SECRET_KEY is not configured.
 * The app must keep working without Stripe: online payment is simply hidden
 * and bookings fall back to pay-in-store.
 */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export function stripeEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

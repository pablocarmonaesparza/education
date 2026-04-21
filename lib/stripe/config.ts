import Stripe from 'stripe';

/**
 * Server-only Stripe client singleton.
 * Do NOT import this from client components.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
  typescript: true,
});

/**
 * Price IDs for the 3-plan structure (basic / monthly / yearly).
 * Basic is free → no Stripe price. Monthly + Yearly both resolve to
 * `premium` tier in `public.users.tier`; the difference is only the
 * billing cadence, tracked by Stripe itself.
 */
export const STRIPE_PRICES = {
  monthly: process.env.STRIPE_PRICE_MONTHLY!,
  yearly: process.env.STRIPE_PRICE_YEARLY!,
} as const;

export type BillingPlan = keyof typeof STRIPE_PRICES;

/**
 * Map a Stripe price ID back to its plan slug. Used by the webhook
 * to decide tier updates and insert the right row in `payments`.
 */
export function planFromPriceId(priceId: string | null | undefined): BillingPlan | null {
  if (!priceId) return null;
  if (priceId === STRIPE_PRICES.monthly) return 'monthly';
  if (priceId === STRIPE_PRICES.yearly) return 'yearly';
  return null;
}

/**
 * Tier granted by any paid plan. Both monthly and yearly unlock the
 * same set of features.
 */
export const PAID_TIER = 'premium' as const;
export const FREE_TIER = 'basic' as const;

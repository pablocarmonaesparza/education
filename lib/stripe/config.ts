import Stripe from 'stripe';

/**
 * Server-only Stripe client singleton.
 * Do NOT import this from client components.
 *
 * Inicialización lazy: el cliente real se crea en el primer property access
 * (`stripe.checkout.sessions.create(...)`). Esto evita que el build de Vercel
 * crashee en la fase "Collecting page data" cuando `STRIPE_SECRET_KEY` no
 * está configurada (preview deploys de branches sin env vars). Si la env no
 * está al runtime, el Proxy lanza un error claro en lugar del genérico
 * "Neither apiKey nor config.authenticator provided".
 */
let _stripe: Stripe | undefined;

function getStripeClient(): Stripe {
  if (_stripe) return _stripe;
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    throw new Error(
      'STRIPE_SECRET_KEY no configurada en este entorno. Configurar en Vercel para que las rutas de Stripe funcionen.'
    );
  }
  _stripe = new Stripe(apiKey, {
    apiVersion: '2025-11-17.clover',
    typescript: true,
  });
  return _stripe;
}

export const stripe = new Proxy({} as Stripe, {
  get(_, prop, receiver) {
    return Reflect.get(getStripeClient(), prop, receiver);
  },
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

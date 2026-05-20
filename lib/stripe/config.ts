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

import Stripe from 'stripe';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import {
  stripe,
  planFromPriceId,
  PAID_TIER,
  FREE_TIER,
  type BillingPlan,
} from './config';

type Plan = BillingPlan;

function isActiveStatus(status: Stripe.Subscription.Status): boolean {
  return status === 'active' || status === 'trialing';
}

function parsePlan(raw: unknown): Plan | null {
  if (raw === 'monthly' || raw === 'yearly') return raw;
  return null;
}

export type SyncResult =
  | { ok: true; userId: string; active: boolean }
  | { ok: false; reason: string };

/**
 * Sincroniza el estado de suscripción desde un Checkout Session de Stripe
 * hacia `public.users`. Usado por /success para cerrar el race con el webhook:
 * si el webhook aún no llegó, escribimos los mismos campos nosotros desde el
 * page render. Idempotente — el webhook eventualmente escribe lo mismo.
 *
 * Los campos escritos y su orden coinciden con app/api/stripe-webhook/route.ts
 * (case checkout.session.completed). Si cambias uno, cambia el otro — la
 * inconsistencia produce flips visibles en /dashboard/perfil.
 *
 * Requiere STRIPE_SECRET_KEY + SUPABASE_SERVICE_ROLE_KEY. Sin ellos devuelve
 * error y el caller decide si bloquea o deja pasar.
 */
export async function syncSubscriptionFromSession(
  sessionId: string
): Promise<SyncResult> {
  if (!process.env.STRIPE_SECRET_KEY) {
    return { ok: false, reason: 'stripe_secret_key_missing' };
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false, reason: 'supabase_service_role_missing' };
  }

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'stripe_retrieve_failed';
    return { ok: false, reason: message };
  }

  const userId = session.metadata?.user_id || session.client_reference_id;
  if (!userId) {
    return { ok: false, reason: 'no_user_id_in_session' };
  }

  // Si Stripe todavía no marca como paid, salimos sin escribir. El caller
  // mostrará UI de "verificando" y reintentará.
  if (session.payment_status !== 'paid' && session.status !== 'complete') {
    return { ok: false, reason: 'payment_pending' };
  }

  const subscription =
    typeof session.subscription === 'string'
      ? await stripe.subscriptions.retrieve(session.subscription)
      : (session.subscription as Stripe.Subscription | null);

  // Mode=subscription siempre entrega subscription al momento de complete.
  // Si no está, no escribimos estado pagado con campos incompletos. El caller
  // mostrará el flujo de "verificando" y el webhook eventualmente llenará.
  if (!subscription) {
    return { ok: false, reason: 'subscription_not_ready' };
  }

  const customerId =
    typeof session.customer === 'string'
      ? session.customer
      : session.customer?.id ?? null;

  const status = subscription.status;
  const active = isActiveStatus(subscription.status);
  const plan: Plan | null =
    parsePlan(session.metadata?.plan) ??
    planFromPriceId(subscription.items.data[0]?.price.id) ??
    null;
  const periodEnd = (subscription as unknown as { current_period_end?: number })
    ?.current_period_end;
  const cancelAtPeriodEnd = subscription.cancel_at_period_end ?? false;

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const update: Record<string, unknown> = {
    stripe_subscription_id: subscription.id,
    subscription_status: status,
    subscription_plan: plan,
    subscription_active: active,
    current_period_end: periodEnd
      ? new Date(periodEnd * 1000).toISOString()
      : null,
    cancel_at_period_end: cancelAtPeriodEnd,
    // tier depende de active — igual que el webhook en customer.subscription.*.
    // Si un sub vuelve a incomplete_expired/unpaid/canceled tras un fallo,
    // revertimos el tier a FREE_TIER para no dar acceso gratis al contenido.
    tier: active ? PAID_TIER : FREE_TIER,
    updated_at: new Date().toISOString(),
  };
  // Solo escribimos stripe_customer_id si Stripe nos lo mandó — no queremos
  // blankear un valor previo. Mismo comportamiento que el webhook.
  if (customerId) update.stripe_customer_id = customerId;

  const { error } = await admin.from('users').update(update).eq('id', userId);

  if (error) {
    return { ok: false, reason: `supabase_update_failed: ${error.message}` };
  }

  return { ok: true, userId, active };
}

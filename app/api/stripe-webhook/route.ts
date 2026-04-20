import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { stripe, planFromPriceId, PAID_TIER, FREE_TIER } from '@/lib/stripe/config';

/**
 * Stripe webhook handler.
 *
 * Security:
 *  - Verifies the Stripe signature using STRIPE_WEBHOOK_SECRET.
 *  - Uses a service-role Supabase client so it can bypass RLS when
 *    updating `users` and inserting into `payments`.
 *
 * Events handled:
 *  - checkout.session.completed       → grant access on first checkout
 *  - customer.subscription.updated    → keep tier/active flag in sync
 *  - customer.subscription.deleted    → downgrade to basic
 *  - invoice.payment_succeeded        → log recurring payment
 *  - invoice.payment_failed           → mark subscription inactive
 */

// Service-role client (server-only, bypasses RLS). Do not import this elsewhere.
function adminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

async function resolveUserId(
  subscription: Stripe.Subscription | null,
  session?: Stripe.Checkout.Session
): Promise<string | null> {
  // Priority 1: metadata on the subscription (we set it at checkout)
  const fromSub = subscription?.metadata?.user_id;
  if (fromSub) return fromSub;

  // Priority 2: client_reference_id / metadata on the session
  if (session?.client_reference_id) return session.client_reference_id;
  if (session?.metadata?.user_id) return session.metadata.user_id;

  // Priority 3: look up by stripe_customer_id in our DB
  const customerId =
    (typeof subscription?.customer === 'string'
      ? subscription.customer
      : subscription?.customer?.id) ||
    (typeof session?.customer === 'string'
      ? session.customer
      : session?.customer?.id);

  if (!customerId) return null;
  const { data } = await adminSupabase()
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();
  return data?.id ?? null;
}

function priceIdFromSubscription(sub: Stripe.Subscription): string | null {
  return sub.items?.data?.[0]?.price?.id ?? null;
}

async function upsertSubscriptionState(
  subscription: Stripe.Subscription,
  session?: Stripe.Checkout.Session
) {
  const supabase = adminSupabase();
  const userId = await resolveUserId(subscription, session);
  if (!userId) {
    console.error('[webhook] Could not resolve user for subscription', subscription.id);
    return;
  }

  const priceId = priceIdFromSubscription(subscription);
  const plan = planFromPriceId(priceId);
  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id;

  // A subscription is "active" if Stripe reports active or trialing.
  const active =
    subscription.status === 'active' || subscription.status === 'trialing';

  const tier = active ? PAID_TIER : FREE_TIER;

  const { error } = await supabase
    .from('users')
    .update({
      stripe_customer_id: customerId ?? null,
      subscription_active: active,
      tier,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error('[webhook] users update failed:', error);
  }

  console.log(
    `[webhook] user ${userId} → tier=${tier} active=${active} plan=${plan}`
  );
}

async function recordPayment(
  invoice: Stripe.Invoice,
  status: 'succeeded' | 'failed'
) {
  const supabase = adminSupabase();
  const customerId =
    typeof invoice.customer === 'string'
      ? invoice.customer
      : invoice.customer?.id;
  if (!customerId) return;

  const { data: profile } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();
  if (!profile) return;

  // The `clover` API (2025-11-17) reshuffled invoice fields. Read the
  // price id and subscription id defensively from either the legacy or
  // the newer location.
  const firstLine: any = invoice.lines?.data?.[0];
  const priceId: string | null =
    firstLine?.price?.id ??
    firstLine?.pricing?.price_details?.price ??
    null;
  const plan = planFromPriceId(priceId);

  const inv: any = invoice;
  const subId: string | null =
    (typeof inv.subscription === 'string'
      ? inv.subscription
      : inv.subscription?.id) ??
    inv.parent?.subscription_details?.subscription ??
    null;

  const { error } = await supabase.from('payments').insert({
    user_id: profile.id,
    amount: invoice.amount_paid ?? invoice.amount_due ?? 0,
    currency: (invoice.currency ?? 'usd').toUpperCase(),
    provider: 'stripe',
    provider_payment_id: invoice.id,
    status,
    tier: PAID_TIER,
    metadata: {
      invoice_id: invoice.id,
      subscription_id: subId,
      price_id: priceId,
      plan,
    },
  });

  if (error) {
    console.error('[webhook] payments insert failed:', error);
  }
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return new NextResponse('STRIPE_WEBHOOK_SECRET not configured', {
      status: 500,
    });
  }

  const rawBody = await req.arrayBuffer();
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return new NextResponse('Missing stripe-signature header', { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      Buffer.from(rawBody),
      signature,
      webhookSecret
    );
  } catch (err: any) {
    console.error('[webhook] signature verification failed:', err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== 'subscription') break;
        const subId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id;
        if (!subId) break;
        const subscription = await stripe.subscriptions.retrieve(subId);
        await upsertSubscriptionState(subscription, session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await upsertSubscriptionState(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await recordPayment(invoice, 'succeeded');
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await recordPayment(invoice, 'failed');
        // Also flip active=false if the subscription is now past_due/unpaid
        const inv: any = invoice;
        const subId: string | null =
          (typeof inv.subscription === 'string'
            ? inv.subscription
            : inv.subscription?.id) ??
          inv.parent?.subscription_details?.subscription ??
          null;
        if (subId) {
          const subscription = await stripe.subscriptions.retrieve(subId);
          await upsertSubscriptionState(subscription);
        }
        break;
      }

      default:
        // Silently ignore other events
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('[webhook] handler error:', err);
    return new NextResponse('Webhook handler error', { status: 500 });
  }
}

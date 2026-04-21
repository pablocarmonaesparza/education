import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

type Plan = 'monthly' | 'yearly';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

function planFromPriceId(priceId: string | null | undefined): Plan | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_MONTHLY) return 'monthly';
  if (priceId === process.env.STRIPE_PRICE_YEARLY) return 'yearly';
  return null;
}

function isActiveStatus(status: Stripe.Subscription.Status): boolean {
  return status === 'active' || status === 'trialing';
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return new NextResponse('Stripe webhook secret not set.', { status: 500 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-11-17.clover',
  });

  const buf = await req.arrayBuffer();
  const sig = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(Buffer.from(buf), sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabase = adminClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id || session.client_reference_id;
        if (!userId) {
          console.error('checkout.session.completed sin user_id', session.id);
          break;
        }

        const subscriptionId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id ?? null;
        const customerId =
          typeof session.customer === 'string'
            ? session.customer
            : session.customer?.id ?? null;

        let plan: Plan | null = (session.metadata?.plan as Plan) ?? null;
        let status: Stripe.Subscription.Status | null = null;
        let currentPeriodEnd: number | null = null;

        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          status = sub.status;
          currentPeriodEnd = (sub as any).current_period_end ?? null;
          if (!plan) plan = planFromPriceId(sub.items.data[0]?.price.id);
        }

        await supabase
          .from('users')
          .update({
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            subscription_status: status ?? 'active',
            subscription_plan: plan,
            subscription_active: status ? isActiveStatus(status) : true,
            current_period_end: currentPeriodEnd
              ? new Date(currentPeriodEnd * 1000).toISOString()
              : null,
            tier: 'personalized',
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.user_id;
        if (!userId) {
          console.warn(`${event.type} sin user_id en metadata`, sub.id);
          break;
        }

        const plan = planFromPriceId(sub.items.data[0]?.price.id);
        const periodEnd = (sub as any).current_period_end as number | undefined;

        await supabase
          .from('users')
          .update({
            stripe_subscription_id: sub.id,
            subscription_status: sub.status,
            subscription_plan: plan,
            subscription_active: isActiveStatus(sub.status),
            current_period_end: periodEnd
              ? new Date(periodEnd * 1000).toISOString()
              : null,
            tier: isActiveStatus(sub.status) ? 'personalized' : 'basic',
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.user_id;
        if (!userId) {
          console.warn('customer.subscription.deleted sin user_id', sub.id);
          break;
        }

        await supabase
          .from('users')
          .update({
            subscription_status: 'canceled',
            subscription_active: false,
            tier: 'basic',
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId =
          typeof (invoice as any).subscription === 'string'
            ? (invoice as any).subscription
            : (invoice as any).subscription?.id ?? null;
        if (!subscriptionId) break;

        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const userId = sub.metadata?.user_id;
        if (!userId) break;

        await supabase
          .from('users')
          .update({
            subscription_status: sub.status,
            subscription_active: isActiveStatus(sub.status),
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);
        break;
      }

      default:
        // no-op para eventos no manejados (se logueó la firma válida)
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error handling Stripe webhook:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

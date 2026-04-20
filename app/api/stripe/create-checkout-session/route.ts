import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe, STRIPE_PRICES, type BillingPlan } from '@/lib/stripe/config';

/**
 * Creates a Stripe Checkout Session for a subscription.
 *
 * Body: { plan: 'monthly' | 'yearly' }
 * Auth: requires a signed-in Supabase user.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const plan: BillingPlan = body.plan;

    if (plan !== 'monthly' && plan !== 'yearly') {
      return NextResponse.json(
        { error: 'Plan inválido. Usa "monthly" o "yearly".' },
        { status: 400 }
      );
    }

    const priceId = STRIPE_PRICES[plan];
    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID no configurado en el servidor.' },
        { status: 500 }
      );
    }

    // Ensure the public.users row exists so the webhook can update it
    // when Stripe fires `checkout.session.completed`.
    const { error: upsertError } = await supabase
      .from('users')
      .upsert(
        {
          id: user.id,
          email: user.email ?? '',
          name: user.user_metadata?.name ?? 'Usuario',
        },
        { onConflict: 'id', ignoreDuplicates: false }
      );
    if (upsertError) {
      console.error('[stripe/checkout] users upsert error:', upsertError);
    }

    // Look up existing Stripe customer to avoid duplicates on re-checkout
    const { data: profile } = await supabase
      .from('users')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .maybeSingle();

    const origin = req.nextUrl.origin;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      // Reuse customer if we already have one, otherwise let Stripe create it
      ...(profile?.stripe_customer_id
        ? { customer: profile.stripe_customer_id }
        : { customer_email: user.email ?? profile?.email ?? undefined }),
      // client_reference_id lets the webhook map the session back to our user
      client_reference_id: user.id,
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan,
        },
      },
      metadata: {
        user_id: user.id,
        plan,
      },
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?canceled=1`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ sessionUrl: session.url });
  } catch (error: any) {
    console.error('[stripe/checkout] error:', error);
    return NextResponse.json(
      { error: error.message || 'Error creando sesión de pago.' },
      { status: 500 }
    );
  }
}

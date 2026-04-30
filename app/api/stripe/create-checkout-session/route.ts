import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe, STRIPE_PRICES, type BillingPlan } from '@/lib/stripe/config';
import { enforceRateLimit, rateLimiters } from '@/lib/ratelimit';

export async function POST(req: NextRequest) {
  try {
    const blocked = await enforceRateLimit(req, rateLimiters.checkout);
    if (blocked) return blocked;

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'no autenticado' }, { status: 401 });
    }

    const { plan } = (await req.json()) as { plan?: BillingPlan };
    if (plan !== 'monthly' && plan !== 'yearly') {
      return NextResponse.json({ error: 'plan inválido' }, { status: 400 });
    }

    const priceId = STRIPE_PRICES[plan];
    if (!priceId) {
      return NextResponse.json({ error: 'price id no configurado' }, { status: 500 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('stripe_customer_id, subscription_active, subscription_status')
      .eq('id', user.id)
      .maybeSingle();

    // Fail-closed: si Supabase falla (RLS, red, tabla), no creamos checkout.
    // Prefiero error visible que crear un segundo customer a la chica.
    if (profileError) {
      console.error('[create-checkout] profile select failed:', profileError.message);
      return NextResponse.json(
        { error: 'no pudimos validar tu cuenta — reintenta en unos segundos.' },
        { status: 503 }
      );
    }

    // Guard: si el user ya tiene una suscripción activa, no dejamos abrir
    // un segundo checkout. Para cambiar plan (mensual ↔ anual) se usa el
    // Customer Portal desde /dashboard/perfil. Esto también previene que
    // dos tabs o un doble-click creen dos customers/suscripciones.
    if (profile?.subscription_active) {
      return NextResponse.json(
        {
          error: 'ya_tienes_suscripcion_activa',
          message:
            'ya tienes una suscripción activa — cambia de plan desde "mi suscripción" en tu perfil.',
        },
        { status: 409 }
      );
    }

    const origin = req.nextUrl.origin;
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      ...(profile?.stripe_customer_id
        ? { customer: profile.stripe_customer_id }
        : { customer_email: user.email ?? undefined }),
      client_reference_id: user.id,
      metadata: { user_id: user.id, plan },
      subscription_data: {
        metadata: { user_id: user.id, plan },
      },
      allow_promotion_codes: true,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel`,
    });

    return NextResponse.json({ sessionUrl: session.url });
  } catch (error: any) {
    console.error('Error creating Stripe checkout session:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

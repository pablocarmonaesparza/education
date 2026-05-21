import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { stripe, STRIPE_PRICES, type BillingPlan } from '@/lib/stripe/config';
import { enforceRateLimit, rateLimiters } from '@/lib/ratelimit';
import {
  computeSimuladorAmount,
  SIMULADOR_PRODUCT,
} from '@/lib/simulador/billing';

export async function POST(req: NextRequest) {
  try {
    const blocked = await enforceRateLimit(req, rateLimiters.checkout);
    if (blocked) return blocked;

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'no autenticado' }, { status: 401 });
    }

    const body = (await req.json()) as {
      plan?: BillingPlan;
      billing_product?: string;
      organization_id?: string;
      team_id?: string;
      seats?: number;
    };

    if (body.billing_product === 'simulador_b2b') {
      return createSimuladorCheckoutSession(req, user, body);
    }

    const { plan } = body as { plan?: BillingPlan };
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

async function createSimuladorCheckoutSession(
  req: NextRequest,
  user: { id: string; email?: string | null },
  body: {
    plan?: BillingPlan;
    organization_id?: string;
    team_id?: string;
    seats?: number;
  },
) {
  try {
    if (!body.organization_id || !body.team_id) {
      return NextResponse.json(
        { error: 'organization_id y team_id son requeridos' },
        { status: 400 },
      );
    }

    const admin = createAdminClient();
    const { data: bridgeId, error: bridgeError } = await admin
      .schema('simulador')
      .rpc('ensure_bridge_user', { p_auth_user_id: user.id });

    if (bridgeError || !bridgeId) {
      console.error('[create-checkout] ensure_bridge_user failed:', bridgeError);
      return NextResponse.json(
        { error: 'No pudimos sincronizar tu cuenta.' },
        { status: 500 },
      );
    }

    const { data: membership } = await admin
      .schema('simulador')
      .from('organization_memberships')
      .select('role')
      .eq('organization_id', body.organization_id)
      .eq('user_id', bridgeId)
      .eq('role', 'org_admin')
      .maybeSingle();

    if (!membership) {
      return NextResponse.json(
        { error: 'Solo un org_admin puede iniciar checkout.' },
        { status: 403 },
      );
    }

    const { data: activeSubscription } = await admin
      .schema('simulador')
      .from('subscriptions')
      .select('id, tier, seats, current_period_end')
      .eq('organization_id', body.organization_id)
      .in('status', ['active', 'trial'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (activeSubscription?.id) {
      return NextResponse.json(
        {
          error: 'ya_tienes_plan_activo',
          message:
            'Tu organización ya tiene un plan activo. Escríbenos a ventas@itera.la para ampliar o cambiar de tier.',
        },
        { status: 409 },
      );
    }

    const { data: team } = await admin
      .schema('simulador')
      .from('teams')
      .select('id, name, organization_id')
      .eq('id', body.team_id)
      .maybeSingle();

    if (!team || team.organization_id !== body.organization_id) {
      return NextResponse.json(
        { error: 'El equipo no pertenece a esta organización.' },
        { status: 400 },
      );
    }

    const { data: org } = await admin
      .schema('simulador')
      .from('organizations')
      .select('name')
      .eq('id', body.organization_id)
      .maybeSingle();

    const { seats, amountCents, amountUsd, tier, isEnterprise } =
      computeSimuladorAmount(body.seats);

    // Enterprise (100+ personas) no es self-serve — el flow se corta y se
    // redirige a ventas para negociar volumen/término.
    if (isEnterprise) {
      return NextResponse.json(
        {
          error: 'enterprise_requires_sales',
          message: `Para ${seats}+ personas el precio se negocia. Escríbenos a ${SIMULADOR_PRODUCT.salesEmail}.`,
          sales_email: SIMULADOR_PRODUCT.salesEmail,
        },
        { status: 400 },
      );
    }

    const origin = req.nextUrl.origin;
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: user.email ?? undefined,
      customer_creation: 'always',
      client_reference_id: user.id,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: amountCents,
            product_data: {
              name: `${SIMULADOR_PRODUCT.label} · ${tier.label}`,
              description: `${seats} ${seats === 1 ? 'persona' : 'personas'} · ${org?.name ?? 'organización'} · ${team.name}`,
            },
          },
        },
      ],
      allow_promotion_codes: false,
      metadata: {
        billing_product: 'simulador_b2b',
        user_id: user.id,
        simulador_user_id: String(bridgeId),
        organization_id: body.organization_id,
        organization_name: org?.name ?? '',
        team_id: body.team_id,
        team_name: team.name,
        tier: tier.id,
        seats: String(seats),
        price_per_seat_usd: String(tier.pricePerSeatUsd),
        amount_usd_total: String(amountUsd),
      },
      payment_intent_data: {
        metadata: {
          billing_product: 'simulador_b2b',
          user_id: user.id,
          simulador_user_id: String(bridgeId),
          organization_id: body.organization_id,
          team_id: body.team_id,
          tier: tier.id,
          seats: String(seats),
        },
      },
      success_url: `${origin}/onboarding/done?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/onboarding/billing?canceled=1`,
    });

    return NextResponse.json({
      sessionUrl: session.url,
      amount_usd_total: amountUsd,
      seats,
      tier: tier.id,
    });
  } catch (err) {
    console.error('[create-checkout] simulador session failed:', err);
    return NextResponse.json(
      { error: 'No pudimos crear la sesión de pago. Reintenta en unos segundos.' },
      { status: 500 },
    );
  }
}

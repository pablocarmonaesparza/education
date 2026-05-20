import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { stripe } from '@/lib/stripe/config';
import { enforceRateLimit, rateLimiters } from '@/lib/ratelimit';
import {
  computePlanAmountUsd,
  isSimuladorBillingPlan,
  type SimuladorBillingPlan,
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
      plan?: SimuladorBillingPlan;
      billing_product?: string;
      organization_id?: string;
      team_id?: string;
      seats?: number;
    };

    if (body.billing_product !== 'simulador_b2b') {
      return NextResponse.json(
        { error: 'billing legacy removido; usa billing_product=simulador_b2b' },
        { status: 400 },
      );
    }

    return createSimuladorCheckoutSession(req, user, body);
  } catch (error: any) {
    console.error('Error creating Stripe checkout session:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function createSimuladorCheckoutSession(
  req: NextRequest,
  user: { id: string; email?: string | null },
  body: {
    plan?: SimuladorBillingPlan;
    organization_id?: string;
    team_id?: string;
    seats?: number;
  },
) {
  try {
    if (!isSimuladorBillingPlan(body.plan)) {
      return NextResponse.json({ error: 'plan de simulador inválido' }, { status: 400 });
    }
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

    const { seats, amountCents, amountUsd, plan } = computePlanAmountUsd(
      body.plan,
      body.seats,
    );
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
              name: `Itera · ${plan.label}`,
              description: `${seats} asientos · ${org?.name ?? 'organización'} · ${team.name}`,
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
        plan: plan.id,
        seats: String(seats),
        amount_usd_total: String(amountUsd),
      },
      payment_intent_data: {
        metadata: {
          billing_product: 'simulador_b2b',
          user_id: user.id,
          simulador_user_id: String(bridgeId),
          organization_id: body.organization_id,
          team_id: body.team_id,
          plan: plan.id,
          seats: String(seats),
        },
      },
      success_url: `${origin}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard?checkout=canceled`,
    });

    return NextResponse.json({
      sessionUrl: session.url,
      amount_usd_total: amountUsd,
      seats,
      plan: plan.id,
    });
  } catch (err) {
    console.error('[create-checkout] simulador session failed:', err);
    return NextResponse.json(
      { error: 'No pudimos crear la sesión de pago. Reintenta en unos segundos.' },
      { status: 500 },
    );
  }
}

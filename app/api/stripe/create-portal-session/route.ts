import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { stripe } from '@/lib/stripe/config';
import { enforceRateLimit, rateLimiters } from '@/lib/ratelimit';

/**
 * Stripe Customer Portal session. Redirige al usuario al portal hosted
 * por Stripe donde puede:
 *   - ver sus facturas
 *   - actualizar método de pago
 *   - cambiar plan (mensual ↔ anual con prorata)
 *   - cancelar la suscripción
 *
 * El portal está configurado desde Stripe Dashboard → Settings → Billing →
 * Customer portal. Ahí se definen qué acciones se permiten.
 */
export async function POST(req: NextRequest) {
  try {
    const blocked = await enforceRateLimit(req, rateLimiters.standard);
    if (blocked) return blocked;

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: bridgeId, error: bridgeError } = await admin
      .schema('simulador')
      .rpc('ensure_bridge_user', { p_auth_user_id: user.id });

    if (bridgeError || !bridgeId) {
      console.error('[create-portal] ensure_bridge_user failed:', bridgeError);
      return NextResponse.json(
        { error: 'We could not sync your account.' },
        { status: 500 },
      );
    }

    const { data: membership } = await admin
      .schema('simulador')
      .from('organization_memberships')
      .select('organization_id, role')
      .eq('user_id', bridgeId)
      .eq('role', 'org_admin')
      .limit(1)
      .maybeSingle();

    if (!membership?.organization_id) {
      return NextResponse.json(
        { error: 'Only an org_admin can manage the subscription.' },
        { status: 403 },
      );
    }

    const { data: subscription } = await admin
      .schema('simulador')
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('organization_id', membership.organization_id)
      .in('status', ['active', 'trial'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No active subscription.' },
        { status: 400 },
      );
    }

    const body = await req.json().catch(() => ({} as { return_path?: unknown }));
    const origin = req.nextUrl.origin;
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${origin}${safeReturnPath(body.return_path)}`,
    });

    return NextResponse.json({ sessionUrl: session.url });
  } catch (error: any) {
    console.error('Error creating Stripe portal session:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function safeReturnPath(value: unknown) {
  if (typeof value !== 'string') return '/empresa';
  if (!value.startsWith('/')) return '/empresa';
  if (value.startsWith('//')) return '/empresa';

  const [path] = value.split('?');
  const allowed = new Set(['/empresa', '/dashboard', '/perfil', '/onboarding/billing']);
  return allowed.has(path) ? value : '/empresa';
}

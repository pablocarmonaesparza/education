import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/config';

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
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'no autenticado' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'sin suscripción activa' },
        { status: 400 }
      );
    }

    const origin = req.nextUrl.origin;
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${origin}/dashboard/perfil`,
    });

    return NextResponse.json({ sessionUrl: session.url });
  } catch (error: any) {
    console.error('Error creating Stripe portal session:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

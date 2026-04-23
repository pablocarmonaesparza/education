import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendWelcome } from '@/lib/email/send';

/**
 * Endpoint manual para disparar el correo de bienvenida al usuario
 * autenticado. Útil para re-envíos y testing. El callback de auth llama
 * directamente a `sendWelcome` cuando detecta un signup nuevo.
 *
 * Sin idempotencia: este endpoint es intencionalmente re-disparable. Para
 * idempotencia en el flujo real (signup + checkout), coordinar con
 * Onboarding O3 para añadir `users.welcome_email_sent_at`.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const { origin } = new URL(request.url);
  const result = await sendWelcome({
    to: user.email,
    userName: user.user_metadata?.name || user.email.split('@')[0] || 'hola',
    origin,
  });

  // Contrato del módulo: correos son nice-to-have. Si el envío falla (ESP
  // no configurado, throttle, etc.) devolvemos 200 con skipped para no
  // inducir al caller a tratar el fail como error crítico. La razón viene
  // en el body para telemetría.
  if (!result.ok) {
    return NextResponse.json({ ok: false, skipped: true, reason: result.reason });
  }
  return NextResponse.json(result);
}

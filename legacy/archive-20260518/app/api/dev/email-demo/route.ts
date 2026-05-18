import { NextResponse } from 'next/server';
import { render } from '@react-email/render';
import WelcomeEmail from '@/emails/WelcomeEmail';

export const runtime = 'nodejs';

/**
 * DEV-ONLY endpoint para mandar un demo del welcome email a cualquier
 * dirección. Útil para que Pablo vea el template en su inbox sin tener que
 * signupear + confirmar.
 *
 * Uso:
 *   GET /api/dev/email-demo?to=pablo@itera.la&name=Pablo
 *
 * Transport: AgentMail HTTP API directo (sin el SDK — este endpoint es
 * debug/demo, el wire real de producción vive en lib/email/send.ts). El
 * inbox default es itera@agentmail.to; custom domain mail.itera.la es
 * opcional via el setup DNS en docs/EMAIL_DNS_SETUP.md.
 *
 * Gate:
 *   - NODE_ENV === 'development' en local.
 *   - En cualquier otro env requiere DEV_AUTO_LOGIN_SECRET (reutilizamos el
 *     mismo secret que /api/dev/auto-login) vía ?secret=... o header
 *     x-preview-secret.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const isDev = process.env.NODE_ENV === 'development';
  const secret = process.env.DEV_AUTO_LOGIN_SECRET?.trim();
  const provided =
    url.searchParams.get('secret')?.trim() ||
    request.headers.get('x-preview-secret')?.trim();

  if (!isDev) {
    if (!secret || !provided || provided !== secret) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
  }

  const to = url.searchParams.get('to');
  const name = url.searchParams.get('name') || 'Pablo';
  if (!to || !to.includes('@')) {
    return NextResponse.json({ error: 'missing_or_invalid_to' }, { status: 400 });
  }

  const agentMailKey = process.env.AGENTMAIL_API_KEY;
  const inboxId = process.env.AGENTMAIL_INBOX_ID;
  if (!agentMailKey || !inboxId) {
    return NextResponse.json(
      { ok: false, reason: 'agentmail_not_configured' },
      { status: 500 }
    );
  }

  try {
    const element = WelcomeEmail({
      userName: name,
      dashboardUrl: `${url.origin}/dashboard`,
    });
    const html = await render(element);
    const text = await render(element, { plainText: true });

    const response = await fetch(
      `https://api.agentmail.to/v0/inboxes/${encodeURIComponent(inboxId)}/messages/send`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${agentMailKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: [to],
          subject: 'bienvenido a itera — tu proyecto arranca hoy',
          html,
          text,
        }),
      }
    );

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json(
        { ok: false, status: response.status, body },
        { status: 500 }
      );
    }
    return NextResponse.json({ ok: true, to, inboxId, body });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

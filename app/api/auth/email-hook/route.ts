import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { render } from '@react-email/render';
import {
  getAgentMail,
  getDefaultInboxId,
  getReplyToAddress,
} from '@/lib/email/agentmail';
import PasswordResetEmail from '@/emails/PasswordResetEmail';
import AuthActionEmail, { type AuthActionVariant } from '@/emails/AuthActionEmail';

export const runtime = 'nodejs';

/**
 * Supabase Auth "Send Email" webhook.
 *
 * Se configura en Supabase Dashboard → Authentication → Hooks → "Send Email":
 *   - URL: https://itera.la/api/auth/email-hook
 *   - Secret: SUPABASE_AUTH_HOOK_SECRET (string con prefijo `v1,whsec_<base64>`
 *     tal como Supabase lo genera en el dashboard — NO hex)
 *
 * Supabase firma con el formato "Standard Webhooks" (id, timestamp, signature
 * base64 en headers `webhook-id`, `webhook-timestamp`, `webhook-signature`).
 * El hash se hace con el valor base64 raw detrás del prefijo `v1,whsec_`.
 *
 * CONTRATO: este endpoint NUNCA devuelve 5xx por fallos de ESP/render. La
 * auth flow se rompe si tiramos 500 — Supabase lo interpreta como "reintenta"
 * y el user queda en loop. Solo 401 si la firma falla (eso sí debe frenar).
 */

// Ventana aceptada para `webhook-timestamp` — 5 minutos. Más allá, rechazamos
// por replay. Recomendación de Standard Webhooks.
const TIMESTAMP_TOLERANCE_SECONDS = 5 * 60;

interface EmailHookPayload {
  user?: { email?: string; user_metadata?: Record<string, unknown> };
  email_data?: {
    token?: string;
    token_hash?: string;
    token_new?: string;
    token_hash_new?: string;
    redirect_to?: string;
    email_action_type?:
      | 'signup'
      | 'invite'
      | 'magiclink'
      | 'recovery'
      | 'email_change';
    site_url?: string;
  };
}

function verifySignature(
  rawBody: string,
  headers: Headers
): { ok: true } | { ok: false; reason: string } {
  const secret = process.env.SUPABASE_AUTH_HOOK_SECRET;
  if (!secret) return { ok: false, reason: 'hook_secret_not_configured' };

  const webhookId = headers.get('webhook-id');
  const webhookTimestamp = headers.get('webhook-timestamp');
  const webhookSignature = headers.get('webhook-signature');

  if (!webhookId || !webhookTimestamp || !webhookSignature) {
    return { ok: false, reason: 'missing_webhook_headers' };
  }

  // Rechazar timestamps fuera de la ventana de tolerancia (replay defense).
  const tsSeconds = Number.parseInt(webhookTimestamp, 10);
  if (!Number.isFinite(tsSeconds)) {
    return { ok: false, reason: 'invalid_timestamp_header' };
  }
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSeconds - tsSeconds) > TIMESTAMP_TOLERANCE_SECONDS) {
    return { ok: false, reason: 'timestamp_outside_tolerance' };
  }

  // Secret en dashboard: `v1,whsec_<base64>`. Hash sobre el base64 raw.
  const secretRaw = secret.startsWith('v1,whsec_')
    ? secret.slice('v1,whsec_'.length)
    : secret.startsWith('whsec_')
      ? secret.slice('whsec_'.length)
      : secret;
  const keyBytes = Buffer.from(secretRaw, 'base64');

  const signedPayload = `${webhookId}.${webhookTimestamp}.${rawBody}`;
  const expected = crypto
    .createHmac('sha256', keyBytes)
    .update(signedPayload)
    .digest('base64');
  const expectedBuf = Buffer.from(expected, 'base64');

  // webhook-signature header puede traer varias firmas separadas por espacio,
  // formato `v1,<sig>`. Aceptamos si alguna coincide (timing-safe).
  const candidates = webhookSignature
    .split(' ')
    .map((p) => p.trim())
    .map((p) => (p.startsWith('v1,') ? p.slice('v1,'.length) : p));

  const ok = candidates.some((sig) => {
    try {
      const sigBuf = Buffer.from(sig, 'base64');
      if (sigBuf.length !== expectedBuf.length) return false;
      return crypto.timingSafeEqual(sigBuf, expectedBuf);
    } catch {
      return false;
    }
  });

  return ok ? { ok: true } : { ok: false, reason: 'signature_mismatch' };
}

function buildConfirmUrl(
  siteUrl: string,
  tokenHash: string,
  type: string,
  redirectTo?: string
): string {
  const base = siteUrl.replace(/\/$/, '');
  const params = new URLSearchParams({ token_hash: tokenHash, type });
  if (redirectTo) params.set('next', redirectTo);
  return `${base}/auth/confirm?${params.toString()}`;
}

export async function POST(req: Request) {
  const rawBody = await req.text();

  const verification = verifySignature(rawBody, req.headers);
  if (!verification.ok) {
    console.error('[auth/email-hook] verify failed:', verification.reason);
    // 401 — firma inválida es la única razón legítima para bloquear el flow.
    return NextResponse.json(
      { error: verification.reason },
      { status: 401 }
    );
  }

  let payload: EmailHookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ skipped: true, reason: 'invalid_json' });
  }

  const email = payload.user?.email;
  const actionType = payload.email_data?.email_action_type;
  const tokenHash = payload.email_data?.token_hash;
  const siteUrl = payload.email_data?.site_url || process.env.NEXT_PUBLIC_APP_URL;
  const redirectTo = payload.email_data?.redirect_to;
  const userName =
    (payload.user?.user_metadata?.name as string | undefined) ||
    email?.split('@')[0] ||
    'hola';

  if (!email || !actionType || !tokenHash || !siteUrl) {
    console.warn('[auth/email-hook] payload incompleto, skip:', {
      hasEmail: !!email,
      actionType,
      hasTokenHash: !!tokenHash,
    });
    return NextResponse.json({ skipped: true, reason: 'incomplete_payload' });
  }

  const client = getAgentMail();
  const inboxId = getDefaultInboxId();
  if (!client || !inboxId) {
    console.warn('[auth/email-hook] AgentMail no configurado, skip send');
    return NextResponse.json({ skipped: true, reason: 'no_agentmail_config' });
  }

  try {
    let subject: string;
    let element: React.ReactElement;

    switch (actionType) {
      case 'recovery': {
        const resetUrl = buildConfirmUrl(
          siteUrl,
          tokenHash,
          'recovery',
          redirectTo
        );
        subject = 'restablece tu contraseña de itera';
        element = PasswordResetEmail({ userName, resetUrl });
        break;
      }
      case 'signup': {
        const actionUrl = buildConfirmUrl(siteUrl, tokenHash, 'email', redirectTo);
        subject = 'confirma tu correo — itera';
        element = AuthActionEmail({
          userName,
          actionUrl,
          variant: 'signup' as AuthActionVariant,
        });
        break;
      }
      case 'magiclink': {
        const actionUrl = buildConfirmUrl(
          siteUrl,
          tokenHash,
          'magiclink',
          redirectTo
        );
        subject = 'tu link para entrar a itera';
        element = AuthActionEmail({
          userName,
          actionUrl,
          variant: 'magiclink' as AuthActionVariant,
        });
        break;
      }
      case 'email_change': {
        const actionUrl = buildConfirmUrl(
          siteUrl,
          tokenHash,
          'email_change',
          redirectTo
        );
        subject = 'confirma tu nuevo correo — itera';
        element = AuthActionEmail({
          userName,
          actionUrl,
          variant: 'email_change' as AuthActionVariant,
        });
        break;
      }
      case 'invite':
      default: {
        // Para invite y tipos futuros no tenemos template dedicado. Skip
        // silencioso — si Pablo quiere manejarlos, caen al SMTP default de
        // Supabase con los templates del dashboard (si custom SMTP está off).
        console.log(`[auth/email-hook] ${actionType} no manejado, skip`);
        return NextResponse.json({ skipped: true, actionType });
      }
    }

    const html = await render(element);
    const text = await render(element, { plainText: true });

    const response = await client.inboxes.messages.send(inboxId, {
      to: [email],
      replyTo: [getReplyToAddress()],
      subject,
      html,
      text,
      labels: [`kind:auth_${actionType}`],
    });

    const id =
      (response as { messageId?: string; id?: string })?.messageId ??
      (response as { id?: string })?.id ??
      null;

    return NextResponse.json({ ok: true, id, actionType });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error('[auth/email-hook] threw:', message);
    // 200 con skipped — email no debe romper auth.
    return NextResponse.json({
      skipped: true,
      reason: 'render_or_send_threw',
      detail: message,
    });
  }
}

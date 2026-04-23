import { render } from '@react-email/render';
import {
  getAgentMail,
  getDefaultInboxId,
  getReplyToAddress,
} from './agentmail';
import WelcomeEmail from '@/emails/WelcomeEmail';
import PasswordResetEmail from '@/emails/PasswordResetEmail';
import FirstLessonEmail from '@/emails/FirstLessonEmail';
import PaymentReceiptEmail from '@/emails/PaymentReceiptEmail';
import FailedChargeEmail from '@/emails/FailedChargeEmail';

export type SendResult =
  | { ok: true; id: string }
  | { ok: false; reason: string };

type TransactionalKind =
  | 'welcome'
  | 'password_reset'
  | 'first_lesson'
  | 'payment_receipt'
  | 'failed_charge';

/**
 * Dispatcher interno. Renderiza el template React Email → HTML + texto plano
 * y lo manda vía AgentMail. Nunca lanza: los errores se devuelven como
 * `{ ok: false }` para que el caller decida si bloquea (casi nunca) o sigue.
 *
 * El `from` viene del inbox configurado en AgentMail — no lo controlamos
 * desde aquí. Para cambiar sender (p.ej. hola@mail.itera.la después de
 * configurar custom domain), ajustar el inbox en el dashboard AgentMail o
 * crear uno nuevo y actualizar AGENTMAIL_INBOX_ID.
 *
 * Tags no son soportados por AgentMail hoy — los guardamos en el subject-
 * agnostic `kind` via metadata si el SDK lo expone; por ahora solo log.
 */
async function dispatch(
  kind: TransactionalKind,
  subject: string,
  to: string,
  element: React.ReactElement
): Promise<SendResult> {
  const client = getAgentMail();
  const inboxId = getDefaultInboxId();
  if (!client || !inboxId) {
    console.warn(
      `[email/send] AgentMail no configurado (AGENTMAIL_API_KEY/AGENTMAIL_INBOX_ID); skipping ${kind}`
    );
    return { ok: false, reason: 'not_configured' };
  }

  try {
    const html = await render(element);
    const text = await render(element, { plainText: true });

    const response = await client.inboxes.messages.send(inboxId, {
      to: [to],
      replyTo: [getReplyToAddress()],
      subject,
      html,
      text,
      labels: [`kind:${kind}`],
    });

    // El SDK devuelve distintos shapes según versión — cubrimos ambos.
    const id =
      (response as { messageId?: string; id?: string })?.messageId ??
      (response as { id?: string })?.id ??
      null;

    if (!id) {
      console.warn(`[email/send] ${kind} sent pero sin id en response`);
      return { ok: true, id: 'unknown' };
    }
    return { ok: true, id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error(`[email/send] ${kind} error:`, message);
    return { ok: false, reason: message };
  }
}

// ────────────────────────────────────────────────────────────────
// High-level helpers — una función por template. Cada caller pasa
// solo los datos de dominio; el template + subject + wiring viven aquí.
// ────────────────────────────────────────────────────────────────

export async function sendWelcome(args: {
  to: string;
  userName: string;
  origin: string;
}): Promise<SendResult> {
  return dispatch(
    'welcome',
    'bienvenido a itera — tu proyecto arranca hoy',
    args.to,
    WelcomeEmail({
      userName: args.userName,
      dashboardUrl: `${args.origin}/dashboard`,
    })
  );
}

export async function sendPasswordReset(args: {
  to: string;
  userName?: string;
  resetUrl: string;
  expiresInMinutes?: number;
}): Promise<SendResult> {
  return dispatch(
    'password_reset',
    'restablece tu contraseña de itera',
    args.to,
    PasswordResetEmail({
      userName: args.userName,
      resetUrl: args.resetUrl,
      expiresInMinutes: args.expiresInMinutes,
    })
  );
}

export async function sendFirstLesson(args: {
  to: string;
  userName: string;
  lessonTitle: string;
  nextLessonUrl: string;
  nextLessonTitle?: string;
}): Promise<SendResult> {
  return dispatch(
    'first_lesson',
    'terminaste tu primera lección',
    args.to,
    FirstLessonEmail({
      userName: args.userName,
      lessonTitle: args.lessonTitle,
      nextLessonUrl: args.nextLessonUrl,
      nextLessonTitle: args.nextLessonTitle,
    })
  );
}

export async function sendPaymentReceipt(args: {
  to: string;
  userName?: string;
  amountCents: number;
  currency: string;
  plan: string;
  invoiceNumber?: string | null;
  paidAtIso: string;
  hostedInvoiceUrl?: string | null;
  billingPortalUrl?: string;
}): Promise<SendResult> {
  return dispatch(
    'payment_receipt',
    'recibo de tu pago en itera',
    args.to,
    PaymentReceiptEmail(args)
  );
}

export async function sendFailedCharge(args: {
  to: string;
  userName?: string;
  amountCents: number;
  currency: string;
  nextAttemptIso?: string | null;
  updatePaymentUrl: string;
  attemptCount?: number | null;
}): Promise<SendResult> {
  return dispatch(
    'failed_charge',
    'tu pago en itera no se procesó',
    args.to,
    FailedChargeEmail(args)
  );
}

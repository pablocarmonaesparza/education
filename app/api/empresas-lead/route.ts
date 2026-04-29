import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { enforceRateLimit, rateLimiters } from '@/lib/ratelimit';
import {
  getAgentMail,
  getDefaultInboxId,
  getReplyToAddress,
} from '@/lib/email/agentmail';

/**
 * POST /api/empresas-lead
 *
 * Captura leads B2B desde /empresas. Persiste en `enterprise_leads`
 * (anónimo, sin auth) y manda notificación por email a `hola@itera.la`
 * para que Pablo los vea en su inbox.
 *
 * Diseño:
 *   - Sin auth: el form de /empresas se llena antes de signup. La policy
 *     de RLS en migration 016 permite anon insert pero no select/update.
 *   - Email es nice-to-have: si AgentMail falla, el lead igual queda
 *     persistido. Loguemos el error y devolvemos 200.
 *   - Rate limit standard (30 req/min/IP) para evitar spam abuse.
 *
 * Body: { name, email, company, notes?, questionnaire? }
 */

const MAX_NAME = 120;
const MAX_EMAIL = 254;
const MAX_COMPANY = 200;
const MAX_NOTES = 1000;

function sanitizeText(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function notifyByEmail(args: {
  name: string;
  email: string;
  company: string;
  notes: string;
  questionnaire: Record<string, unknown>;
  leadId: string;
}): Promise<void> {
  const client = getAgentMail();
  const inboxId = getDefaultInboxId();
  if (!client || !inboxId) {
    console.warn(
      '[empresas-lead] AgentMail no configurado; skipping notification email',
    );
    return;
  }

  // Destinatario de la notificación. Configurable via env porque el reply-to
  // default (hola@itera.la) está bouncando en AgentMail. Cualquier inbox
  // que reciba mail (Gmail personal, etc) sirve. Fallback al reply-to si
  // el env var no está definido.
  const to =
    process.env.ENTERPRISE_LEAD_NOTIFY_TO?.trim() || getReplyToAddress();

  const questionnaireRows = Object.entries(args.questionnaire)
    .map(([key, val]) => {
      const valueStr =
        val && typeof val === 'object'
          ? JSON.stringify(val)
          : String(val ?? '');
      return `<tr><td><b>${escapeHtml(key)}</b></td><td>${escapeHtml(valueStr)}</td></tr>`;
    })
    .join('');

  const html = `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px;">
      <h2 style="color: #1472FF;">nuevo lead empresa</h2>
      <p><b>nombre:</b> ${escapeHtml(args.name)}</p>
      <p><b>correo:</b> <a href="mailto:${escapeHtml(args.email)}">${escapeHtml(args.email)}</a></p>
      <p><b>empresa:</b> ${escapeHtml(args.company)}</p>
      ${args.notes ? `<p><b>notas:</b><br>${escapeHtml(args.notes).replace(/\n/g, '<br>')}</p>` : ''}
      ${
        questionnaireRows
          ? `<h3>respuestas del cuestionario</h3><table style="border-collapse: collapse;">${questionnaireRows}</table>`
          : ''
      }
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #ddd;">
      <p style="color: #777; font-size: 12px;">lead id: ${args.leadId}</p>
    </div>
  `;

  const text = [
    'nuevo lead empresa',
    '',
    `nombre: ${args.name}`,
    `correo: ${args.email}`,
    `empresa: ${args.company}`,
    args.notes ? `notas: ${args.notes}` : '',
    '',
    'respuestas:',
    Object.entries(args.questionnaire)
      .map(
        ([k, v]) =>
          `  ${k}: ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`,
      )
      .join('\n'),
    '',
    `lead id: ${args.leadId}`,
  ]
    .filter(Boolean)
    .join('\n');

  try {
    await client.inboxes.messages.send(inboxId, {
      to: [to],
      replyTo: [args.email],
      subject: `lead empresa: ${args.company} (${args.name})`,
      html,
      text,
      labels: ['kind:enterprise_lead'],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error('[empresas-lead] notification email failed:', message);
  }
}

export async function POST(req: NextRequest) {
  const blocked = await enforceRateLimit(req, rateLimiters.standard);
  if (blocked) return blocked;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'invalid_json' },
      { status: 400 },
    );
  }

  const name = sanitizeText(body.name, MAX_NAME);
  const email = sanitizeText(body.email, MAX_EMAIL).toLowerCase();
  const company = sanitizeText(body.company, MAX_COMPANY);
  const notes = sanitizeText(body.notes, MAX_NOTES);
  const questionnaire =
    body.questionnaire && typeof body.questionnaire === 'object'
      ? (body.questionnaire as Record<string, unknown>)
      : {};

  if (!name || !email || !company) {
    return NextResponse.json(
      { ok: false, error: 'missing_required_fields' },
      { status: 400 },
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { ok: false, error: 'invalid_email' },
      { status: 400 },
    );
  }

  // Service role: bypasse RLS para escribir como server-side trusted writer.
  // El endpoint ya valida campos + rate limit, así que el insert es seguro.
  // RLS en select/update/delete sigue protegiendo la PII de lecturas anon.
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('enterprise_leads')
    .insert({
      name,
      email,
      company,
      notes: notes || null,
      questionnaire,
      source: 'empresas-page',
    })
    .select('id')
    .single();

  if (error || !data) {
    console.error('[empresas-lead] insert failed:', error?.message);
    return NextResponse.json(
      { ok: false, error: 'persist_failed' },
      { status: 500 },
    );
  }

  // Notificación por email es best-effort. Si falla, el lead ya quedó
  // persistido y Pablo lo verá en el dashboard cuando lo abra.
  await notifyByEmail({
    name,
    email,
    company,
    notes,
    questionnaire,
    leadId: data.id,
  });

  return NextResponse.json({ ok: true, id: data.id });
}

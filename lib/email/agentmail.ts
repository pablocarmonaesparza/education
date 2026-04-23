import { AgentMailClient } from 'agentmail';

let cached: AgentMailClient | null = null;

/**
 * Cliente AgentMail singleton. Devuelve null si falta la API key — el caller
 * debe manejar el no-op sin romper el flujo. Los correos transaccionales son
 * nice-to-have; un error aquí no debe tumbar signup/checkout/etc.
 */
export function getAgentMail(): AgentMailClient | null {
  if (cached) return cached;
  const apiKey = process.env.AGENTMAIL_API_KEY;
  if (!apiKey) return null;
  cached = new AgentMailClient({ apiKey });
  return cached;
}

/**
 * Inbox ID desde el cual se manda el correo. Se crea en el dashboard de
 * AgentMail (o via MCP `create_inbox`) y se guarda en env. El inbox ya creado
 * para Itera es `itera@agentmail.to`.
 *
 * Cuando Pablo configure custom domain (p.ej. `hola@mail.itera.la`) en
 * AgentMail y apunte el DNS, solo cambia el valor de AGENTMAIL_INBOX_ID.
 */
export function getDefaultInboxId(): string | null {
  return process.env.AGENTMAIL_INBOX_ID || null;
}

/**
 * Reply-to humano. Cuando el user responde un transaccional queremos que
 * caiga en `hola@itera.la` (Google Workspace), no en el inbox de AgentMail.
 */
export function getReplyToAddress(): string {
  return process.env.AGENTMAIL_REPLY_TO || 'hola@itera.la';
}

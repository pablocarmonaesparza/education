import { sendWelcome, type SendResult } from './send';

interface SendWelcomeArgs {
  userEmail: string;
  userName: string;
  origin: string;
}

/**
 * Back-compat shim. Históricamente el welcome era el único correo y este
 * módulo exportaba `sendWelcomeEmail` con firma distinta a `sendWelcome`
 * del dispatcher. Mantenemos el shim para no romper a callers existentes
 * (app/auth/callback/route.ts).
 *
 * Para nuevos callers, preferir `sendWelcome` de `./send.ts`.
 */
export async function sendWelcomeEmail({
  userEmail,
  userName,
  origin,
}: SendWelcomeArgs): Promise<{ ok: boolean; reason?: string; id?: string }> {
  const result: SendResult = await sendWelcome({
    to: userEmail,
    userName,
    origin,
  });

  if (result.ok) {
    return { ok: true, id: result.id };
  }
  return { ok: false, reason: result.reason };
}

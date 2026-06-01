// P2 · Escribe la biblia de continuidad (hechos canonicos). La pieza anti-drift.
import { callTool } from "../llm/client.mjs";
import { systemPrompt } from "../prompts.mjs";
import { BIBLE_SCHEMA } from "../artifacts/schemas.mjs";

export async function buildBible(brief) {
  const sys = systemPrompt("escribir la biblia de continuidad del caso");
  const user = `Brief normalizado:

${JSON.stringify(brief, null, 2)}

Escribe la biblia de continuidad: los hechos canonicos que NINGUN slide puede contradecir.

Reglas de la biblia:
- Una sola empresa, un solo rol del participante.
- Cada persona aparece una vez y con un nombre distinto. El jefe ("asigna" o "asigna_y_recibe") nunca es el destinatario del mensaje.
- "message_recipient" es SIEMPRE un segmento de clientes o usuarios (por ejemplo "clientes inactivos de alto valor"), nunca una persona del equipo ni el participante.
- "dataset" es una base sucia y sintetica de 8 a 12 filas: incluye casos claros para usar, claros para excluir (consentimiento revocado, baja solicitada, rebotes) y al menos dos grises (duplicado, sin confirmar). Las fechas son absolutas.
- "dataset.rules" son 3 reglas de la politica de datos, redactadas para poder citarlas despues.
- "manager_promises" lista lo que el jefe pide al inicio; TODO se cierra dentro del caso.
- "key_dates" y "key_numbers" son los anclajes que reusan los slides.
- "segments" son 3 candidatos de envio, cada uno con su caveat (uno de ellos es el error plausible).`;
  const { value, provider, model } = await callTool(sys, user, BIBLE_SCHEMA, {
    temperature: 0.4,
  });
  return { bible: value, provider, model };
}

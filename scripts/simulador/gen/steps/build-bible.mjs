// P2 · Escribe la biblia de continuidad (hechos canonicos). La pieza anti-drift.
import { callTool } from "../llm/client.mjs";
import { systemPrompt } from "../prompts.mjs";
import { BIBLE_SCHEMA } from "../artifacts/schemas.mjs";

export async function buildBible(brief) {
  const sys = systemPrompt("write the case's continuity bible");
  const user = `Normalized brief:

${JSON.stringify(brief, null, 2)}

Write the continuity bible: the canonical facts that NO slide may contradict.

Bible rules:
- One single company, one single participant role.
- Each person appears once, with a distinct name. The manager (function "asigna" or "asigna_y_recibe") is never the recipient of the message.
- "message_recipient" is ALWAYS a segment of customers or users (for example "high-value inactive customers"), never a member of the team and never the participant.
- "dataset" is a dirty, synthetic dataset of 8 to 12 rows: include records clearly usable, records clearly excluded (revoked consent, opt-out requested, bounces) and at least two gray-area records (duplicate, unconfirmed). Dates are absolute, US format. Names, emails, and addresses read as US records.
- "dataset.rules" are 3 data policy rules, written so they can be quoted later, in plain language (never naming a law or acronym).
- "manager_promises" lists what the manager asks for at the start; ALL of it gets closed inside the case.
- "key_dates" and "key_numbers" are the anchors the slides reuse. Amounts carry explicit USD.
- "segments" are 3 candidate segments for the send, each with its caveat (one of them is the plausible mistake).`;
  const { value, provider, model } = await callTool(sys, user, BIBLE_SCHEMA, {
    temperature: 0.4,
  });
  return { bible: value, provider, model };
}

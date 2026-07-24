// P1 · Normaliza el brief crudo en un brief limpio y completo.
import { callTool } from "../llm/client.mjs";
import { systemPrompt } from "../prompts.mjs";
import { BRIEF_SCHEMA } from "../artifacts/schemas.mjs";

export async function normalizeBrief(rawBrief) {
  const sys = systemPrompt(
    "normalize a company's raw intake brief into a clean, complete brief",
  );
  const user = `Raw brief from the company (it may be incomplete or informal, and may arrive in another language; the normalized brief is always in US English for a US operation):

${JSON.stringify(rawBrief, null, 2)}

Normalize it to the schema. Fill the gaps conservatively and realistically for that company, industry, and role, and record every assumption in "assumptions". "case_id" is a short lowercase slug with underscores. "expected_action" and "alternatives" come from the fixed identifier set [pilotar, entrenar, pausar, escalar]; these are internal codes (pilotar = pilot, entrenar = coach, pausar = pause, escalar = escalate), keep them verbatim as identifiers. The AI tool ("ai_tool") has a proper name and clear limits on what it can and cannot do. All data is synthetic: set synthetic to true.`;
  const { value, provider, model } = await callTool(sys, user, BRIEF_SCHEMA, {
    temperature: 0.2,
  });
  return { brief: value, provider, model };
}

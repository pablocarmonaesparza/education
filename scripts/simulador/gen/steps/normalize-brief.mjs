// P1 · Normaliza el brief crudo en un brief limpio y completo.
import { callTool } from "../llm/client.mjs";
import { systemPrompt } from "../prompts.mjs";
import { BRIEF_SCHEMA } from "../artifacts/schemas.mjs";

export async function normalizeBrief(rawBrief) {
  const sys = systemPrompt(
    "normalizar el brief de entrada de una empresa en un brief limpio y completo",
  );
  const user = `Brief crudo de la empresa (puede venir incompleto o informal):

${JSON.stringify(rawBrief, null, 2)}

Normalizalo al esquema. Rellena los huecos de forma conservadora y realista para esa empresa, industria y rol, y anota cada supuesto en "assumptions". El "case_id" es un slug corto en minusculas con guiones bajos. "expected_action" y "alternatives" salen del conjunto [pilotar, entrenar, pausar, escalar]. La herramienta de inteligencia artificial ("ai_tool") tiene un nombre propio y limites claros de lo que puede y no puede hacer. Todos los datos son sinteticos: pon synthetic en true.`;
  const { value, provider, model } = await callTool(sys, user, BRIEF_SCHEMA, {
    temperature: 0.2,
  });
  return { brief: value, provider, model };
}

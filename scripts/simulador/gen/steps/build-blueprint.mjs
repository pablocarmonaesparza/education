// P3 · Blueprint: estructura por receta pre-validada + una intencion por slide.
import { callTool } from "../llm/client.mjs";
import { systemPrompt } from "../prompts.mjs";
import { BLUEPRINT_INTENTS_SCHEMA } from "../artifacts/schemas.mjs";
import { pickRecipe } from "../artifacts/recipe-presets.mjs";
import { BLOCK_PURPOSE } from "../artifacts/block-schemas.mjs";

export async function buildBlueprint(brief, bible) {
  const recipe = pickRecipe(brief.level);
  const structureLines = recipe.slots
    .map((s) => `${s.section}/${s.slot}: ${s.block_id} — ${BLOCK_PURPOSE[s.block_id] ?? ""}`)
    .join("\n");

  const sys = systemPrompt(
    "asignar la intencion narrativa de cada slide sobre una estructura fija",
  );
  const user = `Biblia del caso:

${JSON.stringify(bible, null, 2)}

Estructura FIJA del caso (no la cambies, son 25 slides; respeta section, slot y block_id tal cual):

${structureLines}

Para CADA uno de los 25 slides da una intencion de una sola linea: que hace ese slide en la historia, anclado a la biblia (que dato muestra, que decision pide, que promesa del jefe entrega). Las tres promesas del jefe deben quedar entregadas en la seccion de cierre. Devuelve los 25 en el mismo orden.`;

  const { value, provider, model } = await callTool(
    sys,
    user,
    BLUEPRINT_INTENTS_SCHEMA,
    { temperature: 0.3 },
  );

  // Mapea la intencion al slot correcto (defensivo: por section+slot).
  const intentByKey = {};
  for (const it of value.intents ?? [])
    intentByKey[`${it.section}/${it.slot}`] = it.intent;

  const slides = recipe.slots.map((s) => ({
    section: s.section,
    slot: s.slot,
    block_id: s.block_id,
    intent: intentByKey[`${s.section}/${s.slot}`] ?? "",
  }));

  return { recipe, slides, provider, model };
}

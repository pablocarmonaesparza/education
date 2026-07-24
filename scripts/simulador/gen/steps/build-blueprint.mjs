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
    "assign each slide's narrative intent over a fixed structure",
  );
  const user = `Case bible:

${JSON.stringify(bible, null, 2)}

FIXED structure of the case (do not change it; 25 slides; keep section, slot, and block_id exactly as given):

${structureLines}

For EACH of the 25 slides give a one-line intent: what that slide does in the story, anchored to the bible (which fact it shows, which decision it asks for, which manager promise it delivers). The manager's three promises must be delivered in the closing section ("cierre"). Return all 25 in the same order.`;

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

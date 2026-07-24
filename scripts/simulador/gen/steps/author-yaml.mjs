// P4 · Autor: escribe las 25 slides, una seccion a la vez (5 llamadas), con la
// biblia y las secciones previas como ancla de continuidad, y el contrato de
// content de cada bloque como guia de forma.
import { callTool } from "../llm/client.mjs";
import { systemPrompt } from "../prompts.mjs";
import { describeBlock } from "../artifacts/block-schemas.mjs";
import { SECTION_NAMES, SECTION_DISPLAY } from "../artifacts/recipe-presets.mjs";

function sectionSchema(sectionId) {
  return {
    name: "submit_section",
    description: `The 5 slides of section "${sectionId}" with title, body, and content.`,
    schema: {
      type: "object",
      properties: {
        slides: {
          type: "array",
          items: {
            type: "object",
            properties: {
              slot: { type: "integer" },
              block_id: { type: "string" },
              title: { type: "string", description: "short slide heading, sentence case, no trailing period" },
              body: {
                type: "string",
                description: "instruction or context in markdown, with key data in bold",
              },
              content: {
                type: "object",
                description: "the block's content, per its block_id contract",
                additionalProperties: true,
              },
            },
            required: ["slot", "block_id", "title", "body", "content"],
          },
        },
      },
      required: ["slides"],
    },
  };
}

function storySoFar(doneSections) {
  if (doneSections.length === 0) return "(this is the first section)";
  return doneSections
    .map(
      (s) =>
        `${s.id}:\n` +
        s.slides
          .map((sl) => `  slot ${sl.slot} (${sl.block_id}): ${sl.title}`)
          .join("\n"),
    )
    .join("\n");
}

export async function authorSections(brief, bible, blueprint) {
  const sections = [];
  for (const sectionId of SECTION_NAMES) {
    const slots = blueprint.slides.filter((s) => s.section === sectionId);
    const contracts = [...new Set(slots.map((s) => s.block_id))]
      .map((bid) => describeBlock(bid))
      .join("\n\n");
    const plan = slots
      .map((s) => `slot ${s.slot}: ${s.block_id} — ${s.intent}`)
      .join("\n");

    const sys = systemPrompt(
      `write the 5 slides of section "${sectionId}" of a case`,
    );
    const user = `Case bible (canonical truth, do not invent outside of it):

${JSON.stringify(bible, null, 2)}

Story so far (sections already written):
${storySoFar(sections)}

Now write section "${sectionId}". Its 5 slides, each with its block_id and intent:
${plan}

Content contracts for this section's blocks (follow them EXACTLY):

${contracts}

For each slide deliver slot, block_id (same as the plan), title, body (markdown with key data in bold), and content (an object that satisfies the block's contract). The content NEVER includes the forbidden fields (the participant answers those). Keep continuity with the bible and with what is already written: same names, dates, and numbers.`;

    const { value } = await callTool(sys, user, sectionSchema(sectionId), {
      temperature: 0.5,
      maxTokens: 8000,
    });

    sections.push({
      id: sectionId,
      // id = identificador estable (contexto/datos/...); name = display EN US.
      name: SECTION_DISPLAY[sectionId] ?? sectionId,
      slides: (value.slides ?? []).map((sl) => ({
        slot: sl.slot,
        block_id: sl.block_id,
        title: sl.title,
        body: sl.body,
        content: sl.content ?? {},
      })),
    });
  }
  return sections;
}

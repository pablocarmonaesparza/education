// P4 · Autor: escribe las 25 slides, una seccion a la vez (5 llamadas), con la
// biblia y las secciones previas como ancla de continuidad, y el contrato de
// content de cada bloque como guia de forma.
import { callTool } from "../llm/client.mjs";
import { systemPrompt } from "../prompts.mjs";
import { describeBlock } from "../artifacts/block-schemas.mjs";
import { SECTION_NAMES } from "../artifacts/recipe-presets.mjs";

function sectionSchema(sectionId) {
  return {
    name: "submit_section",
    description: `Las 5 slides de la seccion "${sectionId}" con title, body y content.`,
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
              title: { type: "string", description: "encabezado corto del slide" },
              body: {
                type: "string",
                description: "instruccion o contexto en markdown, con negritas en datos clave",
              },
              content: {
                type: "object",
                description: "el contenido del bloque, segun el contrato de su block_id",
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
  if (doneSections.length === 0) return "(esta es la primera seccion)";
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
      `escribir las 5 slides de la seccion "${sectionId}" de un caso`,
    );
    const user = `Biblia del caso (verdad canonica, no inventes fuera de esto):

${JSON.stringify(bible, null, 2)}

Historia hasta ahora (secciones ya escritas):
${storySoFar(sections)}

Ahora escribe la seccion "${sectionId}". Sus 5 slides, con su block_id e intencion:
${plan}

Contratos de content de los bloques de esta seccion (respetalos EXACTO):

${contracts}

Para cada slide entrega slot, block_id (igual al del plan), title, body (markdown con negritas en datos clave) y content (objeto que cumple el contrato del bloque). El content NUNCA trae los campos prohibidos (esos los responde el participante). Manten continuidad con la biblia y con lo ya escrito: mismos nombres, fechas y numeros.`;

    const { value } = await callTool(sys, user, sectionSchema(sectionId), {
      temperature: 0.5,
      maxTokens: 8000,
    });

    sections.push({
      id: sectionId,
      name: sectionId.charAt(0).toUpperCase() + sectionId.slice(1),
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

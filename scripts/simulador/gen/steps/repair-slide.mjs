// Reparacion POR SLIDE (no regeneracion total). Recibe un slide y sus findings y
// devuelve el mismo slide (mismo slot y block_id) corregido.
import { callTool } from "../llm/client.mjs";
import { systemPrompt } from "../prompts.mjs";
import { describeBlock } from "../artifacts/block-schemas.mjs";

function slideSchema() {
  return {
    name: "submit_slide",
    description: "El slide corregido, con el mismo slot y block_id.",
    schema: {
      type: "object",
      properties: {
        slot: { type: "integer" },
        block_id: { type: "string" },
        title: { type: "string" },
        body: { type: "string" },
        content: { type: "object", additionalProperties: true },
      },
      required: ["slot", "block_id", "title", "body", "content"],
    },
  };
}

export async function repairSlide(slide, findings, bible, sectionId, storyContext) {
  const contract = describeBlock(slide.block_id);
  const problems = findings
    .map(
      (f) =>
        `- ${f.message ?? f.criterion ?? f.type}${f.fix ? ` (sugerencia: ${f.fix})` : ""}`,
    )
    .join("\n");
  const sys = systemPrompt(
    `corregir un slide de la seccion "${sectionId}" sin romper la continuidad`,
  );
  const user = `Biblia (verdad canonica del caso):

${JSON.stringify(bible, null, 2)}

Resumen de la historia (para mantener continuidad):
${storyContext}

Slide actual (seccion "${sectionId}", slot ${slide.slot}, bloque ${slide.block_id}):
${JSON.stringify(slide, null, 2)}

Problemas detectados que DEBES corregir:
${problems}

Contrato de content del bloque ${slide.block_id} (respetalo exacto):
${contract}

Devuelve el MISMO slide (mismo slot ${slide.slot} y block_id ${slide.block_id}) ya corregido: arregla lo señalado, respeta la biblia y el contrato, y manten coherencia con el resto de la historia. El content nunca trae los campos prohibidos (esos los responde el participante).`;

  const { value } = await callTool(sys, user, slideSchema(), {
    temperature: 0.4,
    maxTokens: 4000,
  });
  return {
    slot: slide.slot,
    block_id: slide.block_id, // fijo, la reparacion no cambia el bloque
    title: value.title ?? slide.title,
    body: value.body ?? slide.body,
    content: value.content ?? slide.content,
  };
}

// Autocorreccion determinista barata: reemplaza el guion largo antes de gastar
// una llamada de reparacion. (Las siglas se dejan al juez/linter: expandirlas
// bien depende del contexto.)
export function autofixCopy(ca) {
  const fix = (s) =>
    typeof s === "string" ? s.replace(/\s*[—–]\s*/g, ", ") : s;
  const walk = (node) => {
    if (typeof node === "string") return fix(node);
    if (Array.isArray(node)) return node.map(walk);
    if (node && typeof node === "object") {
      const out = {};
      for (const [k, v] of Object.entries(node)) out[k] = walk(v);
      return out;
    }
    return node;
  };
  for (const sec of ca.sections ?? []) {
    for (const sl of sec.slides ?? []) {
      sl.title = fix(sl.title);
      sl.body = fix(sl.body);
      if (sl.content) sl.content = walk(sl.content);
    }
  }
  return ca;
}

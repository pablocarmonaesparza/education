// Reparacion POR SLIDE (no regeneracion total). Recibe un slide y sus findings y
// devuelve el mismo slide (mismo slot y block_id) corregido.
import { callTool } from "../llm/client.mjs";
import { systemPrompt } from "../prompts.mjs";
import { describeBlock } from "../artifacts/block-schemas.mjs";

function slideSchema() {
  return {
    name: "submit_slide",
    description: "The corrected slide, with the same slot and block_id.",
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
        `- ${f.message ?? f.criterion ?? f.type}${f.fix ? ` (suggestion: ${f.fix})` : ""}`,
    )
    .join("\n");
  const sys = systemPrompt(
    `fix one slide of section "${sectionId}" without breaking continuity`,
  );
  const user = `Case bible (canonical truth):

${JSON.stringify(bible, null, 2)}

Story summary (to keep continuity):
${storyContext}

Current slide (section "${sectionId}", slot ${slide.slot}, block ${slide.block_id}):
${JSON.stringify(slide, null, 2)}

Detected problems you MUST fix:
${problems}

Content contract for block ${slide.block_id} (follow it exactly):
${contract}

Return the SAME slide (same slot ${slide.slot} and block_id ${slide.block_id}) corrected: fix what was flagged, respect the bible and the contract, and stay coherent with the rest of the story. The content never includes the forbidden fields (the participant answers those).`;

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

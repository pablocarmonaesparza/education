// Orquesta P1..P4 y ensambla el case_assembly. (Bloque A: una pasada, sin loop;
// el loop de autocorreccion entra en el Bloque B.)
import yaml from "js-yaml";
import { normalizeBrief } from "./steps/normalize-brief.mjs";
import { buildBible } from "./steps/build-bible.mjs";
import { buildBlueprint } from "./steps/build-blueprint.mjs";
import { authorSections } from "./steps/author-yaml.mjs";

export async function runPipeline(rawBrief, opts = {}) {
  const log = opts.log ?? (() => {});

  log("P1 · normalizando brief...");
  const { brief, provider, model } = await normalizeBrief(rawBrief);
  log(`     ${provider}/${model} · case_id=${brief.case_id} · ${brief.level}`);

  log("P2 · escribiendo la biblia de continuidad...");
  const { bible } = await buildBible(brief);
  log(`     empresa=${bible.company} · destinatario=${bible.message_recipient}`);
  log(`     personas=${bible.people.map((p) => p.name).join(", ")}`);

  log("P3 · blueprint (receta pre-validada + intenciones)...");
  const blueprint = await buildBlueprint(brief, bible);
  log(`     receta=${blueprint.recipe.id} · ${blueprint.slides.length} slides`);

  log("P4 · escribiendo las 25 slides (5 secciones)...");
  const sections = await authorSections(brief, bible, blueprint);
  log(`     secciones=${sections.map((s) => `${s.id}(${s.slides.length})`).join(" ")}`);

  const caseAssembly = assemble(brief, sections);
  return { brief, bible, blueprint, caseAssembly };
}

const TOOL_LABELS = {
  ai: "Inteligencia artificial",
  data: "Tablas",
  messaging: "Mensajería",
  documents: "Documentos",
  workflow: "Flujos",
};

// La metadata de la portada es estructurada, no creativa: la inyectamos del
// brief en vez de confiar en el modelo (evita level contradictorio, tools en
// ingles o incompletas).
function injectCoverMeta(brief, sections) {
  const cover = sections
    .find((s) => s.id === "contexto")
    ?.slides?.find((sl) => sl.slot === 1 && sl.block_id === "case_cover");
  if (!cover) return;
  cover.content = {
    ...(cover.content ?? {}),
    meta: {
      profile: brief.profile,
      level: brief.level,
      estimatedMinutes: 12,
      timerSeconds: 600,
      timerDefaultOn: false,
      tools: (brief.tools ?? []).map((t) => ({
        kind: t,
        label: TOOL_LABELS[t] ?? t,
      })),
    },
  };
}

function assemble(brief, sections) {
  injectCoverMeta(brief, sections);
  return {
    case_assembly: {
      case_id: brief.case_id,
      version: 1,
      status: "draft",
      schema_version: "1.0.0",
      meta: {
        level: brief.level,
        profile: brief.profile,
        profile_pack: brief.profile_pack,
        estimated_minutes: 12,
        timer_seconds: 600,
        timer_default_on: false,
        tools: brief.tools,
      },
      manager_outcome: {
        primary_question: brief.manager_signal,
        assignment_brief: brief.assignment_brief,
        business_metric: brief.business_metric,
        risk_metric: brief.risk_metric,
        expected_signal: brief.expected_signal,
        expected_action: brief.expected_action,
        alternatives: brief.alternatives,
      },
      sections,
    },
  };
}

export function toYaml(caseAssembly) {
  return yaml.dump(caseAssembly, { lineWidth: -1, noRefs: true });
}

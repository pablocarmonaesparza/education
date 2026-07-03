// E2E de aceptación: empresa de prueba -> caso bespoke sembrado -> sesión jugada.
// Corre contra PROD (la del .env.local) con service_role. Replica fielmente lo
// que hace la app (persistGeneratedCase + seedProductiveCaseTables + el flujo de
// /api/sessions), porque las llaves de LLM están muertas y Claude ES el modelo.
//
// uso: node scripts/simulador/e2e-acceptance.mjs <case.yaml> [--reset]
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import yaml from "js-yaml";
import { createClient } from "@supabase/supabase-js";
import { toPlayable } from "./gen/playable.mjs";

// --- env ---
const env = Object.fromEntries(
  fs.readFileSync(path.join(process.cwd(), ".env.local"), "utf8")
    .split("\n").filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")]; }),
);
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("falta SUPABASE_URL o SERVICE_ROLE_KEY"); process.exit(2); }
const db = createClient(url, key, { db: { schema: "simulador" }, auth: { persistSession: false } });

const caseFile = process.argv[2];
const ca = yaml.load(fs.readFileSync(caseFile, "utf8")).case_assembly;
const pc = toPlayable(ca);
const catalogFile = path.join(
  process.cwd(),
  "docs/simulador/case_factory/EXERCISE_BLOCK_CATALOG.yaml",
);
const blockCatalog =
  yaml.load(fs.readFileSync(catalogFile, "utf8"))?.exercise_block_catalog
    ?.blocks ?? [];

const STEP_TYPE_BY_BLOCK = {
  case_cover: "data_scope", reading_passive: "data_scope", reading_message: "data_scope",
  reading_data_table: "data_scope", reading_image: "data_scope", reading_kpi_cards: "data_scope",
  reading_timeline: "data_scope", reading_attachment: "data_scope",
  ai_textfield_free: "llm_beat", ai_textfield_guided: "llm_beat",
  ai_output_review: "artifact_review", categorize_rows: "decision_select",
  ai_comparison: "decision_select", model_tradeoff_sliders: "decision_select",
  workflow_builder: "decision_select", dashboard_pivot: "decision_select",
  tradeoff_decision_memo: "decision_open_short",
};
const DIMENSIONS_BY_BLOCK = Object.fromEntries(
  blockCatalog.map((block) => [block.id, block.primary_dimensions ?? []]),
);
const orgSlug = (orgId, caseId, v) => `${orgId}__${caseId}__v${v}`;

function dimensionsForBlock(blockId) {
  return [...(DIMENSIONS_BY_BLOCK[blockId] ?? [])];
}

function toPriority(value, fallback) {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  if (value >= 0 && value <= 1) return Math.round(value * 100);
  return Math.max(0, Math.min(100, Math.round(value)));
}

function toChoice(value) {
  const choice = String(value ?? "").trim().toUpperCase();
  return ["A", "B", "C", "D"].includes(choice) ? choice : null;
}

function defaultResponseInput(blockId) {
  switch (blockId) {
    case "ai_textfield_free":
      return { kind: "text", text: "Usa solo datos necesarios, valida claims y escala cualquier riesgo sensible." };
    case "ai_textfield_guided":
      return {
        kind: "guided",
        objetivo: "Resolver el caso con evidencia disponible.",
        audiencia: "Manager responsable del flujo.",
        limites: "No inventes datos ni uses informacion sensible innecesaria.",
      };
    case "model_tradeoff_sliders":
      return { kind: "sliders", autonomy: 0.35, security: 0.85, cost: 0.5 };
    case "categorize_rows":
      return { kind: "categorize", assignments: { item_1: "revisar", item_2: "escalar" } };
    case "ai_output_review":
      return { kind: "review", flags: { segment_1: "claim_no_verificado" } };
    case "ai_comparison":
      return { kind: "comparison", choiceId: "A", rationale: "Elijo la opcion con mejor evidencia disponible." };
    case "workflow_builder":
      return {
        kind: "workflow",
        enabled_steps: ["triage", "validacion", "escalamiento"],
        step_order: ["triage", "validacion", "escalamiento"],
        rationale: "Mantengo control humano antes de publicar o ejecutar.",
      };
    case "dashboard_pivot":
      return {
        kind: "dashboard",
        selected_filter: "riesgo_alto",
        leader_takeaway: "Priorizar casos con riesgo alto y evidencia incompleta.",
      };
    case "tradeoff_decision_memo":
      return {
        kind: "decision",
        decisionId: "pilotar_controlado",
        rationale: "Avanzo solo con casos de evidencia clara y escalo los inciertos.",
      };
    default:
      return null;
  }
}

function responsePayload(blockId, resp, capturedAt) {
  switch (blockId) {
    case "case_cover":
      return { block_id: blockId, started_at: capturedAt, timer_enabled_at_start: false };
    case "reading_passive":
    case "reading_message":
    case "reading_data_table":
    case "reading_image":
    case "reading_kpi_cards":
    case "reading_timeline":
    case "reading_attachment":
      return { block_id: blockId, acknowledged: true };
    case "ai_textfield_free":
      return {
        block_id: blockId,
        prompt_text: String(resp?.text ?? resp?.prompt_text ?? ""),
        model: String(resp?.model ?? "claude-sonnet"),
        attachments: [],
        voice_notes: [],
      };
    case "ai_textfield_guided": {
      const objective = resp?.objetivo ?? resp?.selected_objective ?? null;
      const audience = resp?.audiencia ?? resp?.selected_audience ?? null;
      const rawLimits = resp?.limites ?? resp?.selected_limits ?? [];
      const limits = Array.isArray(rawLimits)
        ? rawLimits.map(String)
        : String(rawLimits)
            .split(/[.;]/)
            .map((item) => item.trim())
            .filter(Boolean);
      return {
        block_id: blockId,
        selected_objective: objective === null ? null : String(objective),
        selected_audience: audience === null ? null : String(audience),
        selected_limits: limits,
        selected_model: resp?.selected_model ? String(resp.selected_model) : "claude-sonnet",
        generated_prompt:
          resp?.generated_prompt ??
          [objective, audience, limits.join("; ")].filter(Boolean).join(" | "),
      };
    }
    case "model_tradeoff_sliders":
      return {
        block_id: blockId,
        autonomy_priority: toPriority(resp?.autonomy ?? resp?.autonomy_priority, 35),
        security_priority: toPriority(resp?.security ?? resp?.security_priority, 85),
        cost_priority: toPriority(resp?.cost ?? resp?.cost_priority, 50),
        recommended_model_id: resp?.recommended_model_id ? String(resp.recommended_model_id) : "balanced_secure",
        rationale_text:
          resp?.rationale ??
          resp?.rationale_text ??
          "Priorizo seguridad y trazabilidad sobre velocidad pura.",
      };
    case "categorize_rows":
      return {
        block_id: blockId,
        row_actions: Object.entries(resp?.assignments ?? resp?.row_actions ?? {}).map(
          ([row_id, action]) => ({
            row_id,
            action: action === null || action === undefined ? null : String(action),
          }),
        ),
      };
    case "ai_output_review":
      return {
        block_id: blockId,
        flagged_segments: Object.entries(resp?.flags ?? resp?.flagged_segments ?? {}).map(
          ([segment_id, flag]) => ({
            segment_id,
            flag: flag === null || flag === undefined ? null : String(flag),
          }),
        ),
      };
    case "ai_comparison":
      return {
        block_id: blockId,
        selected_output: toChoice(resp?.choiceId ?? resp?.selected_output),
      };
    case "workflow_builder":
      return {
        block_id: blockId,
        enabled_steps: (resp?.enabled_steps ?? ["triage", "validacion", "escalamiento"]).map(String),
        step_order: (resp?.step_order ?? ["triage", "validacion", "escalamiento"]).map(String),
        rationale_text:
          resp?.rationale ??
          resp?.rationale_text ??
          "Mantengo control humano antes de ejecutar cambios sensibles.",
      };
    case "dashboard_pivot":
      return {
        block_id: blockId,
        selected_filter: resp?.selected_filter ? String(resp.selected_filter) : "riesgo_alto",
        leader_takeaway:
          resp?.leader_takeaway ??
          "Priorizar casos con riesgo alto y evidencia incompleta.",
      };
    case "tradeoff_decision_memo":
      return {
        block_id: blockId,
        decision: String(resp?.decisionId ?? resp?.decision ?? ""),
        memo: String(resp?.rationale ?? resp?.memo ?? ""),
      };
    default:
      return null;
  }
}

async function one(q, label) {
  const { data, error } = await q;
  if (error) { console.error(`ERROR ${label}:`, error.message); process.exit(1); }
  return data;
}

async function main() {
  // runId para que cada corrida sea fresca (org/team/user sin clave natural única).
  const runId = process.env.RUN_ID || "r" + Math.floor(Date.now() / 1000);

  // 1) Empresa + equipo + usuario participante (bridge sin cuenta auth) + memberships
  const org = await one(db.from("organizations").insert(
    { name: `Vértiz Logística (DEMO ${runId})`, industry: "logistica_ultima_milla", region: "LATAM",
      company_size_key: "51_200", metadata: { demo: true, acceptance_run: runId } }).select("id").single(), "org");
  const team = await one(db.from("teams").insert(
    { organization_id: org.id, name: "Operaciones", department_key: "operaciones", metadata: { demo: true } }).select("id").single(), "team");
  const user = await one(db.from("users").insert(
    { email: `demo.analista+${runId}@vertiz-demo.itera.la`, full_name: "Analista Demo", locale: "es-MX",
      metadata: { demo: true, bridge_only: true } }).select("id").single(), "user");
  await one(db.from("organization_memberships").insert(
    { organization_id: org.id, user_id: user.id, role: "viewer" }), "org_membership");
  await one(db.from("team_memberships").insert(
    { team_id: team.id, user_id: user.id, role: "employee" }), "team_membership");

  // 2) Persistir el caso generado (generated_cases) — org-scoped, RLS aislada
  await one(db.from("generated_cases").upsert(
    { organization_id: org.id, team_id: team.id, case_id: pc.caseId, version: pc.version,
      title: pc.sections[0]?.slides[0]?.title ?? pc.caseId, level: pc.meta?.level ?? null,
      profile_pack: pc.meta?.profile_pack ?? null, playable_json: pc,
      manager_outcome_json: pc.managerOutcome ?? {}, generation_method: "engine",
      generation_meta_json: { acceptance_run: true, gates: "PASS", judge: "codex" },
      status: "active", created_by: user.id },
    { onConflict: "organization_id,case_id,version" }), "generated_cases");

  // 3) Sembrar tablas productivas (case_templates + variant + steps) org-scoped
  const rubric = await one(db.from("rubrics").select("id").eq("slug", "rubric_case_factory_v1")
    .order("version", { ascending: false }).limit(1).maybeSingle(), "rubric_lookup");
  const slug = orgSlug(org.id, pc.caseId, pc.version);
  const tpl = await one(db.from("case_templates").upsert(
    { slug, version: pc.version, status: "active", difficulty: "baseline", locale: "es-MX",
      title: pc.sections[0]?.slides[0]?.title ?? pc.caseId, organization_id: org.id,
      rubric_id: rubric?.id ?? null, expected_manager_action_json: pc.managerOutcome ?? {} },
    { onConflict: "slug,version" }).select("id").single(), "case_templates");
  const variant = await one(db.from("case_variants").upsert(
    { slug: `${slug}_primary`, case_template_id: tpl.id, organization_id: org.id,
      variant_role: "primary", status: "active", synthetic_data: true },
    { onConflict: "slug" }).select("id").single(), "case_variants");
  const stepRows = [];
  const slideById = Object.fromEntries(
    pc.sections.flatMap((sec) => sec.slides.map((sl) => [sl.slideId, sl])),
  );
  let ordinal = 0;
  for (const sec of pc.sections) for (const sl of sec.slides) {
    ordinal++;
    stepRows.push({ case_template_id: tpl.id, organization_id: org.id, step_key: sl.slideId, ordinal,
      step_type: STEP_TYPE_BY_BLOCK[sl.blockId] ?? "data_scope",
      prompt_template: `${sl.title}\n\n${sl.body}`.slice(0, 4000),
      config_json: sl.caseContext ?? {}, evaluates_dimensions: dimensionsForBlock(sl.blockId) });
  }
  const legacyDimensions = stepRows.flatMap((row) => row.evaluates_dimensions)
    .filter((dimension) => ["privacidad", "decision"].includes(dimension));
  if (legacyDimensions.length > 0) {
    console.error("ERROR case_steps: dimensiones legacy detectadas", legacyDimensions);
    process.exit(1);
  }
  const dimensionSignatures = new Set(
    stepRows.map((row) => JSON.stringify(row.evaluates_dimensions ?? [])),
  );
  if (dimensionSignatures.size < 2) {
    console.error("ERROR case_steps: evaluates_dimensions uniforme; debe derivar por bloque");
    process.exit(1);
  }
  await one(db.from("case_steps").upsert(stepRows, { onConflict: "case_template_id,step_key" }), "case_steps");
  const steps = await one(db.from("case_steps").select("id, step_key, ordinal").eq("case_template_id", tpl.id), "steps_read");
  const stepByKey = Object.fromEntries(steps.map((s) => [s.step_key, s]));

  // 4) Sprint + assignment + session (flujo de /api/sessions)
  const sprint = await one(db.from("sprints").insert(
    { organization_id: org.id, team_id: team.id, name: "Aceptación E2E — Vértiz", status: "active",
      start_date: "2026-06-01" }).select("id").single(), "sprint");
  const assignment = await one(db.from("assignments").insert(
    { sprint_id: sprint.id, user_id: user.id, case_variant_id: variant.id, assignment_kind: "primary", status: "started" }
    ).select("id").single(), "assignment");
  const now = new Date();
  const session = await one(db.from("simulation_sessions").insert(
    { assignment_id: assignment.id, case_variant_id: variant.id, user_id: user.id, sprint_id: sprint.id,
      status: "in_progress", started_at: now.toISOString(), metadata: { demo: true, slug } })
    .select("id").single(), "session");

  // 5) Jugar la sesión. Un analista COMPETENTE con UNA fuga de validación: no marca
  //    el monto inventado de $260 en ia-5 (r7). Da una evaluación que discrimina.
  const R = {
    "datos-1": { kind: "categorize", assignments: { g3: "resolver", g4: "escalar", g6: "escalar", g8: "rechazar", g2: "resolver" } },
    "datos-2": { kind: "categorize", assignments: { c_tipo: "va", c_direccion: "no_va", c_monto: "no_va", c_nombre: "transformado" } },
    "datos-3": { kind: "sliders", autonomy: 0.3, security: 0.85, cost: 0.5 },
    "datos-4": { kind: "text", text: "No uses la dirección ni el monto del reembolso; el nombre trátalo genérico. Solo el tipo de excepción para ajustar el tono." },
    "ia-2": { kind: "guided", objetivo: "Avisar que el caso está en revisión, sin prometer reembolso.", audiencia: "Clientes con entrega fallida en revisión.", limites: "No menciones monto ni dirección." },
    "ia-3": { kind: "review", flags: { r1: "dato_sensible", r2: "claim_no_verificado", r3: "tono_agresivo", r4: "frase_reutilizable" } },
    "ia-4": { kind: "text", text: "Quita la dirección y el nombre. No confirmes ningún monto. Baja el tono de urgencia y usa el plazo de 72 horas." },
    "ia-5": { kind: "review", flags: { r5: null, r6: null, r7: null } },
    "revision-1": { kind: "review", flags: { v1: "claim_no_verificado", v2: null, v3: "claim_no_verificado" } },
    "revision-2": { kind: "comparison", choiceId: "A", rationale: "Informa sin prometer monto." },
    "revision-4": { kind: "categorize", assignments: { k_asunto: "dejar", k_saludo: "dejar", k_monto: "quitar", k_plazo: "dejar" } },
    "revision-5": { kind: "comparison", choiceId: "A", rationale: "Cumple el plazo, sin monto ni dirección." },
    "cierre-1": { kind: "comparison", choiceId: "A", rationale: "Cierro primero lo que tiene evidencia; el robo sin prueba lo escalo." },
    "cierre-2": { kind: "text", text: "Hola, tu caso de entrega está en revisión. Te contactaremos con el resultado en un máximo de 72 horas. Gracias por tu paciencia." },
    "cierre-3": { kind: "categorize", assignments: { m_sla: "monitorear", m_reemb: "monitorear", m_quejas: "monitorear", m_color: "ignorar" } },
    "cierre-5": { kind: "decision", decisionId: "pilotar_lote_claro", rationale: "Resuelvo hoy los casos con evidencia y escalo el robo de $3,400 y el duplicado a Hugo. Cierro lo seguro sin pagar de más." },
  };
  const events = steps.sort((a, b) => a.ordinal - b.ordinal).map((s) => {
    const slide = slideById[s.step_key];
    if (!slide) {
      console.error(`ERROR step_events: no hay slide para step_key ${s.step_key}`);
      process.exit(1);
    }
    const capturedAt = new Date(now.getTime() + s.ordinal * 60000).toISOString();
    const rawResp =
      R[s.step_key] ??
      (dimensionsForBlock(slide.blockId).length > 0
        ? defaultResponseInput(slide.blockId)
        : null);
    const response = rawResp ? responsePayload(slide.blockId, rawResp, capturedAt) : null;
    return { simulation_session_id: session.id, case_step_id: s.id, step_ordinal: s.ordinal,
      event_type: response ? "response_update" : "step_viewed",
      payload_json: response
        ? { response, metrics: { acceptance_run: true, step_key: s.step_key }, timestamp: capturedAt }
        : { kind: "viewed", block_id: slide.blockId },
      captured_at: capturedAt };
  });
  const responseEvents = events.filter((event) => event.event_type === "response_update");
  if (responseEvents.length === 0) {
    console.error("ERROR step_events: ninguna respuesta alimenta al judge");
    process.exit(1);
  }
  if (responseEvents.some((event) => !event.payload_json?.response?.block_id)) {
    console.error("ERROR step_events: payload_json.response.block_id faltante");
    process.exit(1);
  }
  await one(db.from("simulation_step_events").insert(events), "step_events");
  await one(db.from("simulation_sessions").update(
    { status: "completed", completed_at: new Date(now.getTime() + 26 * 60000).toISOString(),
      last_event_at: new Date(now.getTime() + 26 * 60000).toISOString() }).eq("id", session.id), "session_complete");

  console.log(JSON.stringify({ org: org.id, team: team.id, user: user.id, sprint: sprint.id,
    assignment: assignment.id, session: session.id, template: tpl.id, variant: variant.id,
    slug, rubric_id: rubric?.id ?? null, steps: steps.length,
    stepIds: Object.fromEntries(Object.entries(stepByKey).map(([k, v]) => [k, v.id])) }, null, 2));
}
main();

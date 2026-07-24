#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";
import yaml from "js-yaml";
import { toPlayable } from "./gen/playable.mjs";

const ROOT = process.cwd();
const CONTRACT_DIR = path.join(ROOT, "docs/simulador/contrato_v0");
const CASES_ASSEMBLED_DIR = path.join(CONTRACT_DIR, "cases_assembled");
const PRACTICE_DIR = path.join(CONTRACT_DIR, "practice_beats");
const DEMO_PASSWORD = "IteraDemo2026!";
const DEMO_MONTH_KEY = new Date().toISOString().slice(0, 7);

const IDS = {
  org: "11111111-1111-4111-8111-111111111111",
  team: "22222222-2222-4222-8222-222222222222",
  sprintPackage: "33333333-3333-4333-8333-333333333333",
  sprint: "44444444-4444-4444-8444-444444444444",
  manager: "55555555-5555-4555-8555-555555555555",
  ana: "66666666-6666-4666-8666-666666666661",
  bruno: "66666666-6666-4666-8666-666666666662",
  carla: "66666666-6666-4666-8666-666666666663",
  diego: "66666666-6666-4666-8666-666666666664",
  sprintReportExecutive: "77777777-7777-4777-8777-777777777700",
  sessionAna: "77777777-7777-4777-8777-777777777701",
  sessionBruno: "77777777-7777-4777-8777-777777777702",
  sessionCarla: "77777777-7777-4777-8777-777777777703",
  reportAna: "88888888-8888-4888-8888-888888888801",
  reportBruno: "88888888-8888-4888-8888-888888888802",
  evalAna: "99999999-9999-4999-8999-999999999901",
  evalBruno: "99999999-9999-4999-8999-999999999902",
  reviewBruno: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02",
  riskAna: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb01",
  riskBruno1: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb02",
  riskBruno2: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb03",
  evidenceAna: "cccccccc-cccc-4ccc-8ccc-cccccccccc01",
  recommendationAna: "dddddddd-dddd-4ddd-8ddd-dddddddddd01",
  managerAlert: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeee01",
  subscription: "ffffffff-ffff-4fff-8fff-fffffffffff1",
  invitation: "ffffffff-ffff-4fff-8fff-fffffffffff2",
  practiceAttempt: "0f0f0f0f-0f0f-4f0f-8f0f-0f0f0f0f0f01",
};

const DEMO_USERS = [
  {
    id: IDS.manager,
    email: "manager.demo@itera.local",
    full_name: "Mariana Robles",
    roles: ["org_admin", "billing_admin"],
    teamRole: "manager",
    jurisdiction: "MX",
  },
  {
    id: IDS.ana,
    email: "ana.demo@itera.local",
    full_name: "Ana Torres",
    roles: ["viewer"],
    teamRole: "employee",
    jurisdiction: "MX",
  },
  {
    id: IDS.bruno,
    email: "bruno.demo@itera.local",
    full_name: "Bruno Salas",
    roles: ["viewer"],
    teamRole: "employee",
    jurisdiction: "CO",
  },
  {
    id: IDS.carla,
    email: "carla.demo@itera.local",
    full_name: "Carla Ruiz",
    roles: ["viewer"],
    teamRole: "employee",
    jurisdiction: "MX",
  },
  {
    id: IDS.diego,
    email: "diego.demo@itera.local",
    full_name: "Diego Perez",
    roles: ["viewer"],
    teamRole: "employee",
    jurisdiction: "MX",
  },
];

const STEP_TYPE_BY_BLOCK = {
  case_cover: "data_scope",
  reading_passive: "data_scope",
  reading_message: "data_scope",
  reading_data_table: "data_scope",
  reading_image: "data_scope",
  reading_kpi_cards: "data_scope",
  reading_timeline: "data_scope",
  reading_attachment: "data_scope",
  ai_textfield_free: "llm_beat",
  ai_textfield_guided: "llm_beat",
  ai_output_review: "artifact_review",
  categorize_rows: "decision_select",
  ai_comparison: "decision_select",
  model_tradeoff_sliders: "decision_select",
  workflow_builder: "decision_select",
  dashboard_pivot: "decision_select",
  tradeoff_decision_memo: "decision_open_short",
};

const DIMENSIONS_BY_BLOCK = {
  ai_textfield_free: ["ejecucion_ia", "juicio"],
  ai_textfield_guided: ["contexto", "ejecucion_ia"],
  ai_output_review: ["validacion", "juicio"],
  categorize_rows: ["datos", "juicio"],
  ai_comparison: ["validacion", "impacto"],
  model_tradeoff_sliders: ["datos", "juicio"],
  workflow_builder: ["ejecucion_ia", "impacto"],
  dashboard_pivot: ["validacion", "impacto"],
  tradeoff_decision_memo: ["juicio", "impacto"],
};

function parseLocalSupabaseStatus() {
  // Override explícito para sembrar el demo en un Supabase REMOTO (prod), p.ej.
  // para provisionar el login de demo que YC va a usar. Requiere pasar el
  // target A CONCIENCIA por env (la service key remota vive en Vercel, no en el
  // repo). Sin el override, se mantiene el candado localhost-only intacto.
  //   SEED_TARGET_URL=https://<ref>.supabase.co \
  //   SEED_TARGET_SERVICE_KEY=<service role key remota> \
  //   node scripts/simulador/seed-demo-local.mjs
  const overrideUrl = process.env.SEED_TARGET_URL;
  const overrideKey = process.env.SEED_TARGET_SERVICE_KEY;
  if (overrideUrl && overrideKey) {
    if (!/^https?:\/\//u.test(overrideUrl)) {
      throw new Error(`SEED_TARGET_URL inválida: ${overrideUrl}`);
    }
    const remote = !/^https?:\/\/(127\.0\.0\.1|localhost):/u.test(overrideUrl);
    console.warn(
      `[seed-demo] usando target por OVERRIDE${remote ? " (REMOTO — sembrando datos demo en prod a conciencia)" : ""}: ${overrideUrl}`,
    );
    return { url: overrideUrl, serviceKey: overrideKey, studioUrl: null };
  }

  const out = execFileSync("supabase", ["status", "-o", "json"], {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  const start = out.indexOf("{");
  const end = out.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("No pude leer `supabase status -o json`. Corre `supabase start`.");
  }
  const status = JSON.parse(out.slice(start, end + 1));
  const url = status.API_URL;
  const serviceKey = status.SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Supabase local no expuso API_URL/SERVICE_ROLE_KEY.");
  }
  if (!/^https?:\/\/(127\.0\.0\.1|localhost):/u.test(url)) {
    throw new Error(`Refusing to seed non-local Supabase URL: ${url}`);
  }
  return { url, serviceKey, studioUrl: status.STUDIO_URL };
}

function readYaml(filePath) {
  return yaml.load(readFileSync(filePath, "utf8"));
}

function readAssembledCases() {
  return readdirSync(CASES_ASSEMBLED_DIR)
    .filter((file) => file.endsWith(".yaml") || file.endsWith(".yml"))
    .sort()
    .map((file) => {
      const fullPath = path.join(CASES_ASSEMBLED_DIR, file);
      const doc = readYaml(fullPath);
      if (!doc?.case_assembly?.case_id) {
        throw new Error(`${fullPath} missing case_assembly.case_id`);
      }
      return {
        file,
        assembly: doc.case_assembly,
        playable: toPlayable(doc.case_assembly),
      };
    });
}

async function must(query, label) {
  const { data, error } = await query;
  if (error) throw new Error(`${label}: ${error.message}`);
  return data;
}

async function upsertOne(db, table, row, onConflict, label) {
  const data = await must(
    db.from(table).upsert(row, { onConflict }).select("*").single(),
    label,
  );
  return data;
}

async function upsertMany(db, table, rows, onConflict, label) {
  if (rows.length === 0) return [];
  return must(db.from(table).upsert(rows, { onConflict }).select("*"), label);
}

async function ensureAuthUser(rootClient, email, fullName) {
  const { data: listed, error: listError } =
    await rootClient.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listError) throw new Error(`auth.listUsers: ${listError.message}`);
  const existing = listed.users.find(
    (user) => user.email?.toLowerCase() === email.toLowerCase(),
  );
  if (existing) {
    const { error: updateError } = await rootClient.auth.admin.updateUserById(
      existing.id,
      {
        email_confirm: true,
        password: DEMO_PASSWORD,
        user_metadata: { full_name: fullName, demo_seed: "codex-local-v1" },
      },
    );
    if (updateError) {
      throw new Error(`auth.updateUserById(${email}): ${updateError.message}`);
    }
    return existing.id;
  }

  const { data, error } = await rootClient.auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: fullName, demo_seed: "codex-local-v1" },
  });
  if (error || !data.user) {
    throw new Error(`auth.createUser(${email}): ${error?.message ?? "no user"}`);
  }
  return data.user.id;
}

function difficultyForLevel(level) {
  if (String(level ?? "").includes("N3")) return "advanced";
  if (String(level ?? "").includes("N2")) return "intermediate";
  return "baseline";
}

function careerForProfilePack(profilePack) {
  const value = String(profilePack ?? "");
  if (value.includes("sales")) return "sales";
  if (value.includes("customer")) return "cs";
  if (value.includes("operations")) return "ops";
  if (value.includes("finance")) return "finance";
  if (value.includes("legal")) return "legal";
  if (value.includes("product")) return "product";
  if (value.includes("engineering")) return "engineering";
  if (value.includes("growth")) return "growth";
  return "marketing";
}

function generatedStatus(assembly) {
  return assembly.status === "ready" ? "active" : "draft";
}

function dimensionsForBlock(blockId) {
  return DIMENSIONS_BY_BLOCK[blockId] ?? [];
}

async function seedCaseTemplateFromPlayable(db, rubricId, playable, options) {
  const slug = options.slug ?? playable.caseId;
  const version = options.version ?? playable.version;
  const status = options.status ?? "active";
  const orgId = options.organizationId ?? null;
  const title = options.title ?? playable.sections[0]?.slides[0]?.title ?? slug;
  const difficulty = options.difficulty ?? difficultyForLevel(playable.meta?.level);
  const career = options.career ?? careerForProfilePack(playable.meta?.profile_pack);

  const template = await upsertOne(
    db,
    "case_templates",
    {
      slug,
      version,
      status,
      difficulty,
      locale: "es-MX",
      title,
      target_roles: ["operator"],
      duration_estimate_min: Number(playable.meta?.estimated_minutes ?? 12),
      rubric_id: rubricId,
      organization_id: orgId,
      level_primary: 1,
      career_key: career,
      expected_manager_action_json: playable.managerOutcome ?? {},
      context_template_json: { source: "seed-demo-local", playable_case_id: playable.caseId },
      data_policy_json: { synthetic: true, local_demo: true },
      telemetry_required: ["runtime_started", "runtime_step_completed", "report_opened"],
      evaluation_meta_json: { rubric_ref: "rubric_case_factory_v1@1.0.0" },
    },
    "slug,version",
    `case_templates:${slug}`,
  );

  const variant = await upsertOne(
    db,
    "case_variants",
    {
      slug: `${slug}_primary`,
      case_template_id: template.id,
      organization_id: orgId,
      variant_role: "primary",
      status,
      template_var_values_json: {},
      inputs_resolved_json: { playable_case_id: playable.caseId },
      expected_behavior_shift: "baseline demo",
      synthetic_data: true,
      level: 1,
      career_key: career,
    },
    "slug",
    `case_variants:${slug}_primary`,
  );

  const stepRows = [];
  let ordinal = 0;
  for (const section of playable.sections) {
    for (const slide of section.slides) {
      ordinal += 1;
      stepRows.push({
        case_template_id: template.id,
        organization_id: orgId,
        step_key: slide.slideId,
        ordinal,
        step_type: STEP_TYPE_BY_BLOCK[slide.blockId] ?? "data_scope",
        prompt_template: `${slide.title}\n\n${slide.body}`.slice(0, 4000),
        config_json: slide.caseContext ?? {},
        evaluates_dimensions: dimensionsForBlock(slide.blockId),
      });
    }
  }
  await upsertMany(
    db,
    "case_steps",
    stepRows,
    "case_template_id,step_key",
    `case_steps:${slug}`,
  );

  return { template, variant };
}

async function seedLegacyRuntimeCase(db, rubricId) {
  const template = await upsertOne(
    db,
    "case_templates",
    {
      slug: "marketing_urgent_campaign_pii",
      version: 1,
      status: "active",
      difficulty: "baseline",
      locale: "es-MX",
      title: "Campana urgente con feedback de clientes",
      target_roles: ["marketing", "growth"],
      duration_estimate_min: 12,
      rubric_id: rubricId,
      organization_id: null,
      level_primary: 1,
      career_key: "marketing",
      expected_manager_action_json: {
        expected_action: "entrenar",
        primary_question:
          "Puede decidir que datos usar, como pedir apoyo de IA y cuando pausar antes de lanzar.",
      },
      context_template_json: { source: "seed-demo-local", runtime: "legacy" },
      data_policy_json: {
        synthetic: true,
        prohibited_fields: ["email", "name", "complaint_or_praise"],
      },
      telemetry_required: ["runtime_started", "runtime_step_completed", "report_opened"],
      evaluation_meta_json: { rubric_ref: "rubric_case_factory_v1@1.0.0" },
    },
    "slug,version",
    "case_templates:marketing_urgent_campaign_pii",
  );

  const variant = await upsertOne(
    db,
    "case_variants",
    {
      slug: "marketing_urgent_campaign_pii_primary",
      case_template_id: template.id,
      organization_id: null,
      variant_role: "primary",
      status: "active",
      template_var_values_json: {},
      inputs_resolved_json: {
        sample_dataset: "feedback_clientes_latam_demo.csv",
        ai_tool: "Aurora Copiloto",
      },
      expected_behavior_shift:
        "El participante minimiza datos, valida claims y recomienda un piloto controlado.",
      synthetic_data: true,
      level: 1,
      career_key: "marketing",
    },
    "slug",
    "case_variants:marketing_urgent_campaign_pii_primary",
  );

  const steps = [
    {
      step_key: "data_scope",
      ordinal: 1,
      step_type: "data_scope",
      evaluates_dimensions: ["datos", "juicio"],
      prompt_template:
        "Decide que campos del CSV puede usar el modelo y cuales se transforman o descartan.",
      config_json: {
        fields: ["name", "email", "company", "complaint_or_praise", "revenue_potential_usd"],
      },
    },
    {
      step_key: "llm_beat",
      ordinal: 2,
      step_type: "llm_beat",
      evaluates_dimensions: ["contexto", "ejecucion_ia"],
      prompt_template:
        "Pide a la IA tres angulos de campana sin filtrar datos personales ni inventar cifras.",
      config_json: { ai_tool: "Aurora Copiloto" },
    },
    {
      step_key: "artifact_review",
      ordinal: 3,
      step_type: "artifact_review",
      evaluates_dimensions: ["validacion", "juicio"],
      prompt_template:
        "Revisa el output de la IA y marca datos sensibles, claims no verificables o mala segmentacion.",
      config_json: { review_targets: ["unverifiable_claim", "exposed_sensitive_data"] },
    },
    {
      step_key: "decision_select",
      ordinal: 4,
      step_type: "decision_select",
      evaluates_dimensions: ["juicio", "impacto"],
      prompt_template:
        "Elige como entregar a tu manager sin esconder riesgos ni frenar innecesariamente.",
      config_json: { options: ["angles_only", "angles_with_assumptions", "short_review"] },
    },
    {
      step_key: "decision_open_short",
      ordinal: 5,
      step_type: "decision_open_short",
      evaluates_dimensions: ["impacto"],
      prompt_template:
        "Redacta la respuesta final con propuesta, metricas y condicion de salida.",
      config_json: { max_chars: 700 },
    },
  ].map((step) => ({
    ...step,
    case_template_id: template.id,
    organization_id: null,
  }));

  await upsertMany(
    db,
    "case_steps",
    steps,
    "case_template_id,step_key",
    "case_steps:marketing_urgent_campaign_pii",
  );

  return { template, variant };
}

function reportPayload({ bandPattern, durationMs, recommendation, highRisk = false }) {
  const rationales = {
    contexto: "Entendio el pedido y el deadline sin perder de vista al stakeholder.",
    datos: highRisk
      ? "Incluyo senales utiles, pero dejo pasar datos que debian minimizarse."
      : "Minimizo datos personales y separo senales utiles de identificadores.",
    ejecucion_ia: "Pidio al asistente un output concreto con limites operativos.",
    validacion: highRisk
      ? "Detecto varios problemas, pero acepto una cifra sin evidencia."
      : "Marco claims no verificables antes de pasar el borrador al manager.",
    juicio: highRisk
      ? "Necesita escalar antes de lanzar por riesgo alto de privacidad."
      : "Supo balancear velocidad con una revision corta antes de actuar.",
    impacto: "Convirtio el uso de IA en una decision accionable para manager.",
  };
  const dimensions = Object.entries(bandPattern).map(([id, band]) => ({
    id,
    band,
    rationale: rationales[id],
    confidence: highRisk ? 0.74 : 0.88,
  }));
  return {
    rubric_version: "1.0.0",
    case_version: "marketing_urgent_campaign_pii@1",
    variant: "primary",
    judge_model: "demo-local-seed",
    duration_ms: durationMs,
    dimensions,
    risk_events: highRisk
      ? [
          {
            type: "exposed_pii_to_model",
            severity: "high",
            step_ordinal: 2,
            evidence_text:
              "El prompt mantuvo identificadores directos en el borrador que iba al asistente.",
          },
          {
            type: "accepted_hallucinated_figures",
            severity: "medium",
            step_ordinal: 3,
            evidence_text:
              "No marco una cifra comercial que el asistente presento sin fuente.",
          },
        ]
      : [
          {
            type: "accepted_unverified_claim",
            severity: "low",
            step_ordinal: 3,
            evidence_text:
              "Hubo una frase de performance que pidio revisar antes del lanzamiento.",
          },
        ],
    gaps: highRisk
      ? [
          {
            id: "data_minimization",
            severity: "high",
            observed: "Paso datos personales al modelo sin transformarlos.",
            why_matters: "Puede exponer PII y contaminar el output final.",
          },
          {
            id: "claim_validation",
            severity: "medium",
            observed: "Acepto una cifra sin evidencia.",
            why_matters: "El manager puede tomar una decision con datos falsos.",
          },
        ]
      : [
          {
            id: "manager_note_precision",
            severity: "low",
            observed: "La nota de supuestos pudo ser mas precisa.",
            why_matters: "Mejora la velocidad de decision del manager.",
          },
        ],
    strengths: highRisk
      ? ["Entendio la urgencia", "Identifico parcialmente el riesgo del output"]
      : ["Minimizo datos", "Valido claims", "Propuso una accion manager clara"],
    recommendation: {
      action: recommendation,
      applies_to: "campanas con datos de clientes",
      next_week_actions: highRisk
        ? [
            "Practicar minimizacion de datos antes de usar IA",
            "Usar checklist de claims antes de enviar a manager",
          ]
        : [
            "Correr un piloto con muestra controlada",
            "Documentar supuestos y metricas antes de escalar",
          ],
      reason: highRisk
        ? "Hay riesgo alto que requiere entrenamiento antes de tocar datos reales."
        : "Puede pilotar con supervision ligera y evidencia clara.",
    },
  };
}

async function main() {
  // R-10 (RULES_LEDGER): candado del quality bar — los casos ensamblados se
  // validan con check-assembled-case ANTES de escribir a BD; si falla, abort.
  try {
    execFileSync(process.execPath, ["scripts/simulador/check-assembled-case.mjs"], {
      cwd: ROOT,
      stdio: "inherit",
    });
  } catch {
    console.error("\n✗ Seed abortado: check-assembled-case falló.");
    process.exit(1);
  }

  const { url, serviceKey, studioUrl } = parseLocalSupabaseStatus();
  const rootClient = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const db = rootClient.schema("simulador");

  const { data: rubric, error: rubricError } = await db
    .from("rubrics")
    .select("id, version")
    .eq("slug", "rubric_case_factory_v1")
    .eq("version", "1.0.0")
    .maybeSingle();
  if (rubricError || !rubric) {
    throw new Error(
      `rubric_case_factory_v1@1.0.0 missing: ${rubricError?.message ?? "not found"}`,
    );
  }

  const authIds = new Map();
  for (const user of DEMO_USERS) {
    const authId = await ensureAuthUser(rootClient, user.email, user.full_name);
    authIds.set(user.email, authId);
  }

  await upsertOne(
    db,
    "organizations",
    {
      id: IDS.org,
      name: "Aurora Retail Demo",
      industry: "retail",
      region: "MX",
      company_size_key: "101-300",
      metadata: {
        demo_seed: "codex-local-v1",
        company_profile: {
          website_url: "https://aurora-demo.itera.local",
          website_locked_at: "2026-06-25T00:00:00.000Z",
          files: [
            {
              id: "aurora-context-pdf",
              name: "contexto-aurora-retail.pdf",
              size: 245760,
              type: "application/pdf",
            },
          ],
          files_last_changed_month: DEMO_MONTH_KEY,
          files_last_changed_at: "2026-06-25T00:00:00.000Z",
        },
      },
    },
    "id",
    "organizations:aurora",
  );

  await upsertOne(
    db,
    "teams",
    {
      id: IDS.team,
      organization_id: IDS.org,
      name: "Marketing y Crecimiento",
      department_key: "marketing",
      metadata: { demo_seed: "codex-local-v1", timezone: "America/Mexico_City" },
    },
    "id",
    "teams:marketing",
  );

  for (const user of DEMO_USERS) {
    await upsertOne(
      db,
      "users",
      {
        id: user.id,
        auth_user_id: authIds.get(user.email),
        email: user.email,
        full_name: user.full_name,
        locale: "es-MX",
        jurisdiction: user.jurisdiction,
        consent_locale: "es-MX",
        consent_version: "demo-v1",
        consent_accepted_at: new Date("2026-06-01T15:00:00.000Z").toISOString(),
        consent_metadata_json: { source: "local_seed" },
        metadata: { demo_seed: "codex-local-v1" },
      },
      "id",
      `users:${user.email}`,
    );

    for (const role of user.roles) {
      await upsertOne(
        db,
        "organization_memberships",
        {
          organization_id: IDS.org,
          user_id: user.id,
          role,
        },
        "organization_id,user_id,role",
        `org_membership:${user.email}:${role}`,
      );
    }

    await upsertOne(
      db,
      "team_memberships",
      {
        team_id: IDS.team,
        user_id: user.id,
        role: user.teamRole,
      },
      "team_id,user_id,role",
      `team_membership:${user.email}:${user.teamRole}`,
    );
  }

  await upsertOne(
    db,
    "subscriptions",
    {
      id: IDS.subscription,
      organization_id: IDS.org,
      stripe_customer_id: "cus_demo_aurora_local",
      stripe_subscription_id: "sub_demo_aurora_active",
      status: "active",
      tier: "business", // per-seat $129 × 5 = $645 (R-01: tiers vigentes)
      seats: 5,
      price_usd_total: 645,
      current_period_start: "2026-06-01T00:00:00.000Z",
      current_period_end: "2026-07-01T00:00:00.000Z",
      metadata: {
        demo_seed: "codex-local-v1",
        checkout_session_id: "cs_test_demo_aurora",
        cancel_portal_ready: true,
      },
    },
    "id",
    "subscriptions:aurora",
  );

  await upsertOne(
    db,
    "invitations",
    {
      id: IDS.invitation,
      organization_id: IDS.org,
      team_id: IDS.team,
      invited_by: IDS.manager,
      email: "nueva.persona@aurora-demo.itera.local",
      token: "demo-invite-token-codex-local",
      intended_role: "employee",
      status: "pending",
      expires_at: "2026-07-01T00:00:00.000Z",
    },
    "id",
    "invitations:pending-demo",
  );

  await upsertOne(
    db,
    "sprint_packages",
    {
      id: IDS.sprintPackage,
      slug: "case_factory_demo",
      version: 1,
      name: "Case Factory Demo",
      target_buyer: "manager_operativo",
      target_roles: ["marketing", "growth", "ops"],
      duration_days: 30,
      included_cases: 3,
      included_seats: 5,
      price_usd: 645,
      pricing_json: { seats: 5, monthly_usd: 645 },
      status: "active",
      config_json: { demo_seed: "codex-local-v1" },
    },
    "id",
    "sprint_packages:case_factory_demo",
  );

  const legacyCase = await seedLegacyRuntimeCase(db, rubric.id);

  const assembled = readAssembledCases();
  const generatedResults = [];
  for (const item of assembled) {
    const status = generatedStatus(item.assembly);
    const title = item.playable.sections[0]?.slides[0]?.title ?? item.playable.caseId;
    const level = item.playable.meta?.level ?? null;
    const profilePack = item.playable.meta?.profile_pack ?? null;

    const generated = await upsertOne(
      db,
      "generated_cases",
      {
        organization_id: IDS.org,
        team_id: IDS.team,
        case_id: item.playable.caseId,
        version: item.playable.version,
        title,
        level,
        profile_pack: profilePack,
        playable_json: item.playable,
        manager_outcome_json: item.playable.managerOutcome ?? {},
        generation_method: "engine",
        generation_meta_json: {
          demo_seed: "codex-local-v1",
          source_file: item.file,
          source_status: item.assembly.status,
        },
        status,
        created_by: IDS.manager,
      },
      "organization_id,case_id,version",
      `generated_cases:${item.playable.caseId}`,
    );

    const orgSlug = `${IDS.org}__${item.playable.caseId}__v${item.playable.version}`;
    const orgCase = await seedCaseTemplateFromPlayable(db, rubric.id, item.playable, {
      slug: orgSlug,
      status,
      organizationId: IDS.org,
    });

    if (item.assembly.status === "ready") {
      await seedCaseTemplateFromPlayable(db, rubric.id, item.playable, {
        slug: item.playable.caseId,
        status: "active",
        organizationId: null,
      });
    }

    generatedResults.push({
      generated,
      orgCase,
      playable: item.playable,
      status,
    });
  }

  await upsertMany(
    db,
    "sprint_package_cases",
    [
      {
        sprint_package_id: IDS.sprintPackage,
        case_template_id: legacyCase.template.id,
        display_order: 1,
        status: "ready",
        primary_variant_id: legacyCase.variant.id,
        dimensions_emphasized: ["datos", "validacion", "juicio"],
        difficulty: "baseline",
        tension: "Velocidad vs privacidad",
        is_required: true,
      },
    ],
    "sprint_package_id,case_template_id",
    "sprint_package_cases:demo",
  );

  await upsertOne(
    db,
    "sprints",
    {
      id: IDS.sprint,
      sprint_package_id: IDS.sprintPackage,
      organization_id: IDS.org,
      team_id: IDS.team,
      name: "Sprint demo Aurora - criterio con IA",
      start_date: "2026-06-01",
      end_date: "2026-06-30",
      status: "active",
      target_dimensions: ["contexto", "datos", "ejecucion_ia", "validacion", "juicio", "impacto"],
      metadata: { demo_seed: "codex-local-v1" },
    },
    "id",
    "sprints:aurora-demo",
  );

  const assignments = [
    {
      id: "12121212-1212-4121-8121-121212121201",
      user_id: IDS.ana,
      status: "completed",
      due_at: "2026-06-20T23:59:59.000Z",
    },
    {
      id: "12121212-1212-4121-8121-121212121202",
      user_id: IDS.bruno,
      status: "completed",
      due_at: "2026-06-20T23:59:59.000Z",
    },
    {
      id: "12121212-1212-4121-8121-121212121203",
      user_id: IDS.carla,
      status: "started",
      due_at: "2026-06-20T23:59:59.000Z",
    },
    {
      id: "12121212-1212-4121-8121-121212121204",
      user_id: IDS.diego,
      status: "assigned",
      due_at: "2026-06-20T23:59:59.000Z",
    },
  ].map((row) => ({
    ...row,
    sprint_id: IDS.sprint,
    case_variant_id: legacyCase.variant.id,
    assignment_kind: "primary",
    assigned_by: IDS.manager,
  }));
  await upsertMany(db, "assignments", assignments, "id", "assignments:demo");

  const sessions = [
    {
      id: IDS.sessionAna,
      assignment_id: assignments[0].id,
      user_id: IDS.ana,
      status: "evaluated",
      started_at: "2026-06-10T15:00:00.000Z",
      completed_at: "2026-06-10T15:13:00.000Z",
      last_event_at: "2026-06-10T15:13:00.000Z",
      metadata: { demo_seed: "codex-local-v1", demo_alias: "demo-session-ana" },
    },
    {
      id: IDS.sessionBruno,
      assignment_id: assignments[1].id,
      user_id: IDS.bruno,
      status: "submitted",
      started_at: "2026-06-11T16:00:00.000Z",
      completed_at: "2026-06-11T16:19:00.000Z",
      last_event_at: "2026-06-11T16:19:00.000Z",
      metadata: { demo_seed: "codex-local-v1", demo_alias: "demo-session-id" },
    },
    {
      id: IDS.sessionCarla,
      assignment_id: assignments[2].id,
      user_id: IDS.carla,
      status: "in_progress",
      started_at: "2026-06-12T17:00:00.000Z",
      completed_at: null,
      last_event_at: "2026-06-12T17:08:00.000Z",
      metadata: { demo_seed: "codex-local-v1" },
    },
  ].map((row) => ({
    ...row,
    case_variant_id: legacyCase.variant.id,
    sprint_id: IDS.sprint,
  }));
  await upsertMany(db, "simulation_sessions", sessions, "id", "sessions:demo");

  const stepRows = [
    [IDS.sessionAna, "data_scope", 1, { field_actions: { email: "Descartar", name: "Transformar" } }],
    [IDS.sessionAna, "llm_beat", 2, { user_prompt: "Genera angulos sin PII y sin cifras inventadas." }],
    [IDS.sessionAna, "artifact_review", 3, { segment_flags: { 0: ["unverifiable_claim"] } }],
    [IDS.sessionAna, "decision_select", 4, { option: "option_b" }],
    [IDS.sessionAna, "decision_open_short", 5, { text: "Propongo piloto controlado con supuestos documentados." }],
    [IDS.sessionBruno, "data_scope", 1, { field_actions: { email: "Usar tal cual", name: "Usar tal cual" } }],
    [IDS.sessionBruno, "llm_beat", 2, { user_prompt: "Usa feedback completo para sacar la campana rapido." }],
    [IDS.sessionBruno, "artifact_review", 3, { segment_flags: { 1: [] } }],
    [IDS.sessionCarla, "data_scope", 1, { field_actions: { email: "Descartar" } }],
  ].map(([sessionId, stepKey, ordinal, payload], index) => ({
    id: `abababab-abab-4aba-8aba-${String(index + 1).padStart(12, "0")}`,
    simulation_session_id: sessionId,
    case_step_id: null,
    step_ordinal: ordinal,
    event_type: stepKey,
    payload_json: payload,
    captured_at: new Date(Date.UTC(2026, 5, 10, 15, index)).toISOString(),
  }));
  await upsertMany(
    db,
    "simulation_step_events",
    stepRows,
    "id",
    "simulation_step_events:demo",
  );

  const anaPayload = reportPayload({
    bandPattern: {
      contexto: "A",
      datos: "A",
      ejecucion_ia: "M",
      validacion: "A",
      juicio: "M",
      impacto: "A",
    },
    durationMs: 780000,
    recommendation: "pilotar",
  });
  const brunoPayload = reportPayload({
    bandPattern: {
      contexto: "M",
      datos: "B",
      ejecucion_ia: "M",
      validacion: "B",
      juicio: "B",
      impacto: "M",
    },
    durationMs: 1140000,
    recommendation: "entrenar",
    highRisk: true,
  });

  await upsertMany(
    db,
    "evaluation_runs",
    [
      {
        id: IDS.evalAna,
        simulation_session_id: IDS.sessionAna,
        rubric_id: rubric.id,
        rubric_version: rubric.version,
        judge_model: "demo-local-seed",
        judge_prompt_version: "demo-v1",
        input_snapshot_json: { source: "seed-demo-local", session_id: IDS.sessionAna },
        dimension_scores_json: anaPayload.dimensions,
        gap_tags_json: anaPayload.gaps,
        risk_summary_json: anaPayload.risk_events,
        raw_judge_output_json: anaPayload,
        computed_recommendation: "pilotar",
        override_applied_json: {},
      },
      {
        id: IDS.evalBruno,
        simulation_session_id: IDS.sessionBruno,
        rubric_id: rubric.id,
        rubric_version: rubric.version,
        judge_model: "demo-local-seed",
        judge_prompt_version: "demo-v1",
        input_snapshot_json: { source: "seed-demo-local", session_id: IDS.sessionBruno },
        dimension_scores_json: brunoPayload.dimensions,
        gap_tags_json: brunoPayload.gaps,
        risk_summary_json: brunoPayload.risk_events,
        raw_judge_output_json: brunoPayload,
        computed_recommendation: "entrenar",
        override_applied_json: {},
      },
    ],
    "id",
    "evaluation_runs:demo",
  );

  await upsertMany(
    db,
    "reports",
    [
      {
        id: IDS.reportAna,
        sprint_id: IDS.sprint,
        user_id: IDS.ana,
        simulation_session_id: IDS.sessionAna,
        report_type: "participant_mirror",
        status: "published",
        payload_json: anaPayload,
        generated_by: IDS.manager,
        generated_at: "2026-06-10T15:14:00.000Z",
        shared_at: "2026-06-10T15:15:00.000Z",
      },
      {
        id: IDS.reportBruno,
        sprint_id: IDS.sprint,
        user_id: IDS.bruno,
        simulation_session_id: IDS.sessionBruno,
        report_type: "participant_mirror",
        status: "pending_review",
        payload_json: brunoPayload,
        generated_by: IDS.manager,
        generated_at: "2026-06-11T16:20:00.000Z",
        shared_at: null,
      },
      {
        id: IDS.sprintReportExecutive,
        sprint_id: IDS.sprint,
        user_id: null,
        simulation_session_id: null,
        report_type: "executive_summary",
        status: "published",
        payload_json: {
          demo_seed: "codex-local-v1",
          headline: "Equipo con 50% completado y un caso en review humano.",
        },
        generated_by: IDS.manager,
        generated_at: "2026-06-12T18:00:00.000Z",
      },
    ],
    "id",
    "reports:demo",
  );

  await upsertOne(
    db,
    "human_review_queue",
    {
      id: IDS.reviewBruno,
      evaluation_run_id: IDS.evalBruno,
      triggered_by: "high_risk_event",
      status: "queued",
      assigned_to: null,
      due_at: "2026-06-12T16:20:00.000Z",
      resolver_notes: null,
      required_review_count: 2,
      completed_review_count: 0,
      review_policy: "double_high_risk",
      decision_summary_json: [],
    },
    "id",
    "human_review_queue:bruno",
  );

  await upsertMany(
    db,
    "risk_events",
    [
      {
        id: IDS.riskAna,
        simulation_session_id: IDS.sessionAna,
        case_step_id: null,
        event_type: "accepted_unverified_claim",
        severity: "low",
        dimension_key: "validacion",
        evidence_text:
          "Pidio revisar una cifra antes de lanzar, por lo que quedo como riesgo bajo.",
        detected_by: "judge",
        judge_confidence: 0.71,
        escalation_status: "none",
        payload_json: { demo_seed: "codex-local-v1" },
      },
      {
        id: IDS.riskBruno1,
        simulation_session_id: IDS.sessionBruno,
        case_step_id: null,
        event_type: "exposed_pii_to_model",
        severity: "high",
        dimension_key: "datos",
        sensitive_data_type: "email",
        evidence_text: "El prompt mantuvo email y nombre completos.",
        jurisdiction_of_data_subject: "CO",
        transfer_basis_documented: false,
        detected_by: "judge",
        judge_confidence: 0.82,
        escalation_status: "pending",
        payload_json: { demo_seed: "codex-local-v1" },
      },
      {
        id: IDS.riskBruno2,
        simulation_session_id: IDS.sessionBruno,
        case_step_id: null,
        event_type: "accepted_hallucinated_figures",
        severity: "medium",
        dimension_key: "validacion",
        evidence_text: "Acepto una cifra inventada como argumento de campana.",
        detected_by: "judge",
        judge_confidence: 0.76,
        escalation_status: "none",
        payload_json: { demo_seed: "codex-local-v1" },
      },
    ],
    "id",
    "risk_events:demo",
  );

  await upsertOne(
    db,
    "evidence_snapshots",
    {
      id: IDS.evidenceAna,
      simulation_session_id: IDS.sessionAna,
      sprint_id: IDS.sprint,
      team_id: IDS.team,
      user_id: IDS.ana,
      evidence_kind: "readiness_dimension_scores",
      payload_json: { dimensions: anaPayload.dimensions },
    },
    "id",
    "evidence_snapshots:ana",
  );

  await upsertOne(
    db,
    "manager_recommendations",
    {
      id: IDS.recommendationAna,
      sprint_id: IDS.sprint,
      team_id: IDS.team,
      user_id: IDS.ana,
      recommendation: "pilotar",
      justification_text:
        "Ana puede pilotar con muestra controlada; documento supuestos y riesgos.",
      evidence_snapshot_ids: [IDS.evidenceAna],
    },
    "id",
    "manager_recommendations:ana",
  );

  await upsertOne(
    db,
    "manager_alerts",
    {
      id: IDS.managerAlert,
      organization_id: IDS.org,
      team_id: IDS.team,
      sprint_id: IDS.sprint,
      manager_user_id: IDS.manager,
      subject_user_id: IDS.bruno,
      source_session_id: IDS.sessionBruno,
      alert_type: "high_risk_review_required",
      severity: "high",
      status: "queued",
      title: "Review humano requerido",
      body: "Bruno expuso PII en el prompt y el reporte quedo pendiente.",
      payload_json: { queue_id: IDS.reviewBruno },
    },
    "id",
    "manager_alerts:bruno",
  );

  const practiceRows = readdirSync(PRACTICE_DIR)
    .filter((file) => file.endsWith(".yaml") || file.endsWith(".yml"))
    .sort()
    .map((file) => {
      const doc = readYaml(path.join(PRACTICE_DIR, file));
      const beat = doc.practice_beat;
      if (!beat?.id) throw new Error(`${file} missing practice_beat.id`);
      const dimension = String(beat.dimension ?? "datos");
      return {
        slug: beat.id,
        title: beat.principle_card?.headline ?? beat.id,
        target_gap_keys: Array.isArray(beat.triggered_by_gap)
          ? beat.triggered_by_gap.map(String)
          : beat.triggered_by_gap
            ? [String(beat.triggered_by_gap)]
            : [],
        duration_estimate_min: Math.max(
          1,
          Math.ceil(Number(beat.duration_max_seconds ?? 120) / 60),
        ),
        content_json: beat,
        status: beat.status === "ready" ? "active" : (beat.status ?? "active"),
        dimension_key: dimension,
        level: Number(beat.level ?? 1),
        career_key: careerForProfilePack(beat.career_key ?? "marketing"),
        expected_signals_json: {
          triggered_by_gap: beat.triggered_by_gap ?? null,
          exercise_type: beat.practice_exercise?.type ?? null,
        },
        completion_criteria_json: {
          duration_max_seconds: beat.duration_max_seconds ?? null,
          completion_criteria: beat.completion_criteria ?? null,
        },
      };
    });
  const seededPractice = await upsertMany(
    db,
    "practice_beats",
    practiceRows,
    "slug",
    "practice_beats:demo",
  );

  const dataMinimizationBeat =
    seededPractice.find((beat) => beat.slug === "practice_agent_data_minimization_v1") ??
    seededPractice[0];
  if (dataMinimizationBeat) {
    const unlock = await upsertOne(
      db,
      "practice_unlocks",
      {
        user_id: IDS.bruno,
        sprint_id: IDS.sprint,
        practice_beat_id: dataMinimizationBeat.id,
        source_session_id: IDS.sessionBruno,
        gap_key: "data_minimization",
        dimension_key: "datos",
        unlock_reason: "high_risk_event",
        status: "unlocked",
        due_at: "2026-06-18T23:59:59.000Z",
        metadata_json: { demo_seed: "codex-local-v1" },
      },
      "user_id,practice_beat_id,source_session_id",
      "practice_unlocks:bruno",
    );

    await upsertOne(
      db,
      "practice_attempts",
      {
        id: IDS.practiceAttempt,
        practice_beat_id: dataMinimizationBeat.id,
        practice_unlock_id: unlock.id,
        user_id: IDS.bruno,
        sprint_id: IDS.sprint,
        source_session_id: IDS.sessionBruno,
        status: "started",
        score_band: null,
        score_numeric: null,
        response_json: { draft: "El usuario esta practicando minimizacion de datos." },
        feedback_json: {},
        started_at: "2026-06-12T18:00:00.000Z",
        completed_at: null,
      },
      "id",
      "practice_attempts:bruno",
    );
  }

  const counts = {};
  for (const table of [
    "organizations",
    "users",
    "generated_cases",
    "case_templates",
    "simulation_sessions",
    "reports",
    "practice_beats",
  ]) {
    const { count, error } = await db
      .from(table)
      .select("id", { head: true, count: "exact" });
    if (!error) counts[table] = count ?? 0;
  }

  console.log("Seed demo local aplicado.");
  console.log(`Supabase local: ${url}`);
  console.log(`Studio local: ${studioUrl ?? "(sin studio url)"}`);
  console.log(`Org demo: ${IDS.org}`);
  console.log(`Manager demo: manager.demo@itera.local / ${DEMO_PASSWORD}`);
  console.log(
    `Participantes: ${DEMO_USERS.filter((u) => u.teamRole === "employee")
      .map((u) => u.email)
      .join(", ")}`,
  );
  console.log(
    `Casos generados: ${generatedResults.length}; practice beats: ${seededPractice.length}; session report demo: ${IDS.sessionAna}`,
  );
  console.log(`Conteos: ${JSON.stringify(counts)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

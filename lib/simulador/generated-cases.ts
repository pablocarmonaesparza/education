// Capa de datos de los casos generados por empresa (tabla
// simulador.generated_cases). El motor persiste; el runtime productivo carga.
//
// El motor (Claude / API del cliente en producción) escribe via service_role
// (createAdminClient). Las lecturas en el runtime respetan RLS (createClient).

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  PLAYABLE_CASES,
  type PlayableCase,
} from "@/lib/simulador/cases-registry.generated";

export interface PersistGeneratedCaseInput {
  organizationId: string;
  teamId?: string | null;
  playableCase: PlayableCase;
  method?: "engine" | "manual";
  meta?: Record<string, unknown>;
  createdBy?: string | null;
  status?: "draft" | "active" | "archived";
}

// Mapea cada uno de los 17 bloques ricos a uno de los 5 step_types canónicos que
// el check de case_steps permite. Esto deja al caso generado JUGABLE y EVALUABLE
// con la infra de sesiones/juez existente, sin alterar el constraint productivo.
// El contenido rico real vive en config_json (caseContext) y en playable_json.
const STEP_TYPE_BY_BLOCK: Record<string, string> = {
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

const SIM_DIMENSIONS = ["contexto", "privacidad", "validacion", "juicio", "decision"];

function difficultyForLevel(level?: string): string {
  if (!level) return "baseline";
  if (level.includes("N3")) return "advanced";
  if (level.includes("N2")) return "intermediate";
  return "baseline";
}

// Slug ORG-SCOPED para aislar el case_template/variant/steps de cada empresa (dos
// empresas con el mismo caso no colisionan, y /api/sessions resuelve el de su org).
export function orgScopedSlug(
  orgId: string,
  caseId: string,
  version: number,
): string {
  return `${orgId}__${caseId}__v${version}`;
}

// Siembra las tablas productivas (case_templates + case_variants primary +
// case_steps con step_key=slideId) para que POST /api/sessions resuelva el caso,
// PATCH /responses valide el step_key, y el juez (que lee case_steps dinámicamente)
// lo evalúe. Idempotente: upsert por step_key (no borra, así no orfana respuestas).
async function seedProductiveCaseTables(
  admin: ReturnType<typeof createAdminClient>,
  pc: PlayableCase,
  orgId: string,
): Promise<void> {
  const difficulty = difficultyForLevel(pc.meta?.level as string | undefined);
  const title = pc.sections[0]?.slides[0]?.title ?? pc.caseId;
  const slug = orgScopedSlug(orgId, pc.caseId, pc.version);

  // El juez exige template.rubric_id; usamos la rúbrica del case factory.
  const { data: rubric } = await admin
    .schema("simulador")
    .from("rubrics")
    .select("id")
    .eq("slug", "rubric_case_factory_v1")
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: tpl, error: tErr } = await admin
    .schema("simulador")
    .from("case_templates")
    .upsert(
      {
        slug,
        version: pc.version,
        status: "active",
        difficulty,
        locale: "es-MX",
        title,
        rubric_id: (rubric?.id as string | undefined) ?? null,
        expected_manager_action_json: pc.managerOutcome ?? {},
      },
      { onConflict: "slug,version" },
    )
    .select("id")
    .single();
  if (tErr) throw new Error(`seed case_templates: ${tErr.message}`);
  const templateId = (tpl as { id: string }).id;

  const { error: vErr } = await admin
    .schema("simulador")
    .from("case_variants")
    .upsert(
      {
        slug: `${slug}_primary`,
        case_template_id: templateId,
        variant_role: "primary",
        status: "active",
        synthetic_data: true,
      },
      { onConflict: "slug" },
    );
  if (vErr) throw new Error(`seed case_variants: ${vErr.message}`);

  const rows: Array<Record<string, unknown>> = [];
  let ordinal = 0;
  for (const sec of pc.sections) {
    for (const sl of sec.slides) {
      ordinal++;
      rows.push({
        case_template_id: templateId,
        step_key: sl.slideId,
        ordinal,
        step_type: STEP_TYPE_BY_BLOCK[sl.blockId] ?? "data_scope",
        prompt_template: `${sl.title}\n\n${sl.body}`.slice(0, 4000),
        config_json: sl.caseContext ?? {},
        evaluates_dimensions: SIM_DIMENSIONS,
      });
    }
  }
  if (rows.length) {
    // Upsert por step_key: preserva los ids de los steps existentes (las
    // respuestas en simulation_step_events los referencian), no los orfana.
    const { error: sErr } = await admin
      .schema("simulador")
      .from("case_steps")
      .upsert(rows, { onConflict: "case_template_id,step_key" });
    if (sErr) throw new Error(`seed case_steps: ${sErr.message}`);
  }
}

/** Persiste (upsert) un caso generado para una organización. Service role. */
export async function persistGeneratedCase(
  input: PersistGeneratedCaseInput,
): Promise<{ id: string }> {
  const admin = createAdminClient();
  const pc = input.playableCase;
  const { data, error } = await admin
    .schema("simulador")
    .from("generated_cases")
    .upsert(
      {
        organization_id: input.organizationId,
        team_id: input.teamId ?? null,
        case_id: pc.caseId,
        version: pc.version,
        title: pc.sections[0]?.slides[0]?.title ?? pc.caseId,
        level: (pc.meta?.level as string | undefined) ?? null,
        profile_pack: (pc.meta?.profile_pack as string | undefined) ?? null,
        playable_json: pc,
        manager_outcome_json: pc.managerOutcome ?? {},
        generation_method: input.method ?? "engine",
        generation_meta_json: input.meta ?? {},
        status: input.status ?? "active",
        created_by: input.createdBy ?? null,
      },
      { onConflict: "organization_id,case_id,version" },
    )
    .select("id")
    .single();
  if (error) throw new Error(`persistGeneratedCase: ${error.message}`);
  // Siembra las tablas productivas (template + variant + steps) para que el caso
  // sea jugable y evaluable con la infra de sesiones/juez existente.
  await seedProductiveCaseTables(admin, pc, input.organizationId);
  return data as { id: string };
}

/**
 * Carga un caso jugable para una organización: primero el caso generado de esa
 * empresa (la base), y si no existe, el registro estático (casos sembrados o
 * globales). Devuelve null si no hay ninguno.
 */
export async function loadPlayableCaseForOrg(
  organizationId: string,
  caseId: string,
): Promise<PlayableCase | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .schema("simulador")
    .from("generated_cases")
    .select("playable_json")
    .eq("organization_id", organizationId)
    .eq("case_id", caseId)
    .eq("status", "active")
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (data?.playable_json) return data.playable_json as PlayableCase;
  return PLAYABLE_CASES[caseId] ?? null;
}

/**
 * Siembra una organización nueva con la biblioteca de casos (el registro de
 * casos ricos generados por el motor). Idempotente (upsert). Lo llama el
 * onboarding cuando se crea el equipo/sprint, para que la empresa tenga casos
 * jugables desde el día uno. La generación bespoke por empresa (en vivo, con la
 * llave del cliente) es el siguiente paso; esto da la biblioteca curada ya.
 */
export async function seedOrgWithLibrary(
  organizationId: string,
  teamId?: string | null,
  createdBy?: string | null,
): Promise<Array<{ caseId: string; id?: string; error?: string }>> {
  const results: Array<{ caseId: string; id?: string; error?: string }> = [];
  for (const pc of Object.values(PLAYABLE_CASES)) {
    try {
      const r = await persistGeneratedCase({
        organizationId,
        teamId: teamId ?? null,
        playableCase: pc,
        method: "engine",
        status: "active",
        createdBy: createdBy ?? null,
      });
      results.push({ caseId: pc.caseId, id: r.id });
    } catch (e) {
      results.push({ caseId: pc.caseId, error: e instanceof Error ? e.message : String(e) });
    }
  }
  return results;
}

/** Resuelve la organización del usuario autenticado (la primera membresía). */
export async function resolveCurrentOrgId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: simUserId } = await supabase
    .schema("simulador")
    .rpc("current_simulador_user_id");
  if (!simUserId) return null;
  // Orden determinista (la membresía más antigua) para que un usuario multi-org
  // caiga siempre en la misma org. La selección explícita de org por URL es una
  // mejora futura (/jugar no lleva org_id hoy).
  const { data: membership } = await supabase
    .schema("simulador")
    .from("organization_memberships")
    .select("organization_id")
    .eq("user_id", simUserId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return (membership?.organization_id as string | undefined) ?? null;
}

/** Lista los casos generados de una organización (para el índice de casos). */
export async function listGeneratedCasesForOrg(
  organizationId: string,
): Promise<Array<{ caseId: string; title: string; status: string }>> {
  const supabase = await createClient();
  const { data } = await supabase
    .schema("simulador")
    .from("generated_cases")
    .select("case_id, title, status")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((r) => ({
    caseId: r.case_id as string,
    title: r.title as string,
    status: r.status as string,
  }));
}

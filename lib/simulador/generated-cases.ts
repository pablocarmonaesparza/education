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
  // NO se siembra en case_templates/case_steps: esas tablas son GLOBALES (RLS
  // authenticated_read), así que poner contenido bespoke por empresa ahí lo
  // filtraría entre tenants. El caso bespoke vive aislado en generated_cases
  // (RLS por empresa) y se juega vía RuntimeExperienceV2. La EVALUACIÓN
  // productiva (sesión + juez) requiere un modelo de sesión org-scoped (org_id +
  // RLS en case_templates + org-auth en /api/sessions); es el cambio deliberado
  // siguiente, fuera de esta operación por tocar el path de seguridad productivo.
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

/**
 * GET /api/cases — catálogo real de casos del viewer (R-29).
 *
 * Devuelve los case_templates jugables para el usuario autenticado:
 * globales (organization_id null) + los de sus orgs, status=active,
 * deduplicados por slug (gana la versión más alta), con el estado del
 * viewer por caso (sesión más reciente → not_started | in_progress |
 * completed) y su banda si el reporte existe.
 *
 * Reemplaza al mock lib/simulador/cases.ts en /casos, /team y /staff/casos.
 * Mismo scope explícito que POST /api/sessions (admin client, por eso el
 * or() de orgs es obligatorio — sin oráculo de existencia de bespoke ajenos).
 *
 * Respuesta: 200 { cases: CaseCatalogItem[] } · 401 { error }
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isDevBypassActive } from "@/lib/dev/devBypass";
import type {
  Band,
  CaseCatalogItem,
  CatalogLevel,
  UserCaseStatus,
} from "@/lib/simulador/case-catalog";

export const runtime = "nodejs";

const COMPLETED = new Set(["completed", "submitted", "evaluated", "evidence_emitted"]);
const IN_PROGRESS = new Set(["in_progress", "paused"]);

type TemplateRow = {
  id: string;
  slug: string;
  version: number;
  title: string;
  difficulty: string | null;
  duration_estimate_min: number | null;
  level_primary: string | null;
  career_key: string | null;
  organization_id: string | null;
  context_template_json: Record<string, unknown> | null;
};

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const admin = createAdminClient();

  let simUserId: string | null = null;
  let viewerOrgIds: string[] = [];

  if (user) {
    const { data: simUser } = await admin
      .schema("simulador")
      .from("users")
      .select("id")
      .eq("auth_user_id", user.id)
      .maybeSingle();
    if (!simUser) {
      return NextResponse.json(
        { error: "Bridge user no inicializado. Re-loguéate." },
        { status: 500 },
      );
    }
    simUserId = simUser.id as string;
    const { data: viewerOrgs } = await admin
      .schema("simulador")
      .from("organization_memberships")
      .select("organization_id")
      .eq("user_id", simUserId);
    viewerOrgIds = (viewerOrgs ?? [])
      .map((r) => r.organization_id as string)
      .filter(Boolean);
  } else {
    // Dev-only: bypass activo → catálogo de la org demo con los estados del
    // primer participante sembrado (QA realista). Imposible en prod (R-06).
    const cookieStore = await cookies();
    if (!isDevBypassActive(cookieStore.get("itera_dev_bypass")?.value)) {
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    }
    const { data: demoOrg } = await admin
      .schema("simulador")
      .from("organizations")
      .select("id")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (demoOrg?.id) viewerOrgIds = [demoOrg.id as string];
    const { data: demoUser } = await admin
      .schema("simulador")
      .from("users")
      .select("id")
      .ilike("email", "ana.demo@%")
      .limit(1)
      .maybeSingle();
    simUserId = (demoUser?.id as string) ?? null;
  }

  // Templates activos accesibles (globales + orgs del viewer).
  let templateQuery = admin
    .schema("simulador")
    .from("case_templates")
    .select(
      "id, slug, version, title, difficulty, duration_estimate_min, level_primary, career_key, organization_id, context_template_json",
    )
    .eq("status", "active");
  templateQuery = viewerOrgIds.length
    ? templateQuery.or(
        `organization_id.is.null,organization_id.in.(${viewerOrgIds.join(",")})`,
      )
    : templateQuery.is("organization_id", null);
  const { data: templates } = await templateQuery.order("version", {
    ascending: false,
  });

  // Dedupe por CASO BASE: el slug org-scoped es `{orgId}__{caseId}__vN` y el
  // global es `caseId` — el mismo caso no debe aparecer dos veces en el
  // catálogo. La copia de la org (bespoke/tailored) gana sobre la global;
  // entre versiones gana la más alta (ya viene ordenado desc).
  const baseCaseId = (t: TemplateRow) => {
    const m = t.slug.match(/^[0-9a-f-]{36}__(.+)__v\d+$/);
    return m ? m[1] : t.slug;
  };
  const byBase = new Map<string, TemplateRow>();
  for (const t of (templates ?? []) as TemplateRow[]) {
    const key = baseCaseId(t);
    const existing = byBase.get(key);
    if (!existing) { byBase.set(key, t); continue; }
    const tIsOrg = t.organization_id !== null;
    const exIsOrg = existing.organization_id !== null;
    if (tIsOrg && !exIsOrg) byBase.set(key, t); // org-scoped gana
  }
  const deduped = [...byBase.values()];
  if (deduped.length === 0) return NextResponse.json({ cases: [] });

  // Estado del viewer: sesiones más recientes por template (vía variants).
  const templateIds = deduped.map((t) => t.id);
  const { data: variants } = await admin
    .schema("simulador")
    .from("case_variants")
    .select("id, case_template_id")
    .in("case_template_id", templateIds);
  const templateByVariant = new Map(
    (variants ?? []).map((v) => [v.id as string, v.case_template_id as string]),
  );

  const statusByTemplate = new Map<
    string,
    { status: UserCaseStatus; completedAt?: string; band?: Band; sessionAt: string }
  >();

  if (simUserId && templateByVariant.size > 0) {
    const { data: sessions } = await admin
      .schema("simulador")
      .from("simulation_sessions")
      .select("id, status, completed_at, started_at, case_variant_id")
      .eq("user_id", simUserId)
      .in("case_variant_id", [...templateByVariant.keys()])
      .order("started_at", { ascending: false, nullsFirst: false });

    const sessionIds = (sessions ?? []).map((s) => s.id as string);
    const bandBySession = new Map<string, Band>();
    if (sessionIds.length > 0) {
      const { data: reports } = await admin
        .schema("simulador")
        .from("reports")
        .select("simulation_session_id, payload_json")
        .in("simulation_session_id", sessionIds);
      for (const r of reports ?? []) {
        const dims = (r.payload_json as { dimensions?: { band?: string }[] })
          ?.dimensions;
        if (!dims?.length) continue;
        // Banda global = la peor banda entre dimensiones sería injusta; usamos
        // la mediana simple del reporte ya calculada en la UI — aquí solo
        // exponemos la banda dominante (moda) como resumen del caso.
        const counts: Record<string, number> = {};
        for (const d of dims) if (d.band) counts[d.band] = (counts[d.band] ?? 0) + 1;
        const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
        if (top === "A" || top === "M" || top === "B") {
          bandBySession.set(r.simulation_session_id as string, top);
        }
      }
    }

    for (const s of sessions ?? []) {
      const templateId = templateByVariant.get(s.case_variant_id as string);
      if (!templateId || statusByTemplate.has(templateId)) continue; // más reciente gana
      const raw = s.status as string;
      const status: UserCaseStatus = COMPLETED.has(raw)
        ? "completed"
        : IN_PROGRESS.has(raw)
          ? "in_progress"
          : "not_started";
      statusByTemplate.set(templateId, {
        status,
        completedAt: (s.completed_at as string) ?? undefined,
        band: bandBySession.get(s.id as string),
        sessionAt: (s.started_at as string) ?? "",
      });
    }
  }

  const cases: CaseCatalogItem[] = deduped.map((t) => {
    const st = statusByTemplate.get(t.id);
    // level_primary puede venir numérico (1/2/3) o string ("N2 · Operación").
    const rawLevel = String(t.level_primary ?? "1");
    const levelDigit = rawLevel.match(/[123]/)?.[0] ?? "1";
    const level = `N${levelDigit}` as CatalogLevel;
    const brief = t.context_template_json as { hook?: string; brief?: string } | null;
    return {
      slug: t.slug,
      title: t.title,
      primaryQuestion:
        (typeof brief?.hook === "string" && brief.hook) ||
        (typeof brief?.brief === "string" && brief.brief) ||
        undefined,
      level,
      department: t.career_key ?? undefined,
      estimatedMinutes: t.duration_estimate_min ?? 20,
      difficulty: t.difficulty,
      userStatus: st?.status ?? "not_started",
      userCompletedAt: st?.completedAt,
      userBand: st?.band,
    };
  });

  // Orden: en curso primero, luego no iniciados, completados al final.
  const rank: Record<UserCaseStatus, number> = {
    in_progress: 0,
    not_started: 1,
    completed: 2,
  };
  cases.sort((a, b) => rank[a.userStatus] - rank[b.userStatus]);

  return NextResponse.json({ cases });
}

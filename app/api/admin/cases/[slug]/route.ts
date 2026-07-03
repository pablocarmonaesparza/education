/**
 * GET /api/admin/cases/[slug] — efectividad de UN caso (staff, R-29 / F3).
 *
 * `slug` puede ser el slug global (`marketing_urgent_campaign_pii`) o uno
 * org-scoped (`{orgId}__{base}__v{n}`). Se resuelve al CASO BASE y se agregan
 * TODOS los templates que lo comparten (la biblioteca global + cada copia
 * bespoke de las orgs), porque "efectividad del caso" cruza organizaciones.
 *
 * Agrega:
 *   - meta del template canónico (título, nivel, career, status, duración)
 *   - orgs que lo usan (nombre) — org-scoped templates + orgs con sesiones
 *   - completions: personas distintas que lo terminaron
 *   - band_distribution: banda dominante (moda de dimensiones) por sesión
 *     completada con reporte
 *
 * Solo staff Itera. Service role (agrega across orgs/users).
 * 200 { case, effectiveness } · 404 si el caso base no existe.
 */

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSimuladorStaff } from "@/lib/simulador/admin-auth";

export const runtime = "nodejs";

const COMPLETED_STATUSES = new Set([
  "completed",
  "submitted",
  "evaluated",
  "evidence_emitted",
]);

/** `{uuid}__{base}__v{n}` → base; si no matchea, el slug ES el base. */
function baseCaseId(slug: string): string {
  const m = slug.match(/^[0-9a-f-]{36}__(.+)__v\d+$/);
  return m ? m[1] : slug;
}

type TemplateRow = {
  id: string;
  slug: string;
  title: string;
  status: string;
  version: number;
  level_primary: string | number | null;
  career_key: string | null;
  difficulty: string | null;
  duration_estimate_min: number | null;
  organization_id: string | null;
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const staff = await requireSimuladorStaff();
  if (!staff.ok) return staff.response;

  const { slug } = await params;
  const base = baseCaseId(slug);
  const admin = createAdminClient();

  // Todos los templates que comparten el caso base (global + bespoke por org).
  const { data: templates, error: tplErr } = await admin
    .schema("simulador")
    .from("case_templates")
    .select(
      "id, slug, title, status, version, level_primary, career_key, difficulty, duration_estimate_min, organization_id",
    )
    .or(`slug.eq.${base},slug.like.%__${base}__v%`)
    .order("version", { ascending: false });

  if (tplErr) {
    console.error("[admin/cases/:slug] template query failed", tplErr);
    return NextResponse.json({ error: "Error cargando el caso." }, { status: 500 });
  }

  const rows = (templates ?? []) as TemplateRow[];
  if (rows.length === 0) {
    return NextResponse.json({ error: "Caso no encontrado." }, { status: 404 });
  }

  // Template canónico para meta: preferimos el global; si no, la versión más alta.
  const canonical =
    rows.find((t) => t.organization_id === null) ?? rows[0];

  const templateIds = rows.map((t) => t.id);
  const orgIds = Array.from(
    new Set(
      rows.map((t) => t.organization_id).filter((id): id is string => Boolean(id)),
    ),
  );

  // Variants de todos esos templates → sesiones.
  const { data: variants } = await admin
    .schema("simulador")
    .from("case_variants")
    .select("id, case_template_id")
    .in("case_template_id", templateIds);
  const variantIds = (variants ?? []).map((v) => v.id as string);

  let sessionsCompleted = 0;
  let sessionsTotal = 0;
  const completerUserIds = new Set<string>();
  const orgIdsWithSessions = new Set<string>();
  const bandDistribution: Record<string, number> = { A: 0, M: 0, B: 0 };

  if (variantIds.length > 0) {
    const { data: sessions } = await admin
      .schema("simulador")
      .from("simulation_sessions")
      .select("id, status, user_id")
      .in("case_variant_id", variantIds);

    const sessionRows = (sessions ?? []) as Array<{
      id: string;
      status: string;
      user_id: string;
    }>;
    sessionsTotal = sessionRows.length;

    const completedSessionIds: string[] = [];
    const userIdsInvolved = new Set<string>();
    for (const s of sessionRows) {
      userIdsInvolved.add(s.user_id);
      if (COMPLETED_STATUSES.has(s.status)) {
        sessionsCompleted += 1;
        completerUserIds.add(s.user_id);
        completedSessionIds.push(s.id);
      }
    }

    // Orgs con sesiones: vía organization_memberships de los usuarios.
    if (userIdsInvolved.size > 0) {
      const { data: memberships } = await admin
        .schema("simulador")
        .from("organization_memberships")
        .select("organization_id, user_id")
        .in("user_id", [...userIdsInvolved]);
      for (const m of memberships ?? []) {
        if (m.organization_id) orgIdsWithSessions.add(m.organization_id as string);
      }
    }

    // Banda dominante por sesión completada (moda de dimensiones del reporte).
    if (completedSessionIds.length > 0) {
      const { data: reports } = await admin
        .schema("simulador")
        .from("reports")
        .select("simulation_session_id, payload_json")
        .in("simulation_session_id", completedSessionIds);
      for (const r of reports ?? []) {
        const dims = (r.payload_json as { dimensions?: { band?: string }[] })
          ?.dimensions;
        if (!dims?.length) continue;
        const counts: Record<string, number> = {};
        for (const d of dims) if (d.band) counts[d.band] = (counts[d.band] ?? 0) + 1;
        const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
        if (top === "A" || top === "M" || top === "B") bandDistribution[top] += 1;
      }
    }
  }

  // Nombres de orgs: las dueñas de templates bespoke + las que tienen sesiones.
  const allOrgIds = Array.from(new Set([...orgIds, ...orgIdsWithSessions]));
  const orgNameById = new Map<string, string>();
  if (allOrgIds.length > 0) {
    const { data: orgs } = await admin
      .schema("simulador")
      .from("organizations")
      .select("id, name")
      .in("id", allOrgIds);
    for (const o of orgs ?? []) orgNameById.set(o.id as string, o.name as string);
  }

  const orgsUsing = allOrgIds.map((id) => ({
    id,
    name: orgNameById.get(id) ?? "Organización",
    bespoke: orgIds.includes(id),
  }));

  return NextResponse.json({
    case: {
      base_case_id: base,
      slug: canonical.slug,
      title: canonical.title,
      status: canonical.status,
      version: canonical.version,
      level_primary:
        canonical.level_primary === null ? null : String(canonical.level_primary),
      career_key: canonical.career_key,
      difficulty: canonical.difficulty,
      duration_estimate_min: canonical.duration_estimate_min,
      variants_count: rows.length,
    },
    effectiveness: {
      orgs_using: orgsUsing,
      orgs_count: orgsUsing.length,
      sessions_total: sessionsTotal,
      sessions_completed: sessionsCompleted,
      unique_completers: completerUserIds.size,
      band_distribution: bandDistribution,
    },
  });
}

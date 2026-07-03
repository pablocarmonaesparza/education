/**
 * GET /api/admin/cases — inventario staff de case_templates (R-29).
 *
 * Lista TODOS los case_templates (cualquier status: active, draft, archived)
 * con su uso real: sesiones totales y completadas resueltas vía
 * case_variants → simulation_sessions, y el nombre de la org dueña cuando el
 * template es org-scoped (organization_id != null; null = biblioteca global).
 *
 * Solo staff Itera (requireSimuladorStaff honra el dev bypass de solo
 * lectura). Usa service role porque agrega across users/orgs.
 *
 * Respuesta: 200 { cases: AdminCaseItem[] } ordenado por título.
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

type TemplateRow = {
  id: string;
  slug: string;
  title: string;
  status: string;
  version: number;
  level_primary: string | number | null;
  career_key: string | null;
  duration_estimate_min: number | null;
  organization_id: string | null;
};

export type AdminCaseItem = {
  id: string;
  slug: string;
  title: string;
  status: string;
  version: number;
  level_primary: string | null;
  career_key: string | null;
  duration_estimate_min: number | null;
  organization_id: string | null;
  organization_name: string | null;
  sessions_total: number;
  sessions_completed: number;
};

export async function GET() {
  const staff = await requireSimuladorStaff();
  if (!staff.ok) return staff.response;

  const admin = createAdminClient();

  const { data: templates, error: tplError } = await admin
    .schema("simulador")
    .from("case_templates")
    .select(
      "id, slug, title, status, version, level_primary, career_key, duration_estimate_min, organization_id",
    )
    .order("title", { ascending: true })
    .limit(1000);

  if (tplError) {
    console.error("[admin/cases] list failed", tplError);
    return NextResponse.json(
      { error: "Error listando casos." },
      { status: 500 },
    );
  }

  const templateRows = (templates ?? []) as TemplateRow[];
  if (templateRows.length === 0) {
    return NextResponse.json({ cases: [] });
  }

  const templateIds = templateRows.map((t) => t.id);
  const orgIds = Array.from(
    new Set(
      templateRows
        .map((t) => t.organization_id)
        .filter((id): id is string => Boolean(id)),
    ),
  );

  const [variantsRes, orgsRes] = await Promise.all([
    admin
      .schema("simulador")
      .from("case_variants")
      .select("id, case_template_id")
      .in("case_template_id", templateIds),
    orgIds.length > 0
      ? admin
          .schema("simulador")
          .from("organizations")
          .select("id, name")
          .in("id", orgIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (variantsRes.error) {
    console.error("[admin/cases] variants join failed", variantsRes.error);
    return NextResponse.json(
      { error: "Error resolviendo el uso de los casos." },
      { status: 500 },
    );
  }
  if (orgsRes.error) {
    console.error("[admin/cases] orgs join failed", orgsRes.error);
    return NextResponse.json(
      { error: "Error resolviendo las organizaciones." },
      { status: 500 },
    );
  }

  const orgNameById = new Map<string, string>(
    ((orgsRes.data ?? []) as Array<{ id: string; name: string }>).map((o) => [
      o.id,
      o.name,
    ]),
  );

  const templateByVariant = new Map<string, string>(
    (
      (variantsRes.data ?? []) as Array<{ id: string; case_template_id: string }>
    ).map((v) => [v.id, v.case_template_id]),
  );

  const usageByTemplate = new Map<
    string,
    { total: number; completed: number }
  >();

  if (templateByVariant.size > 0) {
    const { data: sessions, error: sessError } = await admin
      .schema("simulador")
      .from("simulation_sessions")
      .select("case_variant_id, status")
      .in("case_variant_id", [...templateByVariant.keys()]);

    if (sessError) {
      console.error("[admin/cases] sessions join failed", sessError);
      return NextResponse.json(
        { error: "Error resolviendo las sesiones." },
        { status: 500 },
      );
    }

    for (const s of (sessions ?? []) as Array<{
      case_variant_id: string;
      status: string;
    }>) {
      const templateId = templateByVariant.get(s.case_variant_id);
      if (!templateId) continue;
      const usage = usageByTemplate.get(templateId) ?? {
        total: 0,
        completed: 0,
      };
      usage.total += 1;
      if (COMPLETED_STATUSES.has(s.status)) usage.completed += 1;
      usageByTemplate.set(templateId, usage);
    }
  }

  const cases: AdminCaseItem[] = templateRows.map((t) => {
    const usage = usageByTemplate.get(t.id);
    return {
      id: t.id,
      slug: t.slug,
      title: t.title,
      status: t.status,
      version: t.version,
      level_primary: t.level_primary === null ? null : String(t.level_primary),
      career_key: t.career_key,
      duration_estimate_min: t.duration_estimate_min,
      organization_id: t.organization_id,
      organization_name: t.organization_id
        ? orgNameById.get(t.organization_id) ?? null
        : null,
      sessions_total: usage?.total ?? 0,
      sessions_completed: usage?.completed ?? 0,
    };
  });

  return NextResponse.json({ cases });
}

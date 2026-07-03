/**
 * GET /api/admin/cases
 *
 * Consola staff de los casos del simulador. Une los dos modelos vivos:
 *   - generated_cases  → casos bespoke por empresa (5x5 rico, los juega el runtime)
 *   - case_templates   → biblioteca global (organization_id NULL)
 *
 * Los case_templates org-scoped son espejos seedeados de los generated_cases
 * para que el judge evalúe consistente; NO se listan aparte (evita doble conteo).
 *
 * "Uso" (sesiones jugadas) se resuelve best-effort por slug a través de
 * case_variants → simulation_sessions, y degrada a 0 si el join falla.
 */

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSimuladorStaff } from "@/lib/simulador/admin-auth";

export const runtime = "nodejs";

const PLAYED_STATUSES = [
  "completed",
  "submitted",
  "evaluated",
  "evidence_emitted",
];

type GeneratedRow = {
  id: string;
  organization_id: string | null;
  team_id: string | null;
  case_id: string;
  version: number;
  title: string;
  level: string | null;
  status: string;
  generation_method: string | null;
  created_at: string;
  updated_at: string;
};

type TemplateRow = {
  id: string;
  slug: string;
  version: number;
  status: string;
  difficulty: string | null;
  title: string;
  organization_id: string | null;
  duration_estimate_min: number | null;
  created_at: string;
  updated_at: string;
};

type CaseItem = {
  kind: "bespoke" | "global";
  id: string;
  case_id: string;
  title: string;
  level: string | null;
  status: string;
  version: number;
  owner: { id: string; name: string } | null;
  generation_method: string | null;
  sessions: number;
  completed_sessions: number;
  updated_at: string;
};

export async function GET() {
  const staff = await requireSimuladorStaff();
  if (!staff.ok) return staff.response;

  const admin = createAdminClient();

  const [{ data: generated, error: genErr }, { data: templates, error: tplErr }] =
    await Promise.all([
      admin
        .schema("simulador")
        .from("generated_cases")
        .select(
          "id, organization_id, team_id, case_id, version, title, level, status, generation_method, created_at, updated_at",
        )
        .order("updated_at", { ascending: false })
        .limit(500),
      admin
        .schema("simulador")
        .from("case_templates")
        .select(
          "id, slug, version, status, difficulty, title, organization_id, duration_estimate_min, created_at, updated_at",
        )
        .order("updated_at", { ascending: false })
        .limit(500),
    ]);

  if (genErr || tplErr) {
    console.error("[admin/cases] list failed", genErr ?? tplErr);
    return NextResponse.json({ error: "Error listando casos." }, { status: 500 });
  }

  const generatedRows = (generated ?? []) as GeneratedRow[];
  const templateRows = (templates ?? []) as TemplateRow[];

  // Nombres de las orgs dueñas (bespoke).
  const ownerIds = Array.from(
    new Set(
      generatedRows
        .map((g) => g.organization_id)
        .filter((id): id is string => Boolean(id)),
    ),
  );
  const orgNameById = new Map<string, string>();
  if (ownerIds.length > 0) {
    const { data: orgs } = await admin
      .schema("simulador")
      .from("organizations")
      .select("id, name")
      .in("id", ownerIds);
    for (const org of (orgs ?? []) as Array<{ id: string; name: string }>) {
      orgNameById.set(org.id, org.name);
    }
  }

  // Uso por slug (best-effort, degrada a 0 si el join falla).
  const sessionsBySlug = new Map<string, { total: number; completed: number }>();
  let totalSessions = 0;
  try {
    const { data: variants } = await admin
      .schema("simulador")
      .from("case_variants")
      .select("id, case_template_id");
    const templateIdToSlug = new Map(templateRows.map((t) => [t.id, t.slug]));
    const variantToSlug = new Map<string, string>();
    for (const v of (variants ?? []) as Array<{
      id: string;
      case_template_id: string;
    }>) {
      const slug = templateIdToSlug.get(v.case_template_id);
      if (slug) variantToSlug.set(v.id, slug);
    }
    const { data: sessions } = await admin
      .schema("simulador")
      .from("simulation_sessions")
      .select("case_variant_id, status");
    for (const s of (sessions ?? []) as Array<{
      case_variant_id: string;
      status: string;
    }>) {
      totalSessions += 1;
      const slug = variantToSlug.get(s.case_variant_id);
      if (!slug) continue;
      const cur = sessionsBySlug.get(slug) ?? { total: 0, completed: 0 };
      cur.total += 1;
      if (PLAYED_STATUSES.includes(s.status)) cur.completed += 1;
      sessionsBySlug.set(slug, cur);
    }
  } catch (err) {
    console.error("[admin/cases] usage join degraded", err);
  }

  const bespokeItems: CaseItem[] = generatedRows.map((g) => {
    const usage = sessionsBySlug.get(g.case_id);
    return {
      kind: "bespoke",
      id: g.id,
      case_id: g.case_id,
      title: g.title,
      level: g.level,
      status: g.status,
      version: g.version,
      owner: g.organization_id
        ? { id: g.organization_id, name: orgNameById.get(g.organization_id) ?? "—" }
        : null,
      generation_method: g.generation_method,
      sessions: usage?.total ?? 0,
      completed_sessions: usage?.completed ?? 0,
      updated_at: g.updated_at,
    };
  });

  // Solo biblioteca global (org NULL); los org-scoped son espejos de eval.
  const globalItems: CaseItem[] = templateRows
    .filter((t) => t.organization_id === null)
    .map((t) => {
      const usage = sessionsBySlug.get(t.slug);
      return {
        kind: "global",
        id: t.id,
        case_id: t.slug,
        title: t.title,
        level: t.difficulty,
        status: t.status,
        version: t.version,
        owner: null,
        generation_method: null,
        sessions: usage?.total ?? 0,
        completed_sessions: usage?.completed ?? 0,
        updated_at: t.updated_at,
      };
    });

  const items = [...bespokeItems, ...globalItems].sort((a, b) =>
    b.updated_at.localeCompare(a.updated_at),
  );

  const byStatus = (status: string) =>
    items.filter((i) => i.status === status).length;

  return NextResponse.json({
    items,
    summary: {
      total: items.length,
      active: byStatus("active"),
      draft: byStatus("draft"),
      archived: byStatus("archived"),
      bespoke: bespokeItems.length,
      global: globalItems.length,
      sessions: totalSessions,
    },
  });
}

/**
 * GET /api/admin/overview
 *
 * Pulso de una pasada para el índice /admin: titulares de clientes, casos y
 * lecciones. Cada métrica degrada a null (la UI muestra "—") si su conteo
 * falla, para que la entrada del backoffice nunca se rompa por un timeout.
 */

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSimuladorStaff } from "@/lib/simulador/admin-auth";

export const runtime = "nodejs";

type Admin = ReturnType<typeof createAdminClient>;

async function countOf(
  build: (admin: Admin) => PromiseLike<{ count: number | null; error: unknown }>,
  admin: Admin,
): Promise<number | null> {
  try {
    const { count, error } = await build(admin);
    if (error) return null;
    return count ?? 0;
  } catch {
    return null;
  }
}

const add = (a: number | null, b: number | null) =>
  a === null && b === null ? null : (a ?? 0) + (b ?? 0);

export async function GET() {
  const staff = await requireSimuladorStaff();
  if (!staff.ok) return staff.response;

  const admin = createAdminClient();
  const head = { count: "exact" as const, head: true };

  const nowIso = new Date().toISOString();

  const [
    orgs,
    genActive,
    genDraft,
    tplActive,
    tplDraft,
    lessonsActive,
    lessonsDraft,
    reviewPending,
    reviewOverdue,
    leadsNew,
  ] = await Promise.all([
    countOf(
      (a) => a.schema("simulador").from("organizations").select("*", head),
      admin,
    ),
    countOf(
      (a) =>
        a
          .schema("simulador")
          .from("generated_cases")
          .select("*", head)
          .eq("status", "active"),
      admin,
    ),
    countOf(
      (a) =>
        a
          .schema("simulador")
          .from("generated_cases")
          .select("*", head)
          .eq("status", "draft"),
      admin,
    ),
    countOf(
      (a) =>
        a
          .schema("simulador")
          .from("case_templates")
          .select("*", head)
          .is("organization_id", null)
          .eq("status", "active"),
      admin,
    ),
    countOf(
      (a) =>
        a
          .schema("simulador")
          .from("case_templates")
          .select("*", head)
          .is("organization_id", null)
          .eq("status", "draft"),
      admin,
    ),
    countOf(
      (a) =>
        a
          .schema("simulador")
          .from("practice_beats")
          .select("*", head)
          .eq("status", "active"),
      admin,
    ),
    countOf(
      (a) =>
        a
          .schema("simulador")
          .from("practice_beats")
          .select("*", head)
          .eq("status", "draft"),
      admin,
    ),
    countOf(
      (a) =>
        a
          .schema("simulador")
          .from("human_review_queue")
          .select("*", head)
          .in("status", ["queued", "in_review"]),
      admin,
    ),
    countOf(
      (a) =>
        a
          .schema("simulador")
          .from("human_review_queue")
          .select("*", head)
          .in("status", ["queued", "in_review"])
          .lt("due_at", nowIso),
      admin,
    ),
    countOf(
      (a) =>
        a
          .schema("simulador")
          .from("leads_inbox")
          .select("*", head)
          .eq("status", "new"),
      admin,
    ),
  ]);

  return NextResponse.json({
    orgs,
    active_cases: add(genActive, tplActive),
    draft_cases: add(genDraft, tplDraft),
    active_lessons: lessonsActive,
    draft_lessons: lessonsDraft,
    review_pending: reviewPending,
    review_overdue: reviewOverdue,
    leads_new: leadsNew,
  });
}

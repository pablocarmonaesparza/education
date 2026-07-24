/**
 * GET /api/admin/lecciones
 *
 * Consola staff de las lecciones educativas del simulador. En el modelo vivo
 * la unidad educativa con lifecycle propio es el practice beat
 * (simulador.practice_beats): práctica corta, dirigida a un gap, por dimensión
 * y nivel. NO es el LMS legacy de cursos/lecciones/slides.
 *
 * Suma el seguimiento de uso desde practice_unlocks (asignadas) y
 * practice_attempts (intentos + banda), best-effort: degrada a 0 si las
 * tablas premium no responden.
 */

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSimuladorStaff } from "@/lib/simulador/admin-auth";

export const runtime = "nodejs";

type BeatRow = {
  id: string;
  slug: string;
  title: string;
  status: string;
  dimension_key: string | null;
  level: number | null;
  career_key: string | null;
  target_gap_keys: string[] | null;
  duration_estimate_min: number | null;
  updated_at: string;
};

type LessonItem = {
  id: string;
  slug: string;
  title: string;
  status: string;
  dimension_key: string | null;
  level: number | null;
  career_key: string | null;
  target_gap_keys: string[];
  duration_estimate_min: number | null;
  unlocks: number;
  completed_unlocks: number;
  attempts: number;
  completed_attempts: number;
  completion_rate: number;
  updated_at: string;
};

function pct(numerator: number, denominator: number) {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
}

export async function GET() {
  const staff = await requireSimuladorStaff();
  if (!staff.ok) return staff.response;

  const admin = createAdminClient();

  const { data: beats, error: beatErr } = await admin
    .schema("simulador")
    .from("practice_beats")
    .select(
      "id, slug, title, status, dimension_key, level, career_key, target_gap_keys, duration_estimate_min, updated_at",
    )
    .order("updated_at", { ascending: false })
    .limit(500);

  if (beatErr) {
    console.error("[admin/lecciones] beats list failed", beatErr);
    return NextResponse.json(
      { error: "Could not list practices." },
      { status: 500 },
    );
  }

  const beatRows = (beats ?? []) as BeatRow[];

  // Seguimiento de uso (best-effort).
  const unlocksByBeat = new Map<string, { total: number; completed: number }>();
  const attemptsByBeat = new Map<string, { total: number; completed: number }>();
  let totalUnlocks = 0;
  let totalAttempts = 0;
  let totalCompletedAttempts = 0;
  try {
    const [{ data: unlocks }, { data: attempts }] = await Promise.all([
      admin
        .schema("simulador")
        .from("practice_unlocks")
        .select("practice_beat_id, status"),
      admin
        .schema("simulador")
        .from("practice_attempts")
        .select("practice_beat_id, status"),
    ]);
    for (const u of (unlocks ?? []) as Array<{
      practice_beat_id: string;
      status: string;
    }>) {
      totalUnlocks += 1;
      const cur = unlocksByBeat.get(u.practice_beat_id) ?? {
        total: 0,
        completed: 0,
      };
      cur.total += 1;
      if (u.status === "completed") cur.completed += 1;
      unlocksByBeat.set(u.practice_beat_id, cur);
    }
    for (const a of (attempts ?? []) as Array<{
      practice_beat_id: string;
      status: string;
    }>) {
      totalAttempts += 1;
      const cur = attemptsByBeat.get(a.practice_beat_id) ?? {
        total: 0,
        completed: 0,
      };
      cur.total += 1;
      if (a.status === "completed") {
        cur.completed += 1;
        totalCompletedAttempts += 1;
      }
      attemptsByBeat.set(a.practice_beat_id, cur);
    }
  } catch (err) {
    console.error("[admin/lecciones] tracking join degraded", err);
  }

  const items: LessonItem[] = beatRows.map((b) => {
    const unlock = unlocksByBeat.get(b.id);
    const attempt = attemptsByBeat.get(b.id);
    const attempts = attempt?.total ?? 0;
    const completedAttempts = attempt?.completed ?? 0;
    return {
      id: b.id,
      slug: b.slug,
      title: b.title,
      status: b.status,
      dimension_key: b.dimension_key,
      level: b.level,
      career_key: b.career_key,
      target_gap_keys: b.target_gap_keys ?? [],
      duration_estimate_min: b.duration_estimate_min,
      unlocks: unlock?.total ?? 0,
      completed_unlocks: unlock?.completed ?? 0,
      attempts,
      completed_attempts: completedAttempts,
      completion_rate: pct(completedAttempts, attempts),
      updated_at: b.updated_at,
    };
  });

  const byStatus = (status: string) =>
    items.filter((i) => i.status === status).length;

  return NextResponse.json({
    items,
    summary: {
      total: items.length,
      active: byStatus("active"),
      draft: byStatus("draft"),
      archived: byStatus("archived"),
      total_unlocks: totalUnlocks,
      total_attempts: totalAttempts,
      completed_attempts: totalCompletedAttempts,
      completion_rate: pct(totalCompletedAttempts, totalAttempts),
    },
  });
}

// lib/gamification.ts
// Client/server helpers para leer y actualizar el estado de gamification.
//
// El stack real vive en Postgres:
//   - Tabla `user_stats` (total_xp, level, current_streak, longest_streak,
//     last_activity_date, lessons_completed).
//   - RPC `award_lecture_xp(p_user_id, p_lecture_id)` que suma slides.xp y
//     escribe user_progress.xp_earned.
//   - RPC `recalculate_user_stats(p_user_id)` que agrega user_progress y
//     upsertea user_stats.
//   - Trigger `on_user_progress_complete` que dispara ambas RPCs cuando
//     `is_completed` pasa a true.
//
// En el happy path, el frontend solo hace:
//   1. update/insert user_progress con is_completed=true (trigger hace el resto).
//   2. SELECT user_stats para mostrar en UI.
//
// Este módulo centraliza ambas operaciones para no repetir queries.

import { SupabaseClient } from '@supabase/supabase-js';

export type UserStats = {
  totalXp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  lessonsCompleted: number;
};

const EMPTY_STATS: UserStats = {
  totalXp: 0,
  level: 1,
  currentStreak: 0,
  longestStreak: 0,
  lastActivityDate: null,
  lessonsCompleted: 0,
};

export async function getUserStats(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserStats> {
  const { data, error } = await supabase
    .from('user_stats')
    .select(
      'total_xp, level, current_streak, longest_streak, last_activity_date, lessons_completed',
    )
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.warn('[gamification] failed to fetch user_stats', error);
    return EMPTY_STATS;
  }

  if (!data) return EMPTY_STATS;

  return {
    totalXp: data.total_xp ?? 0,
    level: data.level ?? 1,
    currentStreak: data.current_streak ?? 0,
    longestStreak: data.longest_streak ?? 0,
    lastActivityDate: data.last_activity_date ?? null,
    lessonsCompleted: data.lessons_completed ?? 0,
  };
}

// XP requerido para alcanzar un nivel dado. Debe matchear la fórmula del
// trigger en Postgres (level = floor(total_xp / 100) + 1).
export function xpForLevel(level: number): number {
  return Math.max(0, level - 1) * 100;
}

// Progreso dentro del nivel actual (0..100).
export function levelProgressPct(stats: UserStats): number {
  const floor = xpForLevel(stats.level);
  const ceil = xpForLevel(stats.level + 1);
  const span = ceil - floor;
  if (span <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round(((stats.totalXp - floor) / span) * 100)));
}

// Devuelve el conjunto de `lecture_id` (UUID) completados por el usuario.
// Reemplaza las lecturas históricas de `video_progress.completed=true`.
export async function getCompletedLectureIds(
  supabase: SupabaseClient,
  userId: string,
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('user_progress')
    .select('lecture_id')
    .eq('user_id', userId)
    .eq('is_completed', true);

  if (error) {
    console.warn('[gamification] failed to fetch completed lectures', error);
    return new Set();
  }

  return new Set((data ?? []).map((row: { lecture_id: string }) => row.lecture_id));
}

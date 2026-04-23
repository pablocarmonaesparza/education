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

// ============================================================================
// Badges — catálogo estático + unlocks por usuario.
//
// La tabla `badges` es public read; `user_badges` es per-user via RLS.
// El trigger `on_user_progress_complete` llama a `evaluate_user_badges` al
// completar una lección, así que el frontend solo necesita LEER.
// ============================================================================

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type BadgeCatalogEntry = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  rarity: BadgeRarity;
  xpReward: number;
  displayOrder: number;
};

export type UserBadge = BadgeCatalogEntry & {
  unlocked: boolean;
  unlockedAt: string | null;
};

export async function getBadgeCatalog(
  supabase: SupabaseClient,
): Promise<BadgeCatalogEntry[]> {
  const { data, error } = await supabase
    .from('badges')
    .select('id, name, description, emoji, rarity, xp_reward, display_order')
    .order('display_order', { ascending: true });

  if (error) {
    console.warn('[gamification] failed to fetch badge catalog', error);
    return [];
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    emoji: row.emoji,
    rarity: row.rarity as BadgeRarity,
    xpReward: row.xp_reward ?? 0,
    displayOrder: row.display_order ?? 0,
  }));
}

// Combina catálogo + unlocks del usuario en una sola lista, en orden de
// display. Cada entrada incluye `unlocked` y `unlockedAt` para que la UI
// renderice locked vs unlocked con el mismo dato.
export async function getUserBadges(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserBadge[]> {
  const [catalog, { data: unlocks, error: unlocksError }] = await Promise.all([
    getBadgeCatalog(supabase),
    supabase
      .from('user_badges')
      .select('badge_id, unlocked_at')
      .eq('user_id', userId),
  ]);

  if (unlocksError) {
    console.warn('[gamification] failed to fetch user_badges', unlocksError);
  }

  const byId = new Map<string, string>();
  (unlocks ?? []).forEach((row: any) => {
    byId.set(row.badge_id as string, row.unlocked_at as string);
  });

  return catalog.map((b) => ({
    ...b,
    unlocked: byId.has(b.id),
    unlockedAt: byId.get(b.id) ?? null,
  }));
}

// IDs de badges desbloqueados — útil para diff pre/post completion y disparar
// modal de unlock en el cliente.
export async function getUnlockedBadgeIds(
  supabase: SupabaseClient,
  userId: string,
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', userId);

  if (error) {
    console.warn('[gamification] failed to fetch unlocked badge ids', error);
    return new Set();
  }

  return new Set((data ?? []).map((row: { badge_id: string }) => row.badge_id));
}

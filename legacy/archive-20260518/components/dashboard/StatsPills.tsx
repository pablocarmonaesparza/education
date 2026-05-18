'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getUserStats, type UserStats } from '@/lib/gamification';

/**
 * Pills del header del tutor: corazón ∞ + racha + XP.
 *
 * Racha y XP vienen de user_stats (trigger Postgres
 * `on_user_progress_complete`). El corazón ∞ es decorativo por ahora — no
 * hay sistema de hearts/lives (Itera es B2B, no aplica el drainage de
 * Duolingo, ver docs/memory/decision_gamification_duolingo_b2b.md). Se
 * mantiene el slot visual; cuando haya algo concreto que medir ahí (lives,
 * energy, gemas, créditos) se sustituye el literal por la métrica real.
 */
export default function StatsPills() {
  const supabase = createClient();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !active) {
        setLoading(false);
        return;
      }
      const s = await getUserStats(supabase, user.id);
      if (!active) return;
      setStats(s);
      setLoading(false);
    }

    load();

    // El dashboard dispara este evento después de completar una lección
    // (ver app/dashboard/page.tsx:handleLessonComplete). StatsPills vive
    // en el layout y no recibe props, así que usamos CustomEvent para
    // evitar estado global mayor.
    const onRefresh = () => { load(); };
    if (typeof window !== 'undefined') {
      window.addEventListener('itera:stats-refresh', onRefresh);
    }

    return () => {
      active = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('itera:stats-refresh', onRefresh);
      }
    };
  }, [supabase]);

  const pillClass =
    'flex-1 min-w-0 inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl ' +
    'bg-white dark:bg-gray-800 text-ink dark:text-gray-300 ' +
    'border-2 border-gray-300 dark:border-gray-900 ' +
    'border-b-4 border-b-gray-300 dark:border-b-gray-900';

  // Pill decorativa de "vidas ilimitadas". No depende de loading ni de
  // user_stats — siempre se ve igual mientras no haya métrica que medir.
  const heartPill = (
    <div className={pillClass} aria-label="vidas ilimitadas">
      <svg className="w-4 h-4 text-red-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21s-7-4.5-9.5-9C.5 8 3 4 6.5 4c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3C21 4 23.5 8 21.5 12 19 16.5 12 21 12 21z" />
      </svg>
      <span className="text-base font-bold leading-none translate-y-[1px]" aria-hidden="true">∞</span>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        {heartPill}
        <div className={pillClass} aria-label="cargando racha">
          <span className="text-sm leading-none opacity-40" aria-hidden="true">🔥</span>
          <span className="text-sm font-bold tabular-nums opacity-40">—</span>
        </div>
        <div className={pillClass} aria-label="cargando xp">
          <svg className="w-4 h-4 text-yellow-500 shrink-0 opacity-40" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 2L4.5 13.5h6L11 22l8.5-11.5h-6L13 2z" />
          </svg>
          <span className="text-sm font-bold tabular-nums opacity-40">—</span>
        </div>
      </div>
    );
  }

  const streak = stats?.currentStreak ?? 0;
  const xp = stats?.totalXp ?? 0;

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {heartPill}
      <div
        className={pillClass}
        aria-label={`racha de ${streak} ${streak === 1 ? 'día' : 'días'}`}
      >
        <span className="text-sm leading-none" aria-hidden="true">🔥</span>
        <span className="text-sm font-bold tabular-nums">{streak}</span>
      </div>
      <div className={pillClass} aria-label={`${xp} XP`}>
        <svg className="w-4 h-4 text-yellow-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13 2L4.5 13.5h6L11 22l8.5-11.5h-6L13 2z" />
        </svg>
        <span className="text-sm font-bold tabular-nums">{xp}</span>
      </div>
    </div>
  );
}

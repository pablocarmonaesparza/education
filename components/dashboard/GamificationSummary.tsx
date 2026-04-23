'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  getUserStats,
  xpForLevel,
  levelProgressPct,
  type UserStats,
} from '@/lib/gamification';
import ProgressBar from '@/components/ui/ProgressBar';
import { depth } from '@/lib/design-tokens';

/**
 * Resumen de gamification del usuario — pensado para perfil y página de
 * progreso. Lee `user_stats` directamente y escucha el evento
 * `itera:stats-refresh` que dispara el dashboard al completar una lección,
 * igual que StatsPills.
 *
 * Muestra 4 números principales (XP, nivel, racha, lecciones completadas) +
 * barra de progreso al siguiente nivel + mejor racha histórica.
 */
export default function GamificationSummary() {
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

  const resolved = stats ?? {
    totalXp: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    lessonsCompleted: 0,
  };

  const progressPct = levelProgressPct(resolved);
  const xpToNext = xpForLevel(resolved.level + 1) - resolved.totalXp;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-900 overflow-hidden">
      <div className="p-6 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-lg font-bold text-ink dark:text-white">
          tu progreso
        </h3>
        <p className="text-sm text-ink-muted dark:text-gray-400 mt-1">
          XP, nivel y racha — se actualiza al completar cada lección
        </p>
      </div>

      {/* Level + XP progress */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-4 mb-3">
          <div
            className={`w-14 h-14 rounded-full bg-primary ${depth.border} ${depth.bottom} border-primary-dark flex items-center justify-center text-white text-xl font-bold`}
            aria-label={`nivel ${resolved.level}`}
          >
            {resolved.level}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-ink-muted dark:text-gray-400">
              nivel {resolved.level}
            </p>
            <p className="text-2xl font-bold text-ink dark:text-white tabular-nums">
              {resolved.totalXp.toLocaleString('es-MX')} XP
            </p>
          </div>
        </div>
        <ProgressBar value={progressPct} size="md" color="primary" />
        <p className="text-xs text-ink-muted dark:text-gray-400 mt-2">
          {resolved.totalXp < xpForLevel(resolved.level + 1)
            ? `${xpToNext.toLocaleString('es-MX')} XP para el nivel ${resolved.level + 1}`
            : 'nivel máximo alcanzado'}
        </p>
      </div>

      {/* Grid: racha actual, mejor racha, lecciones */}
      <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-800">
        <StatTile
          emoji="🔥"
          label="racha actual"
          value={resolved.currentStreak}
          unit={resolved.currentStreak === 1 ? 'día' : 'días'}
        />
        <StatTile
          emoji="🏆"
          label="mejor racha"
          value={resolved.longestStreak}
          unit={resolved.longestStreak === 1 ? 'día' : 'días'}
        />
        <StatTile
          emoji="📚"
          label="lecciones"
          value={resolved.lessonsCompleted}
          unit={resolved.lessonsCompleted === 1 ? 'completada' : 'completadas'}
        />
      </div>

      {loading && (
        <div
          className="absolute inset-0 bg-white/40 dark:bg-gray-800/40 pointer-events-none"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

function StatTile({
  emoji,
  label,
  value,
  unit,
}: {
  emoji: string;
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <div className="p-5 text-center">
      <div className="text-2xl mb-1" aria-hidden="true">{emoji}</div>
      <div className="text-2xl font-bold text-ink dark:text-white tabular-nums">
        {value.toLocaleString('es-MX')}
      </div>
      <div className="text-xs text-ink-muted dark:text-gray-400 mt-1">
        {unit} · {label}
      </div>
    </div>
  );
}

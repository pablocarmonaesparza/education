'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  getUserBadges,
  type UserBadge,
  type BadgeRarity,
} from '@/lib/gamification';

/**
 * Grid de badges del usuario. Lee catálogo + unlocks desde
 * `lib/gamification.getUserBadges` y renderiza todos los del catálogo,
 * diferenciando locked/unlocked con color + opacidad + icono.
 *
 * Escucha `itera:stats-refresh` para re-fetchear tras completar una lección
 * (el trigger `evaluate_user_badges` ya corrió en Postgres, aquí solo leemos).
 */
export default function BadgeGrid() {
  const supabase = createClient();
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !active) {
        setLoading(false);
        return;
      }
      const list = await getUserBadges(supabase, user.id);
      if (!active) return;
      setBadges(list);
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

  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const totalCount = badges.length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-900 overflow-hidden">
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-ink dark:text-white">
            tus logros
          </h3>
          <p className="text-sm text-ink-muted dark:text-gray-400 mt-1">
            se desbloquean automáticamente al cumplir hitos
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-ink-muted dark:text-gray-400">desbloqueados</p>
          <p className="text-2xl font-bold text-primary tabular-nums">
            {unlockedCount}/{totalCount || 0}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-6 text-sm text-ink-muted dark:text-gray-400">
          cargando logros…
        </div>
      ) : totalCount === 0 ? (
        <div className="p-6 text-sm text-ink-muted dark:text-gray-400">
          no hay logros en el catálogo todavía.
        </div>
      ) : (
        <div className="p-4 sm:p-6 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4">
          {badges.map((b) => (
            <BadgeTile key={b.id} badge={b} />
          ))}
        </div>
      )}
    </div>
  );
}

function BadgeTile({ badge }: { badge: UserBadge }) {
  const colors = rarityClasses(badge.rarity);
  const locked = !badge.unlocked;

  return (
    <div
      className={[
        'group relative flex flex-col items-center gap-1 rounded-xl p-3 text-center',
        'border-2 transition-all',
        locked
          ? 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 opacity-60'
          : `${colors.bg} ${colors.border} shadow-sm`,
      ].join(' ')}
      title={
        locked
          ? `${badge.name} — ${badge.description} (bloqueado)`
          : `${badge.name} — ${badge.description}`
      }
    >
      <div
        className={[
          'text-3xl sm:text-4xl leading-none',
          locked ? 'grayscale' : '',
        ].join(' ')}
        aria-hidden="true"
      >
        {badge.emoji}
      </div>
      <p
        className={[
          'text-[11px] sm:text-xs font-semibold leading-tight line-clamp-2 min-h-[2em]',
          locked ? 'text-ink-muted dark:text-gray-500' : colors.text,
        ].join(' ')}
      >
        {badge.name}
      </p>
      {!locked && (
        <span
          className="absolute top-1 right-1 text-[10px]"
          aria-label="desbloqueado"
          title="desbloqueado"
        >
          ✓
        </span>
      )}
      {locked && (
        <span
          className="absolute top-1 right-1 text-[10px] text-ink-muted"
          aria-hidden="true"
        >
          🔒
        </span>
      )}
    </div>
  );
}

/**
 * Colores por rarity — usa los tokens semánticos del design system. Evito
 * tonos fuera de la paleta documentada en `CLAUDE.md`.
 *   common    → neutral
 *   rare      → primary (azul)
 *   epic      → púrpura
 *   legendary → dorado (amber)
 */
function rarityClasses(rarity: BadgeRarity): {
  bg: string;
  border: string;
  text: string;
} {
  switch (rarity) {
    case 'rare':
      return {
        bg: 'bg-primary/10',
        border: 'border-primary/30',
        text: 'text-primary',
      };
    case 'epic':
      return {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        border: 'border-purple-300 dark:border-purple-700',
        text: 'text-purple-700 dark:text-purple-300',
      };
    case 'legendary':
      return {
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        border: 'border-amber-400 dark:border-amber-600',
        text: 'text-amber-700 dark:text-amber-300',
      };
    default:
      return {
        bg: 'bg-gray-100 dark:bg-gray-800',
        border: 'border-gray-300 dark:border-gray-700',
        text: 'text-ink dark:text-white',
      };
  }
}

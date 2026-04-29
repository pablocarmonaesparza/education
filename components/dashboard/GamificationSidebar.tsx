'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  getUserStats,
  getUserBadges,
  xpForLevel,
  levelProgressPct,
  type UserStats,
  type UserBadge,
} from '@/lib/gamification';
import { rarityClasses } from '@/lib/gamification-rarity';
import ProgressBar from '@/components/ui/ProgressBar';
import { CardFlat } from '@/components/ui/Card';
import { depth } from '@/lib/design-tokens';

/**
 * GamificationSidebar — sidebar derecho fijo dedicado al sistema de
 * gamification (XP, nivel, racha, badges).
 *
 * Reemplaza al `TutorChatButton` que vivía en este slot. Ancho fijo de
 * `w-64` (256px) para que coincida exactamente con el sidebar de navegación
 * izquierdo (`components/dashboard/Sidebar.tsx`) — consistencia visual
 * pedida por Pablo.
 *
 * En lugar de reusar `GamificationSummary` y `BadgeGrid` (que están
 * pensados para páginas más anchas como `/perfil` y `/progress`), este
 * componente tiene su propia UI compacta optimizada para 256px:
 *   - Card de nivel/XP con barra de progreso al siguiente nivel.
 *   - Row con racha actual + lecciones completadas.
 *   - Grid de badges 2 columnas con emojis grandes y nombre debajo.
 *
 * Suscribe al evento `itera:stats-refresh` que dispara el dashboard
 * después de completar una lección, así que la UI se actualiza sola.
 *
 * En mobile (< md) se oculta — el resumen de gamification queda accesible
 * vía `/dashboard/perfil` y `/dashboard/progress`.
 */
export default function GamificationSidebar() {
  // Lazy init: el cliente Supabase se crea una sola vez por mount, no en
  // cada render. Esto mantiene la dependencia del useEffect estable y
  // evita el refetch loop que detectó el code review.
  const [supabase] = useState(() => createClient());
  const [stats, setStats] = useState<UserStats | null>(null);
  const [badges, setBadges] = useState<UserBadge[]>([]);

  useEffect(() => {
    let active = true;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !active) return;
      const [s, b] = await Promise.all([
        getUserStats(supabase, user.id),
        getUserBadges(supabase, user.id),
      ]);
      if (!active) return;
      setStats(s);
      setBadges(b);
    }

    load();

    const onRefresh = () => {
      load();
    };
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
  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const totalCount = badges.length;

  return (
    <aside
      aria-label="Tu progreso"
      className="hidden md:flex fixed right-0 top-0 h-screen w-64 bg-white dark:bg-gray-800 flex-col z-40 border-l border-gray-200 dark:border-gray-900"
    >
      {/* Header */}
      <div className="px-4 pt-6 pb-3 flex-shrink-0">
        <h2 className="text-lg font-extrabold text-ink dark:text-white lowercase tracking-tight">
          tu progreso
        </h2>
        <p className="text-xs text-ink-muted dark:text-gray-400 mt-1">
          se actualiza al completar lecciones
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-4">
        {/* Card nivel + XP */}
        <CardFlat className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`w-12 h-12 rounded-full bg-primary ${depth.border} ${depth.bottom} border-primary-dark flex items-center justify-center text-white text-lg font-extrabold flex-shrink-0`}
              aria-label={`nivel ${resolved.level}`}
            >
              {resolved.level}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-ink-muted dark:text-gray-400 lowercase">
                nivel {resolved.level}
              </p>
              <p className="text-xl font-extrabold text-ink dark:text-white tabular-nums leading-tight">
                {resolved.totalXp.toLocaleString('es-MX')} XP
              </p>
            </div>
          </div>
          <ProgressBar value={progressPct} size="sm" color="primary" />
          <p className="text-[11px] text-ink-muted dark:text-gray-400 mt-2 lowercase">
            {resolved.totalXp < xpForLevel(resolved.level + 1)
              ? `${xpToNext.toLocaleString('es-MX')} xp para nivel ${resolved.level + 1}`
              : 'nivel máximo alcanzado'}
          </p>
        </CardFlat>

        {/* Stats row: racha actual + lecciones */}
        <div className="grid grid-cols-2 gap-2">
          <StatTileCompact
            emoji="🔥"
            value={resolved.currentStreak}
            label={resolved.currentStreak === 1 ? 'día racha' : 'días racha'}
          />
          <StatTileCompact
            emoji="📚"
            value={resolved.lessonsCompleted}
            label={resolved.lessonsCompleted === 1 ? 'lección' : 'lecciones'}
          />
        </div>

        {/* Badges */}
        <CardFlat className="p-4">
          <div className="flex items-baseline justify-between gap-2 mb-3">
            <h3 className="text-sm font-bold text-ink dark:text-white lowercase">
              tus logros
            </h3>
            <p className="text-xs text-primary font-bold tabular-nums flex-shrink-0">
              {unlockedCount}/{totalCount || 0}
            </p>
          </div>
          {totalCount === 0 ? (
            <p className="text-xs text-ink-muted dark:text-gray-400">cargando…</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {badges.map((b) => (
                <BadgeTileCompact key={b.id} badge={b} />
              ))}
            </div>
          )}
        </CardFlat>
      </div>
    </aside>
  );
}

function StatTileCompact({
  emoji,
  value,
  label,
}: {
  emoji: string;
  value: number;
  label: string;
}) {
  return (
    <CardFlat className="px-3 py-3 text-center">
      <div className="text-xl mb-0.5" aria-hidden="true">
        {emoji}
      </div>
      <div className="text-lg font-extrabold text-ink dark:text-white tabular-nums leading-none">
        {value.toLocaleString('es-MX')}
      </div>
      <div className="text-[10px] text-ink-muted dark:text-gray-400 mt-1 lowercase leading-tight">
        {label}
      </div>
    </CardFlat>
  );
}

function BadgeTileCompact({ badge }: { badge: UserBadge }) {
  const colors = rarityClasses(badge.rarity);
  const locked = !badge.unlocked;

  return (
    <div
      className={[
        'group relative flex flex-col items-center gap-1 rounded-xl p-2 text-center',
        'border-2 transition-all',
        locked
          ? 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 opacity-60'
          : `${colors.bg} ${colors.border}`,
      ].join(' ')}
      title={
        locked
          ? `${badge.name} — ${badge.description} (bloqueado)`
          : `${badge.name} — ${badge.description}`
      }
    >
      <div
        className={['text-2xl leading-none', locked ? 'grayscale' : ''].join(' ')}
        aria-hidden="true"
      >
        {badge.emoji}
      </div>
      <p
        className={[
          'text-[10px] font-semibold leading-tight line-clamp-2 min-h-[2em]',
          locked ? 'text-ink-muted dark:text-gray-500' : colors.text,
        ].join(' ')}
      >
        {badge.name}
      </p>
      {!locked && (
        <span
          className="absolute top-0.5 right-1 text-[9px]"
          aria-label="desbloqueado"
          title="desbloqueado"
        >
          ✓
        </span>
      )}
      {locked && (
        <span
          className="absolute top-0.5 right-1 text-[9px] text-ink-muted"
          aria-hidden="true"
        >
          🔒
        </span>
      )}
    </div>
  );
}

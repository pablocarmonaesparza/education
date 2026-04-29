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
import Card from '@/components/ui/Card';
import { Headline, Caption } from '@/components/ui/Typography';
import StatsPills from './StatsPills';

/**
 * GamificationSidebar — sidebar derecho fijo dedicado al sistema de
 * gamification (stats + nivel + XP + logros).
 *
 * Reemplaza al `TutorChatButton` que vivía en este slot. Ancho fijo de
 * `w-64` (256px) para coincidir con el sidebar izquierdo (consistencia
 * pedida por Pablo).
 *
 * Composición (de arriba a abajo, separación por spacing — sin líneas):
 *   1. **StatsPills**: corazón ∞ decorativo + racha 🔥 + XP ⚡ (paridad
 *      Duolingo, decisión B2B en `decision_gamification_duolingo_b2b.md`).
 *      Aquí ya viven racha y XP, así que el sidebar no los duplica abajo.
 *   2. **Nivel** — `Card variant="primary"` con número de nivel grande +
 *      barra de progreso al siguiente nivel + caption con xp restante.
 *   3. **Logros** — Headline "tus logros (X/N)" + grid 2-col de badges
 *      con tiers de rareza (colores via `lib/gamification-rarity`).
 *
 * **Reglas estrictas (después del fix de Pablo 2026-04-29):**
 * - Sin `border-l` en el aside, sin `border-b` entre secciones.
 *   La separación entre bloques es `space-y-*` y nada más.
 * - Sin círculos en elementos UI — el nivel es card cuadrada con esquinas
 *   redondeadas, NO un círculo.
 * - Sólo componentes del design system (`Card`, `StatCard`, `ProgressBar`,
 *   `Tag`, `Typography`, `StatsPills`) — nada de divs custom con clases
 *   manuales para depth o contornos.
 *
 * Suscribe al evento `itera:stats-refresh` para actualizar en tiempo real
 * después de completar una lección. En mobile (< md) se oculta — el
 * resumen queda accesible vía `/dashboard/perfil` y `/dashboard/progress`.
 */
export default function GamificationSidebar() {
  // Lazy init: el cliente Supabase se crea una sola vez por mount.
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
      className="hidden md:flex fixed right-0 top-0 h-screen w-64 bg-white dark:bg-gray-800 flex-col z-40"
    >
      {/* Stats top: corazón ∞ + racha + XP. Restaurado tras el feedback
          de Pablo (vivía en el header del antiguo chat sidebar). */}
      <div className="px-4 pt-4 pb-2 flex-shrink-0">
        <StatsPills />
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 pt-3 space-y-4">
        {/* Nivel — card primary cuadrada (no círculo) */}
        <Card variant="primary" padding="md">
          <Caption className="text-white/80 lowercase">tu nivel</Caption>
          <div className="flex items-baseline gap-2 mt-1 mb-3">
            <span className="text-4xl font-extrabold tabular-nums leading-none">
              {resolved.level}
            </span>
            <span className="text-sm font-bold opacity-80 tabular-nums">
              · {resolved.totalXp.toLocaleString('es-MX')} xp
            </span>
          </div>
          <ProgressBar
            value={progressPct}
            size="sm"
            color="white"
          />
          <p className="text-[11px] text-white/80 mt-2 lowercase">
            {resolved.totalXp < xpForLevel(resolved.level + 1)
              ? `${xpToNext.toLocaleString('es-MX')} xp para nivel ${resolved.level + 1}`
              : 'nivel máximo alcanzado'}
          </p>
        </Card>

        {/* Logros */}
        <div className="space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <Headline>tus logros</Headline>
            <Caption className="text-primary font-bold tabular-nums">
              {unlockedCount}/{totalCount || 0}
            </Caption>
          </div>
          {totalCount === 0 ? (
            <Caption>cargando…</Caption>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {badges.map((b) => (
                <BadgeTileCompact key={b.id} badge={b} />
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function BadgeTileCompact({ badge }: { badge: UserBadge }) {
  const colors = rarityClasses(badge.rarity);
  const locked = !badge.unlocked;

  // Tile cuadrado (rounded-2xl, no círculo) con bg sólido por rareza para
  // unlocked, gray para locked. Sin border decorativo.
  return (
    <div
      className={[
        'relative flex flex-col items-center gap-1 rounded-2xl p-3 text-center',
        locked
          ? 'bg-gray-50 dark:bg-gray-900/50 opacity-60'
          : colors.bg,
      ].join(' ')}
      title={
        locked
          ? `${badge.name} — ${badge.description} (bloqueado)`
          : `${badge.name} — ${badge.description}`
      }
    >
      <div
        className={['text-2xl leading-none', locked ? 'grayscale' : ''].join(
          ' ',
        )}
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
          className="absolute top-1 right-1 text-[9px]"
          aria-label="desbloqueado"
          title="desbloqueado"
        >
          ✓
        </span>
      )}
      {locked && (
        <span
          className="absolute top-1 right-1 text-[9px] text-ink-muted"
          aria-hidden="true"
        >
          🔒
        </span>
      )}
    </div>
  );
}


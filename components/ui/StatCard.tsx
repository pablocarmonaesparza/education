'use client';

import React from 'react';

/* ───────────────────────────────────────────────────────────
   Design-system Stat Card
   Seen in dashboard "tu actividad" grid:
   emoji + big number + label, colored background, border-2
   ─────────────────────────────────────────────────────────── */

export type StatCardColor = 'blue' | 'orange' | 'green' | 'neutral';

const colorStyles: Record<StatCardColor, string> = {
  blue:
    'bg-primary/10 border-2 border-primary/30',
  orange:
    'bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800',
  green:
    'bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800',
  neutral:
    'bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-900',
};

export interface StatCardProps {
  /** Emoji or icon rendered above the value. */
  icon: React.ReactNode;
  /** Big number / main value. */
  value: React.ReactNode;
  /** Short label below the value. */
  label: string;
  color?: StatCardColor;
  className?: string;
}

/**
 * Activity / gamification stat tile.
 *
 * ```tsx
 * <StatCard icon="🔥" value={5} label="Racha Días" color="orange" />
 * <StatCard icon="⭐" value={3} label="Nivel" color="blue" />
 * ```
 */
export default function StatCard({
  icon,
  value,
  label,
  color = 'neutral',
  className = '',
}: StatCardProps) {
  return (
    <div
      className={`p-4 rounded-2xl text-center ${colorStyles[color]} ${className}`}
    >
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-extrabold text-ink dark:text-white">
        {value}
      </div>
      <div className="text-xs text-ink-muted dark:text-gray-400 uppercase font-bold tracking-wide">
        {label}
      </div>
    </div>
  );
}

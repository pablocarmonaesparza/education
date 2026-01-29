'use client';

import React from 'react';

/* ───────────────────────────────────────────────────────────
   Design-system Progress Bar
   Seen in: dashboard overview, course cards, progress cards,
   retos sidebar, gamification stats
   ─────────────────────────────────────────────────────────── */

export type ProgressBarSize = 'sm' | 'md' | 'lg';

const heightMap: Record<ProgressBarSize, string> = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
};

export interface ProgressBarProps {
  /** 0–100 */
  value: number;
  /** Visual size. Default 'md'. */
  size?: ProgressBarSize;
  /** Fill color. Default is primary blue. */
  color?: 'primary' | 'white' | 'green' | 'yellow';
  /** Track (background) color override. */
  trackClassName?: string;
  /** Animate the fill on mount. Default true. */
  animate?: boolean;
  className?: string;
}

const fillColors = {
  primary: 'bg-[#1472FF]',
  white: 'bg-white',
  green: 'bg-[#22c55e]',
  yellow: 'bg-yellow-500',
} as const;

const defaultTracks = {
  primary: 'bg-gray-100 dark:bg-gray-900',
  white: 'bg-white/30',
  green: 'bg-gray-200 dark:bg-gray-700',
  yellow: 'bg-yellow-200',
} as const;

/**
 * Reusable progress bar matching the design system.
 *
 * ```tsx
 * <ProgressBar value={65} />
 * <ProgressBar value={40} size="lg" color="green" />
 * ```
 */
export default function ProgressBar({
  value,
  size = 'md',
  color = 'primary',
  trackClassName,
  animate = true,
  className = '',
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div
      className={`overflow-hidden rounded-full ${heightMap[size]} ${
        trackClassName ?? defaultTracks[color]
      } ${className}`}
    >
      <div
        className={`${heightMap[size]} rounded-full ${fillColors[color]} ${
          animate ? 'transition-all duration-500' : ''
        }`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

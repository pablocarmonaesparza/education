'use client';

import React from 'react';

/* ───────────────────────────────────────────────────────────
   Design-system Card
   border-2 border-b-4 · rounded-2xl
   Variants: neutral, primary, completado
   ─────────────────────────────────────────────────────────── */

const base =
  'rounded-2xl border-2 border-b-4 transition-all duration-150';

const variantStyles = {
  /** White / dark-gray-800 with neutral depth border */
  neutral:
    'bg-white dark:bg-gray-800 ' +
    'border-gray-200 dark:border-gray-700 border-b-gray-300 dark:border-b-gray-700 ' +
    'text-[#4b4b4b] dark:text-white',

  /** #1472FF background with #0E5FCC depth border */
  primary:
    'bg-[#1472FF] border-[#0E5FCC] text-white',

  /** #22c55e background with #16a34a depth border */
  completado:
    'bg-[#22c55e] border-[#16a34a] text-white',
} as const;

const hoverStyles = {
  neutral: 'hover:bg-gray-50 dark:hover:bg-gray-900',
  primary: 'hover:bg-[#1265e0]',
  completado: '', // completado has no hover in the design system
} as const;

const interactiveDepth =
  'active:border-b-2 active:mt-[2px] cursor-pointer';

export type CardVariant = keyof typeof variantStyles;

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  /** Adds hover/active depth interaction. Default false. */
  interactive?: boolean;
  /** Extra padding preset. Default 'md'. */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
} as const;

/**
 * Design-system Card with depth border.
 *
 * ```tsx
 * <Card variant="neutral" padding="lg">
 *   <p>Content</p>
 * </Card>
 *
 * <Card variant="primary" interactive>
 *   <p className="text-sm font-bold">Primary card</p>
 * </Card>
 *
 * <Card variant="completado">
 *   <p className="text-sm font-bold">Done!</p>
 * </Card>
 * ```
 */
export default function Card({
  variant = 'neutral',
  interactive = false,
  padding = 'md',
  className = '',
  children,
  ...rest
}: CardProps) {
  const cls = [
    base,
    variantStyles[variant],
    interactive && hoverStyles[variant],
    interactive && interactiveDepth,
    paddingStyles[padding],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cls} {...rest}>
      {children}
    </div>
  );
}

/* ── Flat card (no depth border) ── */

/**
 * A lighter card variant without the depth border-b-4.
 * Uses border-2 only, rounded-2xl.
 * Seen in dashboard stat rows, profile sections, etc.
 *
 * ```tsx
 * <CardFlat className="shadow-sm">...</CardFlat>
 * ```
 */
export function CardFlat({
  className = '',
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

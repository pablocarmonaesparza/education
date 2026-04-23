'use client';

import Link from 'next/link';
import React from 'react';
import { depthBase, depthBottomOnly } from '@/lib/design-tokens';

/* ───────────────────────────────────────────────────────────
   Design-system Button
   Depth values come from lib/design-tokens.ts
   ─────────────────────────────────────────────────────────── */

const baseCommon =
  'font-bold uppercase tracking-wide transition-all duration-150 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

/** Full depth variants get the 3-D border treatment on all sides. */
const baseDepthFull = baseCommon + ' ' + depthBase;

/** Bottom-only depth: only the bottom border is visible (landing-page style). */
const baseDepthBottom = baseCommon + ' ' + depthBottomOnly;

/** Flat variants have no visible border. */
const baseFlat = baseCommon;

/* — variant → color palette — */
const variantStyles = {
  /** Blue filled with depth border */
  primary:
    'bg-primary text-white border-primary-dark hover:bg-[#1265e0]',

  /** White / dark-gray filled with neutral depth border */
  outline:
    'bg-white dark:bg-gray-800 text-ink dark:text-gray-300 ' +
    'border-gray-300 dark:border-gray-900 border-b-gray-300 dark:border-b-gray-900 ' +
    'hover:bg-gray-50 dark:hover:bg-gray-900',

  /** Same as outline visually */
  secondary:
    'bg-white dark:bg-gray-800 text-ink dark:text-gray-300 ' +
    'border-gray-300 dark:border-gray-900 border-b-gray-300 dark:border-b-gray-900 ' +
    'hover:bg-gray-50 dark:hover:bg-gray-700',

  /** Transparent, no border – just hover highlight */
  ghost:
    'bg-transparent text-ink dark:text-gray-300 ' +
    'hover:bg-gray-100 dark:hover:bg-gray-800',

  /** Sidebar active state */
  'nav-active':
    'bg-primary text-white border-primary-dark hover:bg-[#1265e0]',

  /** Sidebar inactive state */
  'nav-inactive':
    'bg-transparent text-ink dark:text-gray-300 ' +
    'hover:bg-gray-100 dark:hover:bg-gray-800',

  /** Completado (green) with depth */
  completado:
    'bg-completado text-white border-completado-dark hover:bg-[#1eab54]',

  /** Danger / destructive */
  danger:
    'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 ' +
    'hover:bg-red-100 dark:hover:bg-red-900',
} as const;

/** Variants that use depth (border-b-8) */
const depthVariants: ReadonlySet<string> = new Set([
  'primary',
  'outline',
  'secondary',
  'nav-active',
  'completado',
]);

/* — size presets — */
const sizeStyles = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-4 py-3 text-sm',
  lg: 'px-6 py-3 text-sm',
  xl: 'px-6 py-4 text-base',
  /** No size classes — consumer provides sizing via className. */
  none: '',
} as const;

export type ButtonVariant = keyof typeof variantStyles;
export type ButtonSize = keyof typeof sizeStyles;
export type ButtonDepth = 'full' | 'bottom';

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /**
   * Depth border style for depth variants.
   * - `'full'`   (default) — border-4 border-b-8  (all-sides depth)
   * - `'bottom'` — border-b-8 only (landing-page style, bigger press)
   *
   * Ignored for flat variants (ghost, nav-inactive, danger).
   */
  depth?: ButtonDepth;
  /** Render as Next.js Link when provided. */
  href?: string;
  /** Use rounded-2xl instead of default rounded-xl. */
  rounded2xl?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Design-system Button with depth effect.
 *
 * ```tsx
 * <Button variant="primary">Guardar</Button>
 * <Button variant="outline" href="/dashboard">Volver</Button>
 * <Button variant="ghost">Cancelar</Button>
 * ```
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  depth,
  href,
  rounded2xl = false,
  className = '',
  disabled,
  children,
  ...rest
}: ButtonProps) {
  const isDepthVariant = depthVariants.has(variant);
  const effectiveDepth = depth ?? 'full';

  const base = !isDepthVariant
    ? baseFlat
    : effectiveDepth === 'bottom'
      ? baseDepthBottom
      : baseDepthFull;

  const cls = [
    base,
    rounded2xl ? 'rounded-2xl' : 'rounded-xl',
    variantStyles[variant],
    sizeStyles[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  /* Link mode */
  if (href && !disabled) {
    const { type: _type, ...linkRest } = rest;
    return (
      <Link href={href} className={cls} {...linkRest}>
        {children}
      </Link>
    );
  }

  /* Button mode */
  const { type, ...buttonRest } = rest;
  return (
    <button
      type={type ?? 'button'}
      className={cls}
      disabled={disabled}
      {...buttonRest}
    >
      {children}
    </button>
  );
}

/* ── Helper exports ── */

/** @deprecated Use depthBase from '@/lib/design-tokens' instead. */
export { depthBase as depthClasses } from '@/lib/design-tokens';
/** @deprecated Use depthBottomOnly from '@/lib/design-tokens' instead. */
export { depthBottomOnly as depthBottomClasses } from '@/lib/design-tokens';

/** Primary depth color classes only. */
export const depthPrimaryColors =
  'bg-primary border-primary-dark hover:bg-[#1265e0]';

/** Outline depth color classes only. */
export const depthOutlineColors =
  'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-900 border-b-gray-300 dark:border-b-gray-900 hover:bg-gray-50 dark:hover:bg-gray-900';

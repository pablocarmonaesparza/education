'use client';

import Link from 'next/link';
import React from 'react';

/* ───────────────────────────────────────────────────────────
   Design-system Button
   Canonical depth: border-2 border-b-4 · active:border-b-2 active:mt-[2px]
   ─────────────────────────────────────────────────────────── */

const baseCommon =
  'font-bold uppercase tracking-wide transition-all duration-150 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

/** Depth variants get the 3-D border treatment. */
const baseDepth =
  baseCommon +
  ' border-2 border-b-4 active:border-b-2 active:mt-[2px] disabled:active:border-b-4 disabled:active:mt-0';

/** Flat variants have no visible border. */
const baseFlat = baseCommon;

/* — variant → color palette — */
const variantStyles = {
  /** Blue filled with depth border */
  primary:
    'bg-[#1472FF] text-white border-[#0E5FCC] hover:bg-[#1265e0]',

  /** White / dark-gray filled with neutral depth border */
  outline:
    'bg-white dark:bg-gray-900 text-[#4b4b4b] dark:text-gray-300 ' +
    'border-gray-200 dark:border-gray-950 border-b-gray-300 dark:border-b-gray-950 ' +
    'hover:bg-gray-50 dark:hover:bg-gray-800',

  /** Same as outline but with gray-800 bg in dark */
  secondary:
    'bg-white dark:bg-gray-800 text-[#4b4b4b] dark:text-gray-300 ' +
    'border-gray-200 dark:border-gray-950 border-b-gray-300 dark:border-b-gray-950 ' +
    'hover:bg-gray-50 dark:hover:bg-gray-700',

  /** Transparent, no border – just hover highlight */
  ghost:
    'bg-transparent text-[#4b4b4b] dark:text-gray-300 ' +
    'hover:bg-gray-100 dark:hover:bg-gray-800',

  /** Sidebar active state */
  'nav-active':
    'bg-[#1472FF] text-white border-[#0E5FCC] hover:bg-[#1265e0]',

  /** Sidebar inactive state */
  'nav-inactive':
    'bg-transparent text-[#4b4b4b] dark:text-gray-300 ' +
    'hover:bg-gray-100 dark:hover:bg-gray-800',

  /** Completado (green) with depth */
  completado:
    'bg-[#22c55e] text-white border-[#16a34a] hover:bg-[#1eab54]',

  /** Danger / destructive */
  danger:
    'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 ' +
    'hover:bg-red-100 dark:hover:bg-red-900',
} as const;

/** Variants that use depth (border-b-4) */
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
} as const;

export type ButtonVariant = keyof typeof variantStyles;
export type ButtonSize = keyof typeof sizeStyles;

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
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
  href,
  rounded2xl = false,
  className = '',
  disabled,
  children,
  ...rest
}: ButtonProps) {
  const useDepth = depthVariants.has(variant);

  const cls = [
    useDepth ? baseDepth : baseFlat,
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

/** Bare depth border classes (no colors). Useful for custom depth elements. */
export const depthClasses =
  'border-2 border-b-4 transition-all duration-150 active:border-b-2 active:mt-[2px]';

/** Primary depth color classes only. */
export const depthPrimaryColors =
  'bg-[#1472FF] border-[#0E5FCC] hover:bg-[#1265e0]';

/** Outline depth color classes only. */
export const depthOutlineColors =
  'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-950 border-b-gray-300 dark:border-b-gray-950 hover:bg-gray-50 dark:hover:bg-gray-800';

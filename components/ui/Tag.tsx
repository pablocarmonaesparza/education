'use client';

import React from 'react';

/* ───────────────────────────────────────────────────────────
   Design-system Tag / Pill
   Seen in: skill tags, tool tags, category badges, labels
   ─────────────────────────────────────────────────────────── */

export type TagVariant = 'primary' | 'outline' | 'success' | 'warning' | 'neutral';

const variantStyles: Record<TagVariant, string> = {
  /** Blue-tinted bg, blue text, subtle border */
  primary:
    'bg-[#1472FF]/10 text-[#0E5FCC] dark:text-[#1472FF] border border-[#1472FF]/20',

  /** White bg, gray text, neutral border */
  outline:
    'bg-white dark:bg-gray-800 text-[#4b4b4b] dark:text-gray-300 border border-gray-200 dark:border-gray-700',

  /** Green-tinted bg, green text */
  success:
    'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800',

  /** Yellow-tinted bg */
  warning:
    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800',

  /** Gray bg, subtle */
  neutral:
    'bg-gray-100 dark:bg-gray-800 text-[#4b4b4b] dark:text-gray-300 border border-gray-200 dark:border-gray-700',
};

export interface TagProps {
  variant?: TagVariant;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Small pill / tag for labels, skills, tools, categories.
 *
 * ```tsx
 * <Tag variant="primary">Next.js</Tag>
 * <Tag variant="success">Completado</Tag>
 * <Tag variant="neutral">Básico</Tag>
 * ```
 */
export default function Tag({
  variant = 'primary',
  className = '',
  children,
}: TagProps) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

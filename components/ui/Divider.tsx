'use client';

import React from 'react';

/* ───────────────────────────────────────────────────────────
   Design-system Divider
   h-[2px] · bg-gray-300 (light) / bg-gray-600 (dark) · centered text
   ─────────────────────────────────────────────────────────── */

export interface DividerProps {
  /** Optional centered label text. */
  title?: string;
  className?: string;
}

/**
 * Section divider with optional centered title.
 *
 * ```tsx
 * <Divider />
 * <Divider title="Sección" />
 * ```
 */
export default function Divider({ title, className = '' }: DividerProps) {
  const line =
    'flex-1 h-[2px] bg-gray-300 dark:bg-gray-600 rounded-full';

  if (!title) {
    return <div className={`h-[2px] bg-gray-300 dark:bg-gray-600 rounded-full ${className}`} />;
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className={line} />
      <span className="text-sm font-bold text-gray-500 dark:text-white uppercase tracking-wider whitespace-nowrap">
        {title}
      </span>
      <div className={line} />
    </div>
  );
}

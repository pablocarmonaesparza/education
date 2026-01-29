'use client';

import React from 'react';

/* ───────────────────────────────────────────────────────────
   Design-system Spinner
   Consistent loading indicator used across all pages.
   ─────────────────────────────────────────────────────────── */

export type SpinnerSize = 'sm' | 'md' | 'lg';

const sizeStyles: Record<SpinnerSize, string> = {
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-3',
};

export interface SpinnerProps {
  size?: SpinnerSize;
  /** Override the accent color class. Default: border-[#1472FF]. */
  color?: string;
  className?: string;
}

/**
 * Animated loading spinner.
 *
 * ```tsx
 * <Spinner />
 * <Spinner size="lg" />
 * ```
 */
export default function Spinner({
  size = 'md',
  color = 'border-[#1472FF]',
  className = '',
}: SpinnerProps) {
  return (
    <div
      className={`${sizeStyles[size]} ${color} border-t-transparent rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Cargando"
    />
  );
}

/**
 * Full-page centered spinner, matching the pattern used across dashboard pages.
 *
 * ```tsx
 * <SpinnerPage />
 * ```
 */
export function SpinnerPage({ size = 'md' }: { size?: SpinnerSize }) {
  return (
    <div className="h-[calc(100vh-10rem)] md:h-[calc(100vh-11rem)] bg-transparent flex items-center justify-center">
      <Spinner size={size} />
    </div>
  );
}

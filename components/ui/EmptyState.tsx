'use client';

import React from 'react';

/* ───────────────────────────────────────────────────────────
   Design-system Empty State
   Centered card with icon, title, description, optional CTA.
   Seen in: retos (no exercises), favorites (empty), etc.
   ─────────────────────────────────────────────────────────── */

export interface EmptyStateProps {
  /** Icon element (SVG or emoji). Rendered inside a blue circle. */
  icon: React.ReactNode;
  /** Main heading. */
  title: string;
  /** Description text. */
  description: string;
  /** Optional call-to-action button (render a <Button> here). */
  action?: React.ReactNode;
  className?: string;
}

/**
 * Empty / zero-state card.
 *
 * ```tsx
 * <EmptyState
 *   icon={<LightningIcon className="w-10 h-10 text-white" />}
 *   title="Aún no tienes retos"
 *   description="Los retos se generan automáticamente al crear tu curso."
 *   action={<Button variant="primary">Crear mi curso</Button>}
 * />
 * ```
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`max-w-2xl mx-auto mt-16 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/50 dark:to-gray-900 rounded-2xl border border-blue-100 dark:border-blue-900 p-12 text-center ${className}`}
    >
      {/* Icon circle */}
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#1472FF] border-2 border-b-4 border-[#0E5FCC] flex items-center justify-center">
        {icon}
      </div>

      <h2 className="text-2xl font-bold text-[#4b4b4b] dark:text-white mb-3">
        {title}
      </h2>

      <p className="text-[#777777] dark:text-gray-400 max-w-md mx-auto mb-6">
        {description}
      </p>

      {action && <div>{action}</div>}
    </div>
  );
}

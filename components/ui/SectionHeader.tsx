'use client';

import React from 'react';

/* ───────────────────────────────────────────────────────────
   Design-system Section Header
   Repeated pattern: page title (h1) + subtitle (p)
   Seen in: retos, courses, perfil, progress pages
   ─────────────────────────────────────────────────────────── */

export interface SectionHeaderProps {
  /** Page/section title — rendered lowercase per design rules. */
  title: string;
  /** Optional subtitle / description line. */
  subtitle?: string;
  /** Right-side slot for actions or context info. */
  action?: React.ReactNode;
  className?: string;
}

/**
 * Consistent page / section header.
 *
 * ```tsx
 * <SectionHeader title="retos" subtitle="Practica lo que aprendes" />
 * <SectionHeader
 *   title="todos los cursos"
 *   subtitle="Explora el catálogo completo"
 *   action={<Button variant="primary" size="sm">Nuevo</Button>}
 * />
 * ```
 *
 * **Regla:** el título se renderiza tal cual — por convención debe
 * escribirse en minúsculas.
 */
export default function SectionHeader({
  title,
  subtitle,
  action,
  className = '',
}: SectionHeaderProps) {
  return (
    <div className={`mb-8 ${className}`}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#4b4b4b] dark:text-white tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-[#777777] dark:text-gray-400">{subtitle}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}

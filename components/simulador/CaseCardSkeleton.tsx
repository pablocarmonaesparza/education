/**
 * CaseCardSkeleton — placeholder de carga con la misma silueta que CaseCard.
 *
 * Se usa en los grids del catálogo (/casos, /team, /staff/casos) mientras
 * llega GET /api/cases. Lleva el mismo borde que CaseCard (regla explícita:
 * las cards de caso sí llevan contorno) para que el swap no salte.
 */

import { AppleSkeleton } from "@/components/simulador/apple";

export function CaseCardSkeleton() {
  return (
    <div
      aria-hidden
      className="flex flex-col rounded-[var(--radius-lg)] border border-[var(--hairline)] bg-[var(--surface)] p-5"
    >
      {/* TOP: chip de nivel + duración */}
      <div className="flex items-center gap-2">
        <AppleSkeleton className="h-5 w-28 rounded-md" />
        <AppleSkeleton className="h-4 w-12" />
      </div>

      {/* TITLE */}
      <AppleSkeleton className="mt-4 h-5 w-4/5" />

      {/* PITCH */}
      <AppleSkeleton className="mt-3 h-4 w-full" />
      <AppleSkeleton className="mt-1.5 h-4 w-2/3" />

      {/* FOOTER */}
      <AppleSkeleton className="mt-5 h-4 w-1/2" />
    </div>
  );
}

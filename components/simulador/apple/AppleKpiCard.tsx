"use client";

import { cn } from "./utils";

export type AppleKpiDirection = "up" | "down" | "flat";

export interface AppleKpiCardProps {
  label: string;
  value: string;
  delta?: { value: string; direction: AppleKpiDirection };
  className?: string;
}

/**
 * AppleKpiCard — tarjeta de métrica (label + número grande + delta opcional).
 * Extraída del bloque reading_kpi_cards; el bloque ahora la consume. Para
 * situar contexto de negocio (MRR, conversión, churn) antes de pedir análisis.
 * Hereda los tokens de color del ancestro `.simulador-root`.
 */
export function AppleKpiCard({ label, value, delta, className }: AppleKpiCardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5",
        className,
      )}
    >
      <div className="ts-caption-1 font-medium text-[var(--text-tertiary)]">{label}</div>
      <div className="mt-2 display display-tight ts-title-1 tabular-nums text-[var(--text-primary)]">
        {value}
      </div>
      {delta && (
        <div className="mt-2 inline-flex items-center gap-1 ts-footnote font-medium tabular-nums text-[var(--text-tertiary)]">
          <DeltaGlyph direction={delta.direction} />
          {delta.value}
        </div>
      )}
    </div>
  );
}

function DeltaGlyph({ direction }: { direction: AppleKpiDirection }) {
  if (direction === "flat") {
    return (
      <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden>
        <path d="M2 6H10" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
      </svg>
    );
  }
  const isUp = direction === "up";
  return (
    <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d={isUp ? "M6 9V3M6 3L3 6M6 3L9 6" : "M6 3V9M6 9L3 6M6 9L9 6"}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

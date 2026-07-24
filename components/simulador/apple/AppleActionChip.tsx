"use client";

import { cn } from "./utils";

export type AppleChipStyle = "neutral" | "permission" | "severity";

export interface AppleActionChipProps {
  label: string;
  value: string;
  selected?: boolean;
  style?: AppleChipStyle;
  onClick?: () => void;
  className?: string;
}

/**
 * AppleActionChip — chip de acción discreta (clasificar filas, permisos,
 * severidad). Extraído del bloque categorize_rows; el bloque lo consume.
 * `style` colorea el seleccionado: neutral=acento, permission (verde/acento/
 * rojo según valor), severity (rojo/acento/verde). Hereda tokens de
 * `.simulador-root`.
 */
export function AppleActionChip({
  label,
  value,
  selected = false,
  style = "neutral",
  onClick,
  className,
}: AppleActionChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(chipClass(selected, value, style), className)}
    >
      {label}
    </button>
  );
}

function chipClass(isSelected: boolean, value: string, style: AppleChipStyle): string {
  // v2: label de chip en bold (jerarquía con peso)
  const base =
    "min-h-9 rounded-[var(--radius-md)] border px-3 py-1.5 ts-caption-1 font-bold transition-colors";
  if (!isSelected) {
    return `${base} border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]`;
  }
  if (style === "permission") {
    if (value === "permitir") return `${base} border-[var(--band-a-text)] bg-[var(--band-a-bg)] text-[var(--band-a-text)]`;
    if (value === "revisar") return `${base} border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]`;
    if (value === "bloquear") return `${base} border-[var(--band-b-text)] bg-[var(--band-b-bg)] text-[var(--band-b-text)]`;
  }
  if (style === "severity") {
    if (value === "riesgo") return `${base} border-[var(--band-b-text)] bg-[var(--band-b-bg)] text-[var(--band-b-text)]`;
    if (value === "escalar") return `${base} border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]`;
    if (value === "normal") return `${base} border-[var(--band-a-text)] bg-[var(--band-a-bg)] text-[var(--band-a-text)]`;
  }
  // v2: seleccionado neutral con accent-border + accent-soft (antes acento
  // sólido — desviación del patrón canónico de selección)
  return `${base} border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]`;
}

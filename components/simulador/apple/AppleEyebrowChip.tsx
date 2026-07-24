"use client";

import type { ReactNode } from "react";
import { cn } from "./utils";

export interface AppleEyebrowChipProps {
  children: ReactNode;
  /** Dot de status (verde) al inicio del pill; default true. */
  dot?: boolean;
  className?: string;
}

/**
 * AppleEyebrowChip — pill de eyebrow sobre un hero/sección: borde
 * accent-border, fondo accent-soft, dot de status y extrabold con tracking.
 * Promovido de la landing v2. Es inline-flex: en un contenedor flex-col
 * pásale `self-start` si no debe estirarse.
 */
export function AppleEyebrowChip({ children, dot = true, className }: AppleEyebrowChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3.5 py-[7px] ts-footnote font-extrabold tracking-[0.3px] text-[var(--accent)]",
        className,
      )}
    >
      {dot && <span className="h-[7px] w-[7px] rounded-full bg-[var(--v2-green)]" aria-hidden />}
      {children}
    </span>
  );
}

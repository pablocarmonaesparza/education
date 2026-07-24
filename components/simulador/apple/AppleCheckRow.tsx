"use client";

import type { ReactNode } from "react";
import { cn } from "./utils";

export interface AppleCheckRowProps {
  children: ReactNode;
  className?: string;
}

/**
 * AppleCheckRow — fila de checklist de marketing: tile accent de 24px con
 * palomita gruesa + texto bold. Promovida de la landing v2. El color del
 * texto se hereda del contenedor, así que funciona sobre surface y sobre
 * bandas oscuras sin props extra.
 */
export function AppleCheckRow({ children, className }: AppleCheckRowProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="grid h-6 w-6 flex-none place-items-center rounded-[var(--radius-sm)] bg-[var(--accent-strong)] text-white">
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          aria-hidden
        >
          <path d="M4 12.5l5 5L20 6.5" />
        </svg>
      </span>
      <span className="ts-callout font-bold">{children}</span>
    </div>
  );
}

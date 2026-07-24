"use client";

import type { ReactNode } from "react";
import { cn } from "./utils";

export interface AppleBrowserFrameProps {
  /**
   * Slot a la derecha de los traffic lights. Un string se renderiza con el
   * estilo default (caption bold atenuado); un nodo se renderiza tal cual
   * (para chips custom, spans con ml-auto, etc.).
   */
  label?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * AppleBrowserFrame — frame de "ventana de browser": barra con 3 traffic
 * lights + slot de label, y children como contenido. Promovido de los mocks
 * de la landing v2 (hero y panel de manager); /demo lo reusa.
 * Sombra default --shadow-float; se sube pasando
 * `className="shadow-float-lg"` (cn hace el merge).
 */
export function AppleBrowserFrame({ label, children, className }: AppleBrowserFrameProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] shadow-float",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-[var(--hairline)] px-[18px] py-3.5">
        <span className="h-[11px] w-[11px] rounded-full bg-[var(--v2-red)]" aria-hidden />
        <span className="h-[11px] w-[11px] rounded-full bg-[var(--v2-amber)]" aria-hidden />
        <span className="h-[11px] w-[11px] rounded-full bg-[var(--v2-green)]" aria-hidden />
        {typeof label === "string" ? (
          <span className="ml-2 ts-caption-1 font-bold text-[var(--text-disabled)]">{label}</span>
        ) : (
          label
        )}
      </div>
      {children}
    </div>
  );
}

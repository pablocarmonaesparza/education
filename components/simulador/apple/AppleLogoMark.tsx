"use client";

import { cn } from "./utils";

export interface AppleLogoMarkProps {
  /** Lado del tile en px; el glyph escala al ~53% (proporción del diseño aprobado). */
  size?: number;
  className?: string;
}

/**
 * AppleLogoMark — el isotipo de itera: tile accent con labio 3D (--shadow-lip)
 * y glyph de nodos en blanco. Promovido de la landing v2 (Duolingo-craft);
 * lo consumen nav y footer, y cualquier superficie que necesite marca.
 */
export function AppleLogoMark({ size = 38, className }: AppleLogoMarkProps) {
  const icon = Math.round(size * 0.53);
  return (
    <div
      className={cn(
        "grid place-items-center rounded-[var(--radius-md)] bg-[var(--accent-strong)] text-white shadow-lip",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        aria-hidden
      >
        <path d="M12 4v6M12 14v6M4 12h6M14 12h6" />
        <circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" />
      </svg>
    </div>
  );
}

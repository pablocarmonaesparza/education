"use client";

import { cn } from "./utils";

export type AppleStatTileTone = "on-surface" | "on-accent";

export interface AppleStatTileProps {
  /** El hecho protagonista ("15 min", "6"). */
  value: string;
  /** La frase que lo sostiene. */
  label: string;
  /** "on-accent" para bandas oscuras/accent (texto blanco); default sobre surface. */
  tone?: AppleStatTileTone;
  className?: string;
}

/**
 * AppleStatTile — stat de marketing: valor display-extrabold + label bold.
 * Es el hermano de marketing de AppleKpiCard (tarjeta de dashboard con delta);
 * NO lo reemplaza. Promovido de la stats band de la landing v2.
 */
export function AppleStatTile({
  value,
  label,
  tone = "on-surface",
  className,
}: AppleStatTileProps) {
  const onAccent = tone === "on-accent";
  return (
    <div className={cn("flex flex-col gap-[5px]", onAccent && "text-white", className)}>
      <span
        className={cn(
          "ts-display-lg font-extrabold tracking-[-1.5px]",
          !onAccent && "text-[var(--text-primary)]",
        )}
      >
        {value}
      </span>
      <span className={cn("ts-subhead font-bold", onAccent ? "opacity-80" : "text-[var(--text-secondary)]")}>
        {label}
      </span>
    </div>
  );
}

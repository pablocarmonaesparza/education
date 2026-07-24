"use client";

import { cn } from "./utils";

/**
 * AppleStepBar — indicador de pasos canónico del simulador.
 *
 * Mismo tratamiento que el runtime de casos (case-demo / case-template): una
 * fila de segmentos `h-1.5 flex-1 rounded-full` (6px — progreso chunky v2; la
 * estética vieja ultra-fina era 3px); el actual va en acento con
 * `animate-pulse`, los completados en `text-secondary`, los pendientes en
 * `surface-3`. Fuente única — lo usan el runtime de casos, el exercise-lab y
 * todas las pantallas del onboarding. Hereda los tokens de color del ancestro
 * `.simulador-root`.
 *
 * Ancho: el contenedor NO fija ancho. En contexto de bloque llena solo; dentro
 * de una fila flex (el chrome del caso) pásale `flex-1` vía `className`.
 *
 * Sin `onSelect` → indicador estático (role="progressbar"). Con `onSelect` →
 * segmentos navegables con área de toque y foco visible (role="group").
 */
export function AppleStepBar({
  total,
  current,
  onSelect,
  className,
  ariaLabel = "Progreso",
}: {
  total: number;
  current: number;
  onSelect?: (index: number) => void;
  className?: string;
  ariaLabel?: string;
}) {
  const tone = (index: number) =>
    index === current
      ? "bg-[var(--accent)] animate-pulse"
      : index < current
        ? "bg-[var(--text-secondary)]"
        : "bg-[var(--surface-3)]";

  return (
    <div
      role={onSelect ? "group" : "progressbar"}
      aria-label={ariaLabel}
      aria-valuemin={onSelect ? undefined : 1}
      aria-valuemax={onSelect ? undefined : total}
      aria-valuenow={onSelect ? undefined : current + 1}
      className={cn("flex items-center gap-2", className)}
    >
      {Array.from({ length: total }).map((_, index) =>
        onSelect ? (
          <button
            key={index}
            type="button"
            aria-label={`Ir al paso ${index + 1}`}
            aria-current={index === current ? "step" : undefined}
            onClick={() => onSelect(index)}
            className="group h-7 flex-1 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            <span
              className={cn(
                "block h-1.5 w-full rounded-full transition-colors",
                tone(index),
              )}
            />
          </button>
        ) : (
          <span
            key={index}
            aria-current={index === current ? "step" : undefined}
            className={cn("h-1.5 flex-1 rounded-full transition-colors", tone(index))}
          />
        ),
      )}
    </div>
  );
}

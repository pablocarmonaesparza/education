"use client";

import type { ReactNode } from "react";
import { cn } from "./utils";

/**
 * AppleSlideButton — el CTA primario "Continuar →" estilo Typeform de los casos.
 *
 * Botón canónico de avance en flujos paso-a-paso (one-thing-per-page): el
 * runtime de casos (case-demo / case-template), el exercise-lab y el onboarding
 * lo usan. Lenguaje v2 (Duolingo-craft): acento sólido + labio 3D grande
 * (`--shadow-lip-lg`), extrabold, `hover:brightness-110`, y press hundido (el
 * labio desaparece y el botón baja los 5px del labio, quedando a ras — transform
 * y box-shadow no participan del layout, así que nada salta). Deshabilitado va
 * en gris (`surface-3` +
 * `text-disabled`) SIN labio ni press, el tono que Pablo usó en los casos.
 * `isLoading` conserva el acento + spinner (botón "ocupado", para los submits
 * async del onboarding).
 *
 * `hint`:
 *   - `true`  → muestra al lado "or press Enter ↵" (flujo que avanza con Enter).
 *   - nodo    → se renderiza ese nodo como hint (p.ej. "Completa el ejercicio…").
 *   - vacío   → solo el botón.
 *
 * `href` lo convierte en `<a>` (para CTAs de navegación tipo "Volver al lab →").
 * Pareja de `AppleStepBar`: juntos son el lenguaje del flujo Typeform. Hereda
 * los tokens de color del ancestro `.simulador-root`.
 */
export function AppleSlideButton({
  children,
  onClick,
  href,
  type = "button",
  isDisabled = false,
  isLoading = false,
  hint,
  fullWidth = false,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  type?: "button" | "submit";
  isDisabled?: boolean;
  isLoading?: boolean;
  hint?: ReactNode;
  /** Ocupa todo el ancho del contenedor y centra el contenido (auth stacked). */
  fullWidth?: boolean;
  className?: string;
}) {
  // Loading conserva el tono acento (botón "ocupado"); disabled-sin-loading va gris.
  // El gris NO lleva labio ni press (y disabled/loading tampoco reciben :active
  // porque el <button> lleva el atributo disabled).
  const grayed = isDisabled && !isLoading;
  const tone = grayed
    ? "bg-[var(--surface-3)] text-[var(--text-disabled)] cursor-not-allowed shadow-none"
    : "accent-bg text-white shadow-lip-lg hover:brightness-110 active:translate-y-[5px] active:shadow-none";
  const cls = cn(
    "rounded-[var(--radius-md)] px-7 py-3 ts-callout font-extrabold tracking-[0.3px] transition-[filter,transform,box-shadow,opacity] duration-[var(--motion-fast)] ease-[var(--motion-ease)]",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
    fullWidth ? "flex w-full items-center justify-center" : "inline-block",
    tone,
    isLoading && "cursor-wait",
    className,
  );

  const inner = (
    <span className="inline-flex items-center gap-2">
      {isLoading && (
        <span
          aria-hidden
          className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
        />
      )}
      {children}
    </span>
  );

  const control = href ? (
    <a href={href} className={cls}>
      {inner}
    </a>
  ) : (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled || isLoading}
      className={cls}
    >
      {inner}
    </button>
  );

  if (!hint) return control;

  const hintNode =
    hint === true ? (
      <span className="ts-footnote text-[var(--text-tertiary)]">
        or press{" "}
        <kbd className="rounded border border-[var(--border)] bg-[var(--surface-2)] px-1.5 py-0.5 ts-caption-2 font-medium text-[var(--text-secondary)]">
          Enter ↵
        </kbd>
      </span>
    ) : (
      hint
    );

  return (
    <div className="flex items-center gap-4">
      {control}
      {hintNode}
    </div>
  );
}

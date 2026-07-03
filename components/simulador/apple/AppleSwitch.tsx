"use client";

import { useId, useState } from "react";
import { cn } from "./utils";

export interface AppleSwitchProps {
  id?: string;
  name?: string;
  isSelected?: boolean;
  defaultSelected?: boolean;
  isDisabled?: boolean;
  onValueChange?: (isSelected: boolean) => void;
  className?: string;
  classNames?: {
    base?: string;
    thumb?: string;
  };
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

/**
 * Switch del sistema.
 *
 * Toggle on/off tokenizado (antes el único uso —notificaciones en /perfil— era
 * un `<Switch>` de HeroUI suelto con classNames ad-hoc, inconsistente con el
 * resto). Reglas de diseño aplicadas:
 *
 * - estado activo usa `var(--accent)` (NO accent-strong, reservado a fondos
 *   sólidos con texto blanco) — DEC color semántico
 * - no depende SOLO del color: la posición del thumb comunica el estado (A11Y-03)
 * - `role="switch"` + `aria-checked`, operable con teclado (Space/Enter), foco
 *   visible con ring de accent
 * - transición de estado con `--motion-base` + `--motion-ease`
 *
 *   <AppleSwitch isSelected={on} onValueChange={setOn} aria-label="Notificaciones" />
 */
export function AppleSwitch({
  id,
  name,
  isSelected,
  defaultSelected = false,
  isDisabled = false,
  onValueChange,
  className,
  classNames,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: AppleSwitchProps) {
  const generatedId = useId();
  const [internal, setInternal] = useState(defaultSelected);
  const selected = isSelected ?? internal;
  const switchId = id ?? `apple-switch-${generatedId}`;

  function toggle() {
    if (isDisabled) return;
    const next = !selected;
    if (isSelected === undefined) setInternal(next);
    onValueChange?.(next);
  }

  return (
    <button
      type="button"
      role="switch"
      id={switchId}
      name={name}
      aria-checked={selected}
      aria-label={ariaLabelledBy ? undefined : ariaLabel}
      aria-labelledby={ariaLabelledBy}
      disabled={isDisabled}
      onClick={toggle}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5 outline-none",
        "transition-colors duration-[var(--motion-base)] ease-[var(--motion-ease)]",
        "focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]",
        selected ? "bg-[var(--accent)]" : "bg-[var(--surface-3)]",
        isDisabled && "cursor-not-allowed opacity-50",
        className,
        classNames?.base,
      )}
    >
      <span
        aria-hidden
        className={cn(
          // Thumb blanco constante sobre el track (misma convención que el
          // texto blanco de AppleButton primary sobre accent).
          "h-5 w-5 rounded-full bg-white shadow-[0_1px_3px_var(--shadow)]",
          "transition-transform duration-[var(--motion-base)] ease-[var(--motion-ease)]",
          selected ? "translate-x-5" : "translate-x-0",
          classNames?.thumb,
        )}
      />
    </button>
  );
}

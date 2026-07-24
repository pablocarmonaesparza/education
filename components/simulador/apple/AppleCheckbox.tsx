"use client";

import { useId, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { cn } from "./utils";

export interface AppleCheckboxProps {
  id?: string;
  name?: string;
  value?: string;
  children?: ReactNode;
  isSelected?: boolean;
  defaultSelected?: boolean;
  isDisabled?: boolean;
  isRequired?: boolean;
  onValueChange?: (isSelected: boolean) => void;
  className?: string;
  classNames?: {
    base?: string;
    input?: string;
    control?: string;
    label?: string;
    icon?: string;
  };
  "aria-label"?: string;
  "aria-describedby"?: string;
}

/**
 * Checkbox del sistema.
 *
 * Evita el wrapper de HeroUI porque su input invisible puede ocupar toda la
 * línea del label; en textos legales con links, eso deja cajas de foco
 * superpuestas al copy. Este componente separa el input real, el control
 * visible y el texto, manteniendo una sola fuente en el design system.
 *
 * - caja 20px, equilibrada con texto de 14px
 * - radius proporcional: calc(var(--radius-md) / 2) = 6px / 20px = 0.30
 * - seleccionado usa --accent; el primary sólido sigue reservado al submit
 * - links dentro del texto legal no togglean el checkbox
 *
 *   <AppleCheckbox isSelected={x} onValueChange={setX}>
 *     Acepto los <AppleLink muted href="/terms">términos</AppleLink>.
 *   </AppleCheckbox>
 */
export function AppleCheckbox({
  id,
  name,
  value,
  children,
  isSelected,
  defaultSelected = false,
  isDisabled = false,
  isRequired = false,
  onValueChange,
  className,
  classNames,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
}: AppleCheckboxProps) {
  const generatedId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalSelected, setInternalSelected] = useState(defaultSelected);
  const selected = isSelected ?? internalSelected;
  const inputId = id ?? `apple-checkbox-${generatedId}`;
  const labelId = `${inputId}-label`;

  function setSelected(next: boolean) {
    if (isSelected === undefined) setInternalSelected(next);
    onValueChange?.(next);
  }

  function handleTextClick(event: MouseEvent<HTMLSpanElement>) {
    if (isDisabled) return;
    const target = event.target as HTMLElement;
    if (target.closest("a, button")) return;
    inputRef.current?.click();
  }

  return (
    <div
      className={cn(
        "group/apple-checkbox flex max-w-full items-start gap-2",
        isDisabled && "opacity-60",
        className,
        classNames?.base,
      )}
    >
      <input
        ref={inputRef}
        id={inputId}
        type="checkbox"
        name={name}
        value={value}
        checked={selected}
        disabled={isDisabled}
        required={isRequired}
        aria-label={children ? undefined : ariaLabel}
        aria-labelledby={children ? labelId : undefined}
        aria-describedby={ariaDescribedBy}
        onChange={(event) => setSelected(event.currentTarget.checked)}
        className={cn("peer sr-only", classNames?.input)}
      />

      <label
        htmlFor={inputId}
        aria-hidden="true"
        className={cn(
          "grid h-6 w-5 shrink-0 cursor-pointer place-items-start pt-0.5",
          "peer-focus:[&>span]:ring-2 peer-focus:[&>span]:ring-[var(--accent)] peer-focus:[&>span]:ring-offset-2 peer-focus:[&>span]:ring-offset-[var(--surface)]",
          "peer-active:[&>span]:scale-[0.96]",
          isDisabled && "cursor-default",
        )}
      >
        <span
          className={cn(
            "grid size-5 place-items-center border bg-[var(--surface)] text-white transition-[background-color,border-color,box-shadow,transform] duration-[var(--motion-fast)] ease-[var(--motion-ease)]",
            "rounded-[calc(var(--radius-md)/2)] border-[var(--border-strong)]",
            selected && "border-[var(--accent-strong)] bg-[var(--accent-strong)]",
            isDisabled && "border-[var(--border)] bg-[var(--surface-2)]",
            classNames?.control,
          )}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 16 12"
            fill="none"
            className={cn(
              "h-3 w-3 transition-opacity duration-[var(--motion-fast)]",
              selected ? "opacity-100" : "opacity-0",
              classNames?.icon,
            )}
          >
            <path
              d="M1.5 6.2 5.6 10 14.5 1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </label>

      {children ? (
        <span
          id={labelId}
          onClick={handleTextClick}
          className={cn(
            "min-w-0 pt-0.5 ts-callout leading-[1.45] text-[var(--text-primary)]",
            isDisabled ? "cursor-default" : "cursor-pointer",
            classNames?.label,
          )}
        >
          {children}
        </span>
      ) : null}
    </div>
  );
}

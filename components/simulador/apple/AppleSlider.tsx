"use client";

import { Slider, type SliderProps } from "@heroui/react";
import { cn } from "./utils";

/**
 * AppleSlider — control de rango con marks, tokenizado igual que AppleInput.
 * Pensado para parámetros ordenados de pocos pasos (ej. nivel N1→N2→N3), no
 * para inputs numéricos libres (eso sigue siendo AppleInput type=number).
 */
export function AppleSlider({ classNames, ...props }: SliderProps) {
  return (
    <Slider
      showSteps
      {...props}
      classNames={{
        base: cn("gap-2 px-10", classNames?.base),
        labelWrapper: cn("mb-1", classNames?.labelWrapper),
        label: cn("ts-subhead font-medium text-[var(--text-secondary)]", classNames?.label),
        value: cn("ts-subhead font-medium text-[var(--text-primary)]", classNames?.value),
        track: cn("border-[var(--border)] bg-[var(--surface-2)]", classNames?.track),
        filler: cn("bg-[var(--accent)]", classNames?.filler),
        thumb: cn(
          "border-2 border-[var(--accent)] bg-[var(--surface)] shadow-[var(--shadow-sm)] after:hidden",
          classNames?.thumb,
        ),
        step: cn(
          "bg-[var(--surface-3)] data-[in-range=true]:bg-[var(--accent)]",
          classNames?.step,
        ),
        mark: cn(
          "ts-caption-1 text-[var(--text-tertiary)] data-[in-range=true]:text-[var(--text-primary)]",
          classNames?.mark,
        ),
      }}
    />
  );
}

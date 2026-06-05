"use client";

import { Checkbox, type CheckboxProps } from "@heroui/react";
import { cn } from "./utils";

/**
 * Checkbox del sistema.
 *
 * HeroUI por defecto deja la caja en 16px con radius ~6px (ratio 0.38, más
 * redonda que los inputs del sistema, que van a ratio 0.27). Y si el texto se
 * pone como hermano FUERA del componente, el <label> vacío de HeroUI reserva
 * espacio y el gap caja↔texto se vuelve impredecible (se ve "muy separado").
 *
 * AppleCheckbox lo fija de una vez para todo el sistema:
 *   - caja 20px, equilibrada con el texto de 14px (la de 16px se veía chica)
 *   - radius 6px → respeta DEC-005 en PROPORCIÓN, no en píxeles absolutos:
 *     12px en una caja de 20px se vería como radio button. 6px/20px = 0.30,
 *     a la par del 0.27 de los textfields.
 *   - relleno seleccionado = --accent explícito (HeroUI no mapea su primary
 *     a nuestro acento)
 *   - el texto va como children → es el label real de HeroUI, gap consistente
 *
 *   <AppleCheckbox isSelected={x} onValueChange={setX}>
 *     Acepto los <AppleLink muted href="/terms">términos</AppleLink>.
 *   </AppleCheckbox>
 */
export function AppleCheckbox({ classNames, ...props }: CheckboxProps) {
  return (
    <Checkbox
      size="md"
      {...props}
      classNames={{
        ...classNames,
        base: cn("items-start gap-2 max-w-full m-0 p-0", classNames?.base),
        wrapper: cn(
          "w-5 h-5 me-0 mt-0.5 rounded-[6px]",
          "before:rounded-[6px] before:border-[var(--border-strong)]",
          "after:rounded-[6px] after:bg-[var(--accent)]",
          classNames?.wrapper,
        ),
        icon: cn("text-white", classNames?.icon),
        label: cn(
          "ms-0 text-[14px] leading-[1.45] text-[var(--text-secondary)]",
          classNames?.label,
        ),
      }}
    />
  );
}

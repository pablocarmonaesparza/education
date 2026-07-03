import { cn } from "./utils";

export interface AppleDividerProps {
  /** Orientación del separador. Horizontal por defecto. */
  orientation?: "horizontal" | "vertical";
  className?: string;
}

/**
 * Separador del sistema — la línea hairline canónica de Itera.
 *
 * Regla de Pablo: agrupar con whitespace primero; cuando hace falta una línea,
 * es un DIVIDER de 1px con el token `--hairline`, nunca un contorno por sección
 * ni un gris hardcodeado. Centralizarlo aquí hace que un cambio futuro de estilo
 * de divisor propague a todo el sistema (fuente única).
 *
 *   <AppleDivider />                        // 1px horizontal full-width
 *   <AppleDivider className="my-6" />       // con respiro vertical
 *   <AppleDivider orientation="vertical" /> // 1px vertical, self-stretch
 */
export function AppleDivider({
  orientation = "horizontal",
  className,
}: AppleDividerProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "shrink-0 bg-[var(--hairline)]",
        orientation === "horizontal" ? "h-px w-full" : "w-px self-stretch",
        className,
      )}
    />
  );
}

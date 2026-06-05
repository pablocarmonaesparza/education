"use client";

import type { CSSProperties } from "react";
import { Link, type LinkProps } from "@heroui/react";
import { cn } from "./utils";

/**
 * Link inline del sistema.
 *
 * El `<Link>` de HeroUI fija `text-medium` (16px) y NO hereda el tamaño del
 * texto que lo rodea, así que un link inline se ve más grande que su oración
 * (se nota sobre todo en letra chica, ej. el pie de términos). AppleLink HEREDA
 * el tamaño (`fontSize: inherit` vía style, que gana sobre la clase de HeroUI) y
 * aplica el lenguaje de link del producto: color de acento + subrayado solo en
 * hover. El peso se hereda del contexto (o se sube con `className="font-medium"`).
 *
 *   <AppleLink href="/terms">términos</AppleLink>               // hereda 12px
 *   <AppleLink href="/x" className="font-medium">CTA</AppleLink> // 14px + 500
 *
 * Variante `muted`: gris + subrayado SIEMPRE, sin acento. Es para fine-print
 * legal (términos, privacidad) que no debe competir con el botón azul primario
 * de la pantalla. El subrayado mantiene la afordancia de link sin gritar color.
 *
 *   <AppleLink muted href="/terms">términos</AppleLink>         // gris subrayado
 */
export function AppleLink({
  className,
  style,
  muted,
  ...props
}: LinkProps & { style?: CSSProperties; muted?: boolean }) {
  return (
    <Link
      {...props}
      style={{ fontSize: "inherit", ...style }}
      className={cn(
        muted
          ? "text-[var(--text-primary)] underline underline-offset-2 decoration-[var(--border-strong)] hover:decoration-[var(--text-primary)]"
          : "text-[var(--accent)] underline-offset-2 hover:underline",
        className,
      )}
    />
  );
}

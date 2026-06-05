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
 */
export function AppleLink({
  className,
  style,
  ...props
}: LinkProps & { style?: CSSProperties }) {
  return (
    <Link
      {...props}
      style={{ fontSize: "inherit", ...style }}
      className={cn(
        "text-[var(--accent)] underline-offset-2 hover:underline",
        className,
      )}
    />
  );
}

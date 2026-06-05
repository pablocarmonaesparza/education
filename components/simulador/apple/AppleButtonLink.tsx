"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { AppleButton } from "./AppleButton";

/**
 * AppleButton que navega como `<Link>`.
 *
 * Es un componente CLIENTE a propósito: pasar `as={Link}` directo a AppleButton
 * desde un server component truena ("Functions cannot be passed to Client
 * Components", porque Link es una función). Este wrapper cruza la frontera
 * cliente él mismo y recibe solo props serializables (href + className strings),
 * así que se puede usar desde server components (ej. /success, /cancel).
 */
export function AppleButtonLink({
  href,
  children,
  className,
  tone,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  tone?: "primary" | "secondary" | "ghost" | "danger" | "destructive";
}) {
  return (
    <AppleButton
      as={Link}
      href={href}
      tone={tone}
      size="lg"
      className={className}
    >
      {children}
    </AppleButton>
  );
}

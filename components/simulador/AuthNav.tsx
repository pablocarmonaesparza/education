"use client";

/**
 * AuthNav — nav minimal para /auth/login y /auth/signup.
 *
 * Solo muestra el logo. El cross-link login↔signup queda únicamente al pie
 * del form para evitar redundancia visual (DEC, Pablo 2026-05-20).
 *
 * Props `mode` y `next` se mantienen por compatibilidad con las páginas que
 * lo importan; no se usan aquí porque ya no hay cross-link en el top.
 */

import Image from "next/image";
import { Link, Navbar, NavbarBrand, NavbarContent } from "@heroui/react";

export function AuthNav({
  mode: _mode,
  next: _next,
}: {
  mode: "login" | "signup";
  next: string;
}) {
  return (
    <Navbar
      maxWidth="full"
      isBordered={false}
      className="surface-backdrop"
      classNames={{
        wrapper: "px-6 max-w-7xl mx-auto h-14",
      }}
    >
      <NavbarContent justify="start">
        <NavbarBrand>
          <Link href="/" color="foreground" className="flex items-center">
            <Image
              src="/images/itera-logo-light.png"
              alt="Itera"
              width={64}
              height={32}
              className="h-6 w-auto"
              priority
            />
          </Link>
        </NavbarBrand>
      </NavbarContent>
    </Navbar>
  );
}

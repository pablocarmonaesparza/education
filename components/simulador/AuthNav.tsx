"use client";

import { Link, Navbar, NavbarBrand, NavbarContent } from "@heroui/react";
import { AppleLogoMark } from "@/components/simulador/apple";

/**
 * Nav de las pantallas de auth: solo el logo (vuelve al landing).
 * El CTA a la pantalla hermana (crear cuenta / iniciar sesión) vive dentro
 * del propio formulario, así que el nav se mantiene limpio.
 */
export function AuthNav() {
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
          <Link href="/" color="foreground" className="flex items-center gap-2.5">
            {/* Marca de la landing: isotipo + wordmark (antes PNG itera-logo-light) */}
            <AppleLogoMark size={38} />
            <span className="ts-title-2 font-extrabold tracking-[-0.8px] text-[var(--text-primary)]">
              itera<span className="text-[var(--accent)]">.</span>
            </span>
          </Link>
        </NavbarBrand>
      </NavbarContent>
    </Navbar>
  );
}

"use client";

/**
 * PublicNav — nav de landing para inversionistas / prospects.
 *
 * Diferente de SurfaceNav (que es nav interna entre demo surfaces).
 *
 * Estructura:
 *   - Logo Itera (link a `/`)
 *   - Anchor links a secciones de la landing (#como-funciona, #casos, #precio)
 *   - Botón "Iniciar sesión" (outlined → /auth/login)
 *   - Botón "Agendar diagnóstico" (filled → signup + onboarding)
 *
 * Mobile: menu hamburguesa con los mismos links + CTAs apilados al final.
 */

import { useState } from "react";
import Image from "next/image";
import {
  Button,
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from "@heroui/react";

const SECTIONS = [
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#casos", label: "Casos" },
  { href: "#precio", label: "Precio" },
];

function BrandMark() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5"
      color="foreground"
    >
      <Image
        src="/images/itera-logo-light.png"
        alt="Itera"
        width={64}
        height={32}
        className="h-6 w-auto"
        priority
      />
    </Link>
  );
}

export function PublicNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <Navbar
      maxWidth="full"
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      isBordered={false}
      className="surface-backdrop"
      classNames={{
        wrapper: "px-6 max-w-7xl mx-auto h-16",
      }}
    >
      <NavbarContent justify="start">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          className="md:hidden text-[var(--text-primary)]"
        />
        <NavbarBrand>
          <BrandMark />
        </NavbarBrand>
      </NavbarContent>

      {/* Desktop links centrales */}
      <NavbarContent justify="center" className="hidden md:flex gap-7">
        {SECTIONS.map((s) => (
          <NavbarItem key={s.href}>
            <Link
              href={s.href}
              size="sm"
              color="foreground"
              className="ts-subhead font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              {s.label}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      {/* Desktop CTAs derecha */}
      <NavbarContent justify="end" className="hidden md:flex gap-2">
        <NavbarItem>
          <Button
            as={Link}
            href="/auth/login"
            radius="md"
            size="sm"
            variant="light"
            className="ts-subhead font-medium text-[var(--text-primary)] hover:bg-[var(--surface-3)] h-9 px-3"
          >
            Iniciar sesión
          </Button>
        </NavbarItem>
        <NavbarItem>
          <Button
            as={Link}
            href="/auth/signup?next=%2Fonboarding%2Forg"
            radius="md"
            size="sm"
            className="accent-bg text-white ts-subhead font-medium h-9 px-4 shadow-none"
          >
            Agendar diagnóstico
          </Button>
        </NavbarItem>
      </NavbarContent>

      {/* Mobile menu */}
      <NavbarMenu className="bg-[var(--surface)] pt-8 gap-1">
        {SECTIONS.map((s) => (
          <NavbarMenuItem key={s.href}>
            <Link
              href={s.href}
              size="lg"
              color="foreground"
              onPress={() => setIsMenuOpen(false)}
              className="w-full py-2 text-[var(--text-primary)]"
            >
              {s.label}
            </Link>
          </NavbarMenuItem>
        ))}
        <div className="mt-6 flex flex-col gap-2">
          <Button
            as={Link}
            href="/auth/login"
            radius="md"
            size="lg"
            variant="bordered"
            onPress={() => setIsMenuOpen(false)}
            className="h-11 border-[var(--border-strong)] text-[var(--text-primary)] bg-[var(--surface)] ts-callout font-medium"
          >
            Iniciar sesión
          </Button>
          <Button
            as={Link}
            href="/auth/signup?next=%2Fonboarding%2Forg"
            radius="md"
            size="lg"
            onPress={() => setIsMenuOpen(false)}
            className="h-11 accent-bg text-white ts-callout font-medium shadow-none"
          >
            Agendar diagnóstico
          </Button>
        </div>
      </NavbarMenu>
    </Navbar>
  );
}

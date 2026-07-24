"use client";

/**
 * PublicNav — nav de landing para inversionistas / prospects.
 *
 * Diferente de SurfaceNav (que es nav interna entre demo surfaces).
 *
 * Estructura (actualizada en el pivot a EEUU 2026-07-15):
 *   - Logo Itera (link a `/`)
 *   - Anchor links a secciones de /demo (#how-it-works, #cases, #pricing)
 *   - Botón "Log in" (ghost en desktop, secondary en mobile → /auth/login)
 *   - Botón "Request a demo" (filled → mailto:hola@itera.la)
 *
 * OJO con el CTA: decía "Request a demo" pero iba a /auth/signup — o sea, el
 * prospecto pedía una demo y recibía un alta de cuenta con paywall de $149.
 * Es la misma carnada que el fix de LandingPage condena explícitamente. Sin CRM
 * ni Calendly, el mailto es el canal que EXISTE. Cuando haya formulario, este
 * href es el que cambia — el label ya describe el destino.
 *
 * Mobile: menu hamburguesa con los mismos links + CTAs apilados al final.
 *
 * Único consumidor: app/demo/page.tsx. Los anchors apuntan a ids que viven en
 * ESE archivo — si cambian allá, cambian aquí.
 */

import { useState } from "react";
import {
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from "@heroui/react";
import { AppleButton, AppleLogoMark } from "@/components/simulador/apple";

// Este nav corona /demo — la página que Pablo le manda a un prospecto de EEUU.
// La traducción se saltó este archivo: el prospecto abría la URL y lo primero que
// veía era "Agendar diagnóstico". Los anchors además apuntaban a secciones que en
// /demo NO existen (#como-funciona, #casos, #precio) — links muertos. Ahora los
// ids son los que /demo realmente tiene.
const SECTIONS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#cases", label: "Cases" },
  { href: "#pricing", label: "Pricing" },
];

/* Misma marca que el nav de la landing (LandingPage.tsx): isotipo promovido
   AppleLogoMark + wordmark. Antes había un PNG script viejo (itera-logo-light)
   que hacía que /demo y `/` parecieran dos productos distintos. */
function BrandMark() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5"
      color="foreground"
    >
      <AppleLogoMark size={38} />
      <span className="ts-title-2 font-extrabold tracking-[-0.8px] text-[var(--text-primary)]">
        itera<span className="text-[var(--accent)]">.</span>
      </span>
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
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
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
              className="ts-callout font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              {s.label}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      {/* Desktop CTAs derecha */}
      <NavbarContent justify="end" className="hidden md:flex gap-2">
        <NavbarItem>
          {/* Los pesos, el fill y el labio los pone el tone (lenguaje v2);
              aquí solo queda el sizing compacto del nav. */}
          <AppleButton
            as={Link}
            href="/auth/login"
            size="sm"
            tone="ghost"
            className="ts-subhead text-[var(--text-primary)] h-9 px-3"
          >
            Log in
          </AppleButton>
        </NavbarItem>
        <NavbarItem>
          <AppleButton
            as={Link}
            href="mailto:hola@itera.la?subject=Itera%20demo%20request&body=Team%20size%3A%0ARole%3A%0AWhat%20your%20team%20uses%20AI%20for%3A"
            size="sm"
            tone="primary"
            className="ts-subhead h-9 px-4"
          >
            Request a demo
          </AppleButton>
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
              className="w-full py-2 font-bold text-[var(--text-primary)]"
            >
              {s.label}
            </Link>
          </NavbarMenuItem>
        ))}
        <div className="mt-6 flex flex-col gap-2">
          <AppleButton
            as={Link}
            href="/auth/login"
            size="lg"
            tone="secondary"
            onPress={() => setIsMenuOpen(false)}
            className="h-11 ts-callout"
          >
            Log in
          </AppleButton>
          {/* Mismo fix que el CTA desktop: "Request a demo" no debe caer en el
              paywall de signup. El mobile se me pasó en el replace_all porque tiene
              distinto className. */}
          <AppleButton
            as={Link}
            href="mailto:hola@itera.la?subject=Itera%20demo%20request&body=Team%20size%3A%0ARole%3A%0AWhat%20your%20team%20uses%20AI%20for%3A"
            size="lg"
            tone="primary"
            onPress={() => setIsMenuOpen(false)}
            className="h-11 ts-callout"
          >
            Request a demo
          </AppleButton>
        </div>
      </NavbarMenu>
    </Navbar>
  );
}

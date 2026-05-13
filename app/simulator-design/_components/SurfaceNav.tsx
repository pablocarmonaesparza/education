"use client";

import { useState } from "react";
import Image from "next/image";
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
import { usePathname } from "next/navigation";

const ROUTES = [
  { href: "/simulator-design", label: "Landing" },
  { href: "/simulator-design/runtime/caso-1", label: "Runtime" },
  { href: "/simulator-design/dashboard", label: "Dashboard" },
  { href: "/simulator-design/reporte/P001", label: "Reporte" },
];

function isActive(pathname: string, href: string) {
  if (href === "/simulator-design") return pathname === href;
  return pathname.startsWith(href);
}

function BrandMark() {
  return (
    <Link
      href="/simulator-design"
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
      <span className="text-[15px] text-[var(--text-tertiary)] mx-0.5">/</span>
      <span className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">
        El Simulador
      </span>
      <span className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-[0.14em] ml-1 px-2 py-0.5 rounded-full bg-[var(--surface-3)]">
        Preview
      </span>
    </Link>
  );
}

export function SurfaceNav() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <Navbar
      maxWidth="full"
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      isBordered={false}
      className="surface-backdrop"
      classNames={{
        wrapper: "px-6 max-w-7xl mx-auto h-14",
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

      <NavbarContent justify="end" className="hidden md:flex gap-6">
        {ROUTES.map((r) => {
          const active = isActive(pathname, r.href);
          return (
            <NavbarItem key={r.href}>
              <Link
                href={r.href}
                size="sm"
                color="foreground"
                className={`text-[13px] font-medium transition-colors ${
                  active
                    ? "text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {r.label}
              </Link>
            </NavbarItem>
          );
        })}
      </NavbarContent>

      <NavbarMenu className="bg-[var(--surface)] pt-6">
        {ROUTES.map((r) => {
          const active = isActive(pathname, r.href);
          return (
            <NavbarMenuItem key={r.href}>
              <Link
                href={r.href}
                size="lg"
                color="foreground"
                onPress={() => setIsMenuOpen(false)}
                className={`w-full py-2 ${
                  active ? "text-[var(--text-primary)] font-medium" : "text-[var(--text-secondary)]"
                }`}
              >
                {r.label}
              </Link>
            </NavbarMenuItem>
          );
        })}
      </NavbarMenu>
    </Navbar>
  );
}

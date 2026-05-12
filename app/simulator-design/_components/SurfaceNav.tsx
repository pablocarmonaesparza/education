"use client";

import { useState } from "react";
import {
  Chip,
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
  { href: "/simulator-design", label: "landing" },
  { href: "/simulator-design/runtime/caso-1", label: "runtime" },
  { href: "/simulator-design/dashboard", label: "dashboard" },
  { href: "/simulator-design/reporte/P001", label: "reporte" },
];

function isActive(pathname: string, href: string) {
  if (href === "/simulator-design") return pathname === href;
  return pathname.startsWith(href);
}

export function SurfaceNav() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <Navbar
      maxWidth="full"
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      className="bg-black/40 backdrop-blur-xl border-b border-white/5"
      classNames={{
        wrapper: "px-6 max-w-7xl mx-auto",
      }}
    >
      <NavbarContent justify="start">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "cerrar menú" : "abrir menú"}
          className="md:hidden text-white"
        />
        <NavbarBrand>
          <Link
            href="/simulator-design"
            className="flex items-center gap-2"
            color="foreground"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 grid place-items-center text-white font-bold text-xs">
              iS
            </div>
            <span className="font-semibold tracking-tight">el simulador</span>
            <Chip
              size="sm"
              variant="flat"
              color="secondary"
              className="ml-2 hidden sm:flex"
            >
              design preview
            </Chip>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent justify="end" className="hidden md:flex gap-1">
        {ROUTES.map((r) => {
          const active = isActive(pathname, r.href);
          return (
            <NavbarItem key={r.href}>
              <Link
                href={r.href}
                size="sm"
                color="foreground"
                className={`px-3 py-1.5 rounded-lg transition ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {r.label}
              </Link>
            </NavbarItem>
          );
        })}
      </NavbarContent>

      <NavbarMenu className="bg-black/95 backdrop-blur-xl pt-6">
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
                  active ? "text-white font-medium" : "text-white/60"
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

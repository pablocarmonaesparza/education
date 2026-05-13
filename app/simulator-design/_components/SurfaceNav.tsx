"use client";

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

function BrandMark() {
  return (
    <Link
      href="/simulator-design"
      className="flex items-center gap-2"
      color="foreground"
    >
      <div className="relative h-6 w-6 flex items-center justify-center">
        <div
          className="absolute inset-0 rounded-[8px]"
          style={{ backgroundColor: "var(--accent)" }}
        />
        <svg
          viewBox="0 0 14 14"
          className="relative h-3 w-3"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2 7L5 4L8 7L11 4"
            stroke="white"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 10L5 7L8 10L11 7"
            stroke="white"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.7"
          />
        </svg>
      </div>
      <span className="text-[15px] font-semibold tracking-tight text-[#1d1d1f]">
        el simulador
      </span>
      <span className="text-[11px] font-medium text-[#86868b] uppercase tracking-[0.12em] ml-1">
        preview
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
      className="bg-white/80 backdrop-blur-xl border-b border-black/[0.06]"
      classNames={{
        wrapper: "px-6 max-w-7xl mx-auto h-14",
      }}
    >
      <NavbarContent justify="start">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "cerrar menú" : "abrir menú"}
          className="md:hidden text-[#1d1d1f]"
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
                    ? "text-[#1d1d1f]"
                    : "text-[#6e6e73] hover:text-[#1d1d1f]"
                }`}
              >
                {r.label}
              </Link>
            </NavbarItem>
          );
        })}
      </NavbarContent>

      <NavbarMenu className="bg-white pt-6">
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
                  active ? "text-[#1d1d1f] font-medium" : "text-[#6e6e73]"
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

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

function BrandMark() {
  return (
    <Link
      href="/simulator-design"
      className="flex items-center gap-2.5"
      color="foreground"
    >
      <div className="relative h-7 w-7">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 opacity-90" />
        <div className="absolute inset-[1px] rounded-[7px] bg-black/40 backdrop-blur-sm grid place-items-center">
          <svg
            viewBox="0 0 14 14"
            className="h-3.5 w-3.5"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 7L5 4L8 7L11 4"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 10L5 7L8 10L11 7"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.6"
            />
          </svg>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[15px] font-semibold tracking-tight text-white">
          el simulador
        </span>
        <Chip
          size="sm"
          variant="flat"
          classNames={{
            base: "h-5 px-2 bg-white/[0.04] border border-white/10",
            content:
              "text-[10px] tracking-wider uppercase text-white/60 font-medium",
          }}
        >
          preview
        </Chip>
      </div>
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
      className="bg-black/60 backdrop-blur-2xl border-b border-white/[0.06]"
      classNames={{
        wrapper: "px-6 max-w-7xl mx-auto h-14",
      }}
    >
      <NavbarContent justify="start">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "cerrar menú" : "abrir menú"}
          className="md:hidden text-white"
        />
        <NavbarBrand>
          <BrandMark />
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent
        justify="end"
        className="hidden md:flex gap-1 bg-white/[0.03] border border-white/[0.06] rounded-full px-1 py-1"
      >
        {ROUTES.map((r) => {
          const active = isActive(pathname, r.href);
          return (
            <NavbarItem key={r.href}>
              <Link
                href={r.href}
                size="sm"
                color="foreground"
                className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all ${
                  active
                    ? "bg-white text-black"
                    : "text-white/55 hover:text-white"
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

"use client";

/**
 * AppSidebar — sidebar vertical fijo para todas las pantallas dashboard
 * (cliente / admin / employee).
 *
 * Layout:
 *   ┌─────────┐
 *   │ [logo]  │  top: brand
 *   │         │
 *   │ Inicio  │  primary nav
 *   │ Equipo  │
 *   │ Reportes│
 *   │ Casos   │
 *   │   ...   │
 *   │         │
 *   │ Perfil  │  bottom: cuenta
 *   │ Empresa │
 *   └─────────┘
 *
 * - Desktop: 224px fijo
 * - Mobile/tablet: off-canvas drawer via NavbarMenu de HeroUI (futuro)
 * - Active state por pathname (matchea prefix)
 * - Iconos Tabler stroke 1.5 (estilo Apple HIG)
 */

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconBriefcase,
  IconFileText,
  IconHome,
  IconUserCircle,
} from "@tabler/icons-react";
import type { ComponentType } from "react";

interface NavItem {
  href: string;
  label: string;
  Icon: ComponentType<{ size?: number; stroke?: number; className?: string }>;
}

// TODO: role-aware. Convención URL:
//   /team = employee  → "Inicio" lleva acá (catálogo de casos personal)
//   /staff = manager  → "Inicio" del manager (dashboard del team)
//   /admin = Itera staff → review queue
// Por ahora hardcodeamos al employee view porque es lo que estamos
// construyendo activamente (Inicio → /team). Cuando se cablee el rol
// real, "Inicio" alterna entre /team y /staff, y "Empresa" se oculta
// para employees.
const PRIMARY: NavItem[] = [
  { href: "/team", label: "Inicio", Icon: IconHome },
  { href: "/reportes", label: "Reportes", Icon: IconFileText },
  { href: "/casos", label: "Casos", Icon: IconBriefcase },
];

// 'Empresa' (gestión de la org) NO va aquí — es vista de manager/org_admin.
// Cuando hagamos role-aware (task #16), aparece solo cuando el user es admin.
const SECONDARY: NavItem[] = [
  { href: "/perfil", label: "Perfil", Icon: IconUserCircle },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  item,
  active,
}: {
  item: NavItem;
  active: boolean;
}) {
  const { Icon } = item;
  return (
    <Link
      href={item.href}
      className={`group flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-[13.5px] font-medium transition-colors ${
        active
          ? "bg-[var(--surface-2)] text-[var(--text-primary)]"
          : "text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
      }`}
    >
      <Icon
        size={18}
        stroke={1.5}
        className={
          active
            ? "text-[var(--text-primary)]"
            : "text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)]"
        }
      />
      <span>{item.label}</span>
    </Link>
  );
}

export function AppSidebar() {
  const pathname = usePathname() ?? "";

  return (
    <aside
      aria-label="Navegación principal"
      className="hidden md:flex md:flex-col fixed inset-y-0 left-0 z-20 w-[224px] bg-[var(--surface)] px-3 py-4"
    >
      {/* Brand */}
      <div className="px-2 py-1.5">
        <Link href="/dashboard" className="inline-flex items-center" aria-label="Inicio">
          <Image
            src="/images/itera-logo-light.png"
            alt="Itera"
            width={64}
            height={32}
            className="h-6 w-auto"
            priority
          />
        </Link>
      </div>

      {/* Primary nav */}
      <nav className="mt-6 flex flex-col gap-0.5">
        {PRIMARY.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}
      </nav>

      {/* Bottom: cuenta (sin divider — política Pablo: cero líneas innecesarias) */}
      <nav className="mt-auto flex flex-col gap-0.5">
        {SECONDARY.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}
      </nav>
    </aside>
  );
}

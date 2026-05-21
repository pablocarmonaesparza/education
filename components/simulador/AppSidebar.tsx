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
  IconBuilding,
  IconFileText,
  IconHome,
  IconUserCircle,
  IconUsers,
} from "@tabler/icons-react";
import type { ComponentType } from "react";

interface NavItem {
  href: string;
  label: string;
  Icon: ComponentType<{ size?: number; stroke?: number; className?: string }>;
}

// Route-aware sidebar:
//   /staff/*  → vista del manager (Equipo + Reportes + Casos + Perfil + Empresa)
//   /team, /casos, /reportes, /perfil (default) → vista del employee
//                                      (Inicio + Reportes + Casos + Perfil)
//   /admin/* → tiene su propia nav interna (este sidebar no aplica realmente
//              pero seguimos mostrando el employee shell por ahora)
//
// TODO post-MVP: convertir a role-aware leyendo
// simulador.organization_memberships del user logueado.

const EMPLOYEE_PRIMARY: NavItem[] = [
  { href: "/team", label: "Inicio", Icon: IconHome },
  { href: "/reportes", label: "Reportes", Icon: IconFileText },
  { href: "/casos", label: "Casos", Icon: IconBriefcase },
];

const EMPLOYEE_SECONDARY: NavItem[] = [
  { href: "/perfil", label: "Perfil", Icon: IconUserCircle },
];

const MANAGER_PRIMARY: NavItem[] = [
  { href: "/staff", label: "Inicio", Icon: IconHome },
  { href: "/staff/equipo", label: "Equipo", Icon: IconUsers },
  { href: "/staff/reportes", label: "Reportes", Icon: IconFileText },
  { href: "/staff/casos", label: "Casos", Icon: IconBriefcase },
];

const MANAGER_SECONDARY: NavItem[] = [
  { href: "/perfil", label: "Perfil", Icon: IconUserCircle },
  { href: "/empresa", label: "Empresa", Icon: IconBuilding },
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

function isManagerView(pathname: string): boolean {
  return pathname === "/staff" || pathname.startsWith("/staff/");
}

export function AppSidebar() {
  const pathname = usePathname() ?? "";
  const isManager = isManagerView(pathname);

  const primaryItems = isManager ? MANAGER_PRIMARY : EMPLOYEE_PRIMARY;
  const secondaryItems = isManager ? MANAGER_SECONDARY : EMPLOYEE_SECONDARY;
  // El logo del brand también lleva al "home" del rol activo: manager → /staff,
  // employee → /team.
  const brandHref = isManager ? "/staff" : "/team";

  return (
    <aside
      aria-label="Navegación principal"
      className="hidden md:flex md:flex-col fixed inset-y-0 left-0 z-20 w-[224px] bg-[var(--surface)] px-3 py-4"
    >
      {/* Brand */}
      <div className="px-2 py-1.5">
        <Link href={brandHref} className="inline-flex items-center" aria-label="Inicio">
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
        {primaryItems.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}
      </nav>

      {/* Bottom: cuenta (sin divider — política Pablo: cero líneas innecesarias) */}
      <nav className="mt-auto flex flex-col gap-0.5">
        {secondaryItems.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}
      </nav>
    </aside>
  );
}

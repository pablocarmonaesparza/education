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
 * - Iconos vía AppleIcon (Tabler stroke 1.5, estilo Apple HIG)
 */

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppleIcon, type AppleIconName } from "./apple";

interface NavItem {
  href: string;
  label: string;
  icon: AppleIconName;
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
  { href: "/team", label: "Inicio", icon: "home" },
  { href: "/reportes", label: "Reportes", icon: "fileText" },
  { href: "/casos", label: "Casos", icon: "briefcase" },
];

const EMPLOYEE_SECONDARY: NavItem[] = [
  { href: "/perfil", label: "Perfil", icon: "userCircle" },
];

const MANAGER_PRIMARY: NavItem[] = [
  { href: "/staff", label: "Inicio", icon: "home" },
  { href: "/staff/equipo", label: "Equipo", icon: "users" },
  { href: "/staff/matriz", label: "Matriz", icon: "chart" },
  { href: "/staff/recomendaciones", label: "Acciones", icon: "sparkles" },
  { href: "/staff/reportes", label: "Reportes", icon: "fileText" },
  { href: "/staff/casos", label: "Casos", icon: "briefcase" },
];

const MANAGER_SECONDARY: NavItem[] = [
  { href: "/perfil", label: "Perfil", icon: "userCircle" },
  { href: "/empresa", label: "Empresa", icon: "building" },
];

// Admin (staff Itera): backoffice. Los 8 destinos viven en el sidebar — no como
// grid de cards en el índice ni como SurfaceNav arriba (eso era el doble logo).
const ADMIN_PRIMARY: NavItem[] = [
  { href: "/admin", label: "Resumen", icon: "home" },
  { href: "/admin/leads", label: "Leads", icon: "mail" },
  { href: "/admin/review", label: "Review", icon: "shield" },
  { href: "/admin/orgs", label: "Clientes", icon: "building" },
  { href: "/admin/captacion", label: "Captación", icon: "search" },
  { href: "/admin/cases", label: "Casos", icon: "briefcase" },
  { href: "/admin/lecciones", label: "Lecciones", icon: "sparkles" },
  { href: "/admin/judge-health", label: "Judge", icon: "brain" },
  { href: "/admin/audit-log", label: "Audit", icon: "fileText" },
];

const ADMIN_SECONDARY: NavItem[] = [
  { href: "/perfil", label: "Perfil", icon: "userCircle" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  item,
  active,
}: {
  item: NavItem;
  active: boolean;
}) {
  return (
    <Link
      href={item.href}
      className={`group flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 ts-subhead font-medium transition-colors ${
        active
          ? "bg-[var(--surface-2)] text-[var(--text-primary)]"
          : "text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
      }`}
    >
      {/* h-[18px]/w-[18px] replica el size={18} del import directo previo */}
      <AppleIcon
        name={item.icon}
        className={`h-[18px] w-[18px] ${
          active
            ? "text-[var(--text-primary)]"
            : "text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)]"
        }`}
      />
      <span>{item.label}</span>
    </Link>
  );
}

function isManagerView(pathname: string): boolean {
  return pathname === "/staff" || pathname.startsWith("/staff/");
}

function isAdminView(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function AppSidebar() {
  const pathname = usePathname() ?? "";
  const isAdmin = isAdminView(pathname);
  const isManager = isManagerView(pathname);

  const primaryItems = isAdmin
    ? ADMIN_PRIMARY
    : isManager
      ? MANAGER_PRIMARY
      : EMPLOYEE_PRIMARY;
  const secondaryItems = isAdmin
    ? ADMIN_SECONDARY
    : isManager
      ? MANAGER_SECONDARY
      : EMPLOYEE_SECONDARY;
  // El logo del brand lleva al "home" del rol activo: admin → /admin,
  // manager → /staff, employee → /team.
  const brandHref = isAdmin ? "/admin" : isManager ? "/staff" : "/team";

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

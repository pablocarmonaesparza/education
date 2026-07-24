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
 * - Iconos vía AppleIcon (Tabler stroke 2, receta v2)
 *
 * Lenguaje v2 (Duolingo-craft, referencia LandingPage):
 * - Marca: AppleLogoMark + wordmark extrabold (mismo patrón que el footer
 *   de la landing: size 32 + ts-body-xl tracking -0.7px).
 * - Items: font-bold, radius-md; activo = chip accent-soft + texto accent.
 * - Fondo surface-2 con border-r para separar el sidebar del canvas
 *   (clave en dark navy: #141833 vs canvas #0b0e1c).
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppleIcon, AppleLogoMark, type AppleIconName } from "./apple";

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
  { href: "/team", label: "Home", icon: "home" },
  // Capacitación continua = pilar del negocio (decisión Pablo 2026-07-06):
  // módulos de actualización de IA + práctica dirigida viven en /aprender.
  { href: "/aprender", label: "Learn", icon: "brain" },
  { href: "/casos", label: "Cases", icon: "briefcase" },
  { href: "/reportes", label: "Reports", icon: "fileText" },
];

const EMPLOYEE_SECONDARY: NavItem[] = [
  { href: "/perfil", label: "Profile", icon: "userCircle" },
];

const MANAGER_PRIMARY: NavItem[] = [
  { href: "/staff", label: "Home", icon: "home" },
  { href: "/staff/equipo", label: "Team", icon: "users" },
  { href: "/staff/matriz", label: "Matrix", icon: "chart" },
  { href: "/staff/recomendaciones", label: "Actions", icon: "sparkles" },
  { href: "/staff/reportes", label: "Reports", icon: "fileText" },
  { href: "/staff/casos", label: "Cases", icon: "briefcase" },
];

const MANAGER_SECONDARY: NavItem[] = [
  { href: "/perfil", label: "Profile", icon: "userCircle" },
  { href: "/empresa", label: "Company", icon: "building" },
];

// Admin (staff Itera): backoffice. Los 8 destinos viven en el sidebar — no como
// grid de cards en el índice ni como SurfaceNav arriba (eso era el doble logo).
const ADMIN_PRIMARY: NavItem[] = [
  { href: "/admin", label: "Overview", icon: "home" },
  { href: "/admin/leads", label: "Leads", icon: "mail" },
  { href: "/admin/review", label: "Review", icon: "shield" },
  { href: "/admin/orgs", label: "Customers", icon: "building" },
  { href: "/admin/captacion", label: "Captación", icon: "search" },
  { href: "/admin/cases", label: "Cases", icon: "briefcase" },
  { href: "/admin/lecciones", label: "Practice", icon: "sparkles" },
  { href: "/admin/judge-health", label: "Judge", icon: "brain" },
  { href: "/admin/audit-log", label: "Audit", icon: "fileText" },
];

const ADMIN_SECONDARY: NavItem[] = [
  { href: "/perfil", label: "Profile", icon: "userCircle" },
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
      aria-current={active ? "page" : undefined}
      className={`group flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 ts-subhead font-bold transition-colors ${
        active
          ? "bg-[var(--accent-soft)] text-[var(--accent)]"
          : "text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
      }`}
    >
      {/* activo = patrón chip v2: fondo accent-soft + icono/texto accent.
          hover usa surface-3 (el sidebar ya vive en surface-2). */}
      <AppleIcon
        name={item.icon}
        className={`h-5 w-5 shrink-0 ${
          active
            ? "text-[var(--accent)]"
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
      aria-label="Main navigation"
      className="hidden md:flex md:flex-col fixed inset-y-0 left-0 z-20 w-[224px] border-r border-[var(--border)] bg-[var(--surface-2)] px-3 py-4"
    >
      {/* Brand — isotipo + wordmark, el patrón de la landing v2 */}
      <div className="px-2 py-1.5">
        <Link href={brandHref} className="inline-flex items-center gap-2" aria-label="Home">
          <AppleLogoMark size={32} />
          <span className="ts-body-xl font-extrabold tracking-[-0.7px] text-[var(--text-primary)]">
            itera<span className="text-[var(--accent)]">.</span>
          </span>
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

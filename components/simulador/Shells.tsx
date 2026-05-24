"use client";

import type { ReactNode } from "react";
import { PublicNav } from "./PublicNav";
import { SurfaceNav } from "./SurfaceNav";
import { AppleSidebar, type AppleSidebarItem } from "./apple";
import { cn } from "./apple";

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <>
      <PublicNav />
      {children}
    </>
  );
}

export function AuthShell({ children }: { children: ReactNode }) {
  return <div className="min-h-screen surface-canvas">{children}</div>;
}

export function OnboardingShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SurfaceNav />
      <main className="surface-canvas min-h-[calc(100vh-3.5rem)] px-6 py-12">
        {children}
      </main>
    </>
  );
}

export function RuntimeShell({ children }: { children: ReactNode }) {
  return <div className="min-h-screen surface-canvas">{children}</div>;
}

export function ReportShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SurfaceNav />
      <main className="surface-canvas min-h-[calc(100vh-3.5rem)] px-6 py-12">
        {children}
      </main>
    </>
  );
}

export function RoleShell({
  title,
  subtitle,
  items,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  items: AppleSidebarItem[];
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="flex min-h-screen bg-[var(--surface)]">
      <AppleSidebar title={title} subtitle={subtitle} items={items} />
      <main className={cn("min-w-0 flex-1", className)}>{children}</main>
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <RoleShell
      title="itera staff"
      subtitle="operación interna"
      items={[
        { href: "/admin/review", label: "Review", icon: "shield" },
        { href: "/admin/leads", label: "Leads", icon: "mail" },
        { href: "/admin/orgs", label: "Orgs", icon: "building" },
        { href: "/admin/judge-health", label: "Judge health", icon: "brain" },
        { href: "/admin/audit-log", label: "Audit log", icon: "fileText" },
      ]}
    >
      {children}
    </RoleShell>
  );
}

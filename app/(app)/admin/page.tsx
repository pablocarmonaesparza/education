"use client";

import Link from "next/link";
import {
  AppleBadge,
  AppleButton,
  AppleCard,
  AppleCardBody,
  AppleIcon,
} from "@/components/simulador/apple";
import { SurfaceNav } from "@/components/simulador/SurfaceNav";

const adminSections = [
  {
    href: "/admin/leads",
    title: "leads",
    icon: "mail" as const,
    description:
      "Capturas del field-test y solicitudes comerciales listas para revisar.",
    status: "activo",
  },
  {
    href: "/admin/review",
    title: "review queue",
    icon: "shield" as const,
    description:
      "Sesiones con riesgo alto que requieren revisión humana antes de publicarse.",
    status: "activo",
  },
  {
    href: "/admin/orgs",
    title: "orgs",
    icon: "building" as const,
    description:
      "Estado operativo de organizaciones, equipos, billing y actividad reciente.",
    status: "activo",
  },
  {
    href: "/admin/judge-health",
    title: "judge health",
    icon: "brain" as const,
    description:
      "Señales de latencia, calibración, drift y cola humana del evaluador.",
    status: "activo",
  },
  {
    href: "/admin/audit-log",
    title: "audit log",
    icon: "fileText" as const,
    description:
      "Cambios privilegiados y eventos auditables del simulador.",
    status: "activo",
  },
];

export default function AdminIndexPage() {
  return (
    <>
      <SurfaceNav />
      <main className="surface-canvas min-h-screen px-6 py-12">
        <section className="mx-auto w-full max-w-6xl">
          <div className="eyebrow">admin itera</div>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="display display-tight text-[36px] text-[var(--text-primary)] sm:text-[44px]">
                operación del simulador.
              </h1>
              <p className="mt-4 max-w-2xl text-[15px] leading-[1.6] text-[var(--text-secondary)]">
                Entrada única del backoffice. Aquí se revisan leads, colas
                humanas, clientes activos y salud del judge.
              </p>
            </div>
            <AppleBadge tone="accent">cleanroom front</AppleBadge>
          </div>

          <section className="mt-10 grid gap-4 md:grid-cols-2">
            {adminSections.map((section) => (
              <AppleCard key={section.href} variant="interactive">
                <AppleCardBody className="p-6">
                  <Link
                    href={section.href}
                    className="group flex h-full items-start justify-between gap-5 rounded-[var(--radius-md)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                  >
                    <div className="flex gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent-soft)] text-[var(--accent)]">
                        <AppleIcon name={section.icon} />
                      </div>
                      <div>
                        <h2 className="text-[20px] font-semibold tracking-[-0.01em] text-[var(--text-primary)]">
                          {section.title}
                        </h2>
                        <p className="mt-2 text-[14px] leading-[1.55] text-[var(--text-secondary)]">
                          {section.description}
                        </p>
                      </div>
                    </div>
                    <AppleIcon
                      name="arrowRight"
                      size="sm"
                      className="mt-1 text-[var(--text-tertiary)] transition-transform group-hover:translate-x-0.5"
                    />
                  </Link>
                </AppleCardBody>
              </AppleCard>
            ))}
          </section>

          <div className="mt-10">
            <AppleButton as={Link} href="/dashboard" tone="ghost">
              Volver al dashboard
            </AppleButton>
          </div>
        </section>
      </main>
    </>
  );
}

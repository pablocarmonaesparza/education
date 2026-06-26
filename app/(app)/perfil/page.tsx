"use client";

/**
 * /perfil — settings personales del user.
 *
 * Patrón Apple Settings: hero con avatar + lista agrupada por secciones.
 * Layout glance-friendly (sin scroll en viewport laptop estándar), HIG estricto.
 *
 * Secciones:
 *   - Hero: avatar + nombre + email + puesto + botón editar foto
 *   - Información personal: nombre, puesto, idioma, notificaciones
 *   - Cuenta: cambiar contraseña, cerrar sesión
 *   - Organización: org + team + member since (read-only)
 *
 * Mock data — cuando se cablee BD, viene de simulador.users +
 * organization_memberships + team_memberships del user logueado.
 */

import { useState } from "react";
import { SelectItem, Switch } from "@heroui/react";
import { AppleButton, AppleInput, AppleSelect } from "@/components/simulador/apple";

// ============================================================================
// MOCK USER DATA
// ============================================================================

const INITIAL = {
  fullName: "Ana López",
  initials: "AL",
  jobTitle: "Growth Manager",
  email: "ana.lopez@acme.com",
  locale: "es-MX",
  notificationsEnabled: true,
  org: {
    name: "Acme LATAM",
    teamName: "Growth",
    memberSince: "2026-04-12",
  },
};

const LOCALE_OPTIONS = [
  { value: "es-MX", label: "Español (México)" },
  { value: "es-419", label: "Español (LATAM)" },
  { value: "es-ES", label: "Español (España)" },
  { value: "en-US", label: "English (US)" },
];

// ============================================================================
// Components
// ============================================================================

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[var(--radius-lg)] bg-[var(--surface-2)] p-5 ${className}`}
    >
      {children}
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <span className="ts-caption-1 font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
      {children}
    </span>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="ts-caption-1 font-medium text-[var(--text-tertiary)]">
      {children}
    </label>
  );
}

// ============================================================================
// PAGE
// ============================================================================

export default function PerfilPage() {
  const [fullName, setFullName] = useState(INITIAL.fullName);
  const [jobTitle, setJobTitle] = useState(INITIAL.jobTitle);
  const [locale, setLocale] = useState(INITIAL.locale);
  const [notifications, setNotifications] = useState(
    INITIAL.notificationsEnabled,
  );

  const memberSinceDate = new Date(INITIAL.org.memberSince).toLocaleDateString(
    "es-ES",
    { month: "long", year: "numeric" },
  );

  return (
    <main className="surface-canvas min-h-[calc(100vh-3.5rem)] px-6 py-6 sm:px-10 sm:py-8">
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-4">
        {/* ============ HEADER ============ */}
        <header>
          <h1 className="display display-tight text-[var(--text-primary)] ts-title-1 sm:ts-display">
            Perfil
          </h1>
          <p className="mt-2 ts-subhead text-[var(--text-secondary)] leading-[1.55]">
            Información que tu manager y tus reportes usan para
            personalizar tu experiencia.
          </p>
        </header>

        {/* ============ HERO: avatar + identidad ============ */}
        <Card className="flex items-center gap-5">
          <div className="relative h-[80px] w-[80px] flex-none">
            <div
              className="flex h-full w-full items-center justify-center rounded-full bg-[var(--surface-2)] ts-title-2 font-semibold text-[var(--text-primary)] tabular-nums ring-2 ring-[var(--accent)]"
              aria-hidden
            >
              {INITIAL.initials}
            </div>
            <button
              type="button"
              aria-label="Cambiar foto"
              className="absolute -bottom-1 -right-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--text-primary)] text-[var(--surface)] shadow-[0_2px_8px_var(--shadow)] hover:opacity-90 transition-opacity"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="ts-title-3 font-semibold tracking-tight text-[var(--text-primary)]">
              {fullName}
            </h2>
            <p className="mt-0.5 ts-subhead text-[var(--text-secondary)]">
              {jobTitle} · {INITIAL.email}
            </p>
            <p className="mt-1 ts-footnote text-[var(--text-tertiary)]">
              {INITIAL.org.name} · Equipo {INITIAL.org.teamName} · desde{" "}
              {memberSinceDate}
            </p>
          </div>
        </Card>

        {/* ============ 2 cols: Info personal + Cuenta ============ */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
          {/* ---- Información personal ---- */}
          <Card>
            <SectionHeader>Información personal</SectionHeader>

            <div className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <FieldLabel>Nombre completo</FieldLabel>
                <AppleInput
                  value={fullName}
                  onValueChange={setFullName}
                  size="md"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <FieldLabel>Puesto</FieldLabel>
                <AppleInput
                  value={jobTitle}
                  onValueChange={setJobTitle}
                  size="md"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <FieldLabel>Idioma</FieldLabel>
                  <AppleSelect
                    aria-label="Idioma"
                    selectedKeys={[locale]}
                    onSelectionChange={(keys) => {
                      const next = Array.from(keys)[0] as string | undefined;
                      if (next) setLocale(next);
                    }}
                    size="md"
                  >
                    {LOCALE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </AppleSelect>
                </div>

                <div className="flex flex-col gap-1.5">
                  <FieldLabel>Notificaciones por email</FieldLabel>
                  <div className="flex h-10 items-center justify-between rounded-[var(--radius-md)] bg-[var(--surface)] px-3">
                    <span className="ts-subhead text-[var(--text-secondary)]">
                      {notifications ? "Activadas" : "Desactivadas"}
                    </span>
                    <Switch
                      isSelected={notifications}
                      onValueChange={setNotifications}
                      size="sm"
                      aria-label="Notificaciones por email"
                      classNames={{
                        wrapper:
                          "bg-[var(--surface-3)] group-data-[selected=true]:bg-[var(--accent)]",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* ---- Cuenta ---- */}
          <Card className="flex flex-col">
            <SectionHeader>Cuenta</SectionHeader>

            <div className="mt-4 flex flex-1 flex-col gap-2">
              <button
                type="button"
                className="flex h-11 items-center justify-between rounded-[var(--radius-md)] bg-[var(--surface)] px-3 transition-colors hover:bg-[var(--surface-3)]"
              >
                <div className="text-left">
                  <div className="ts-subhead font-medium text-[var(--text-primary)]">
                    Cambiar contraseña
                  </div>
                </div>
                <span className="text-[var(--text-tertiary)]" aria-hidden>
                  →
                </span>
              </button>

              <button
                type="button"
                className="flex h-11 items-center justify-between rounded-[var(--radius-md)] bg-[var(--surface)] px-3 transition-colors hover:bg-[var(--surface-3)]"
              >
                <div className="text-left">
                  <div className="ts-subhead font-medium text-[var(--text-primary)]">
                    Métodos de autenticación
                  </div>
                  <div className="ts-caption-1 text-[var(--text-tertiary)]">
                    Email + Google
                  </div>
                </div>
                <span className="text-[var(--text-tertiary)]" aria-hidden>
                  →
                </span>
              </button>

              <AppleButton
                type="button"
                tone="secondary"
                size="lg"
                className="mt-auto w-full justify-center"
              >
                Cerrar sesión
              </AppleButton>
            </div>
          </Card>
        </section>

      </div>
    </main>
  );
}

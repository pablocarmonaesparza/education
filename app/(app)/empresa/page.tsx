"use client";

/**
 * /empresa — settings de la organización (solo manager / org_admin).
 *
 * Placeholder inicial. Iremos llenando mañana con:
 *   - Identidad: nombre, industria, región, tamaño
 *   - Plan activo + seats + billing (link a Stripe Customer Portal)
 *   - Miembros de la org con sus roles
 *   - Invitar más miembros
 *   - Branding / logo (post-MVP)
 */

import { useState } from "react";
import { Input, Select, SelectItem } from "@heroui/react";

const INITIAL = {
  name: "Acme LATAM",
  industry: "saas_b2b",
  region: "MX",
  sizeKey: "51-100",
  plan: {
    tier: "Business",
    seats: 24,
    pricePerSeatUsd: 129,
    totalUsd: 3096,
    renewsAt: "2026-06-19",
  },
  membersCount: 18,
};

const INDUSTRY_OPTIONS = [
  { value: "saas_b2b", label: "SaaS B2B" },
  { value: "ecommerce", label: "Ecommerce" },
  { value: "fintech", label: "Fintech" },
  { value: "education", label: "Educación" },
  { value: "professional_services", label: "Servicios profesionales" },
];

const REGION_OPTIONS = [
  { value: "MX", label: "México" },
  { value: "CO", label: "Colombia" },
  { value: "AR", label: "Argentina" },
  { value: "CL", label: "Chile" },
  { value: "BR", label: "Brasil" },
  { value: "other_latam", label: "Otro LATAM" },
  { value: "us", label: "EE.UU." },
];

const SIZE_OPTIONS = [
  { value: "1-10", label: "1–10 empleados" },
  { value: "11-50", label: "11–50 empleados" },
  { value: "51-100", label: "51–100 empleados" },
  { value: "101-300", label: "101–300 empleados" },
  { value: "301-500", label: "301–500 empleados" },
  { value: "501+", label: "501+ empleados" },
];

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[var(--radius-lg)] border border-[var(--hairline)] bg-[var(--surface)] p-5 ${className}`}
    >
      {children}
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
      {children}
    </span>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[11.5px] font-medium text-[var(--text-tertiary)]">
      {children}
    </label>
  );
}

export default function EmpresaPage() {
  const [name, setName] = useState(INITIAL.name);
  const [industry, setIndustry] = useState(INITIAL.industry);
  const [region, setRegion] = useState(INITIAL.region);
  const [sizeKey, setSizeKey] = useState(INITIAL.sizeKey);

  const renewsLabel = new Date(INITIAL.plan.renewsAt).toLocaleDateString(
    "es-ES",
    { day: "numeric", month: "long", year: "numeric" },
  );

  return (
    <main className="surface-canvas min-h-[calc(100vh-3.5rem)] px-6 py-6 sm:px-10 sm:py-8">
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-4">
        <header>
          <h1 className="display display-tight text-[var(--text-primary)] text-[28px] sm:text-[32px]">
            Empresa
          </h1>
          <p className="mt-2 text-[13.5px] text-[var(--text-secondary)] leading-[1.55]">
            Identidad de tu organización, plan activo y gestión de miembros.
            Solo visible para admins de la org.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_1fr]">
          {/* ---- Identidad ---- */}
          <Card>
            <SectionHeader>Identidad</SectionHeader>

            <div className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <FieldLabel>Nombre de la organización</FieldLabel>
                <Input
                  value={name}
                  onValueChange={setName}
                  variant="bordered"
                  radius="lg"
                  size="md"
                  classNames={{
                    inputWrapper: "h-10",
                    input: "text-[14px]",
                  }}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <FieldLabel>Industria</FieldLabel>
                  <Select
                    aria-label="Industria"
                    selectedKeys={[industry]}
                    onSelectionChange={(keys) => {
                      const next = Array.from(keys)[0] as string | undefined;
                      if (next) setIndustry(next);
                    }}
                    variant="bordered"
                    radius="lg"
                    size="md"
                    classNames={{ trigger: "h-10" }}
                  >
                    {INDUSTRY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <FieldLabel>Región principal</FieldLabel>
                  <Select
                    aria-label="Región principal"
                    selectedKeys={[region]}
                    onSelectionChange={(keys) => {
                      const next = Array.from(keys)[0] as string | undefined;
                      if (next) setRegion(next);
                    }}
                    variant="bordered"
                    radius="lg"
                    size="md"
                    classNames={{ trigger: "h-10" }}
                  >
                    {REGION_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <FieldLabel>Tamaño del equipo</FieldLabel>
                <Select
                  aria-label="Tamaño del equipo"
                  selectedKeys={[sizeKey]}
                  onSelectionChange={(keys) => {
                    const next = Array.from(keys)[0] as string | undefined;
                    if (next) setSizeKey(next);
                  }}
                  variant="bordered"
                  radius="lg"
                  size="md"
                  classNames={{ trigger: "h-10" }}
                >
                  {SIZE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value}>{opt.label}</SelectItem>
                  ))}
                </Select>
              </div>
            </div>
          </Card>

          {/* ---- Plan + billing ---- */}
          <Card className="flex flex-col">
            <SectionHeader>Plan activo</SectionHeader>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="inline-flex items-center rounded-md bg-[var(--accent-soft)] px-2 py-0.5 text-[12px] font-semibold text-[var(--accent)]">
                {INITIAL.plan.tier}
              </span>
              <span className="text-[11.5px] text-[var(--text-tertiary)]">
                {INITIAL.plan.seats} personas
              </span>
            </div>

            <div className="mt-3 text-[24px] font-semibold tracking-tight tabular-nums text-[var(--text-primary)]">
              USD {INITIAL.plan.totalUsd.toLocaleString("en-US")}
              <span className="ml-1 text-[12px] font-normal text-[var(--text-tertiary)]">
                / mes
              </span>
            </div>
            <div className="mt-1 text-[11.5px] text-[var(--text-tertiary)]">
              USD {INITIAL.plan.pricePerSeatUsd} × {INITIAL.plan.seats}
              {" personas"}
            </div>

            <div className="mt-4 rounded-[var(--radius-md)] bg-[var(--surface-2)] px-3 py-2 text-[11.5px] text-[var(--text-secondary)]">
              Próxima renovación: {renewsLabel}
            </div>

            <div className="mt-auto flex flex-col gap-2 pt-4">
              <button
                type="button"
                className="inline-flex h-10 items-center justify-center rounded-[var(--radius-md)] accent-bg px-4 text-[13.5px] font-medium text-white hover:opacity-95 transition-opacity"
              >
                Gestionar billing en Stripe
              </button>
              <button
                type="button"
                className="inline-flex h-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--hairline)] bg-[var(--surface)] px-4 text-[13.5px] text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-colors"
              >
                Cambiar plan
              </button>
            </div>
          </Card>
        </section>

        {/* ---- Miembros (placeholder por ahora) ---- */}
        <Card>
          <div className="flex items-center justify-between">
            <SectionHeader>Miembros de la organización</SectionHeader>
            <button
              type="button"
              className="inline-flex h-8 items-center rounded-[var(--radius-md)] accent-bg px-3 text-[12px] font-medium text-white hover:opacity-95 transition-opacity"
            >
              + Invitar miembro
            </button>
          </div>
          <p className="mt-3 text-[13.5px] text-[var(--text-secondary)]">
            {INITIAL.membersCount} miembros activos. Mañana ponemos lista
            completa con rol, último login y acciones (cambiar rol, quitar).
          </p>
        </Card>

        {/* Save bar */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            className="h-10 px-4 text-[13.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center rounded-[var(--radius-md)] accent-bg px-5 text-[13.5px] font-medium text-white hover:opacity-95 transition-opacity"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </main>
  );
}

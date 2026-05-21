"use client";

/**
 * /team — dashboard del employee (catálogo de casos disponibles).
 *
 * Patrón HIG: H1 display + subtítulo + barra de filtros agrupada + grid
 * de cards con borde + hover lift. Apple HIG/Anthropic console style.
 *
 * Mock data por ahora hasta que cableemos con simulador.case_templates.
 */

import { useMemo, useState } from "react";
import Link from "next/link";

type Level = "basico" | "intermedio" | "avanzado";
type Perfil =
  | "marketing"
  | "growth"
  | "ops"
  | "ventas"
  | "customer_success"
  | "ingenieria"
  | "hr";
type DuracionBucket = "corto" | "medio" | "largo";
type Programa = "diagnostico" | "sprint" | "track";

interface CaseItem {
  slug: string;
  title: string;
  pitch: string;
  level: Level;
  perfil: Perfil;
  durationMin: number;
  programa: Programa;
}

// ============================================================================
// MOCK DATA — reemplazar por fetch a /api/cases cuando se cablee BD.
// ============================================================================

const CASES: CaseItem[] = [
  {
    slug: "marketing_urgent_campaign_pii",
    title: "Campaña urgente con datos sensibles",
    pitch: "El CEO te pide lanzar mañana. El CSV tiene PII.",
    level: "intermedio",
    perfil: "marketing",
    durationMin: 18,
    programa: "diagnostico",
  },
  {
    slug: "growth_attribution_anomaly",
    title: "Anomalía en atribución de ads",
    pitch: "El reporte semanal muestra ROAS 4×. Algo no cuadra.",
    level: "intermedio",
    perfil: "growth",
    durationMin: 20,
    programa: "sprint",
  },
  {
    slug: "ops_invoice_reconciliation",
    title: "Conciliación de facturas pendientes",
    pitch: "30 facturas sin match contra el ERP. Cierre de mes.",
    level: "basico",
    perfil: "ops",
    durationMin: 12,
    programa: "diagnostico",
  },
  {
    slug: "sales_qbr_summary",
    title: "Resumen QBR para C-level",
    pitch: "5 cuentas claves. Tienes 1 hora.",
    level: "avanzado",
    perfil: "ventas",
    durationMin: 22,
    programa: "sprint",
  },
  {
    slug: "cs_churn_detection",
    title: "Detección de churn temprano",
    pitch: "Health score de 200 cuentas. Marca las 10 críticas.",
    level: "intermedio",
    perfil: "customer_success",
    durationMin: 25,
    programa: "track",
  },
  {
    slug: "eng_pr_review_under_pressure",
    title: "Code review bajo presión de release",
    pitch: "PR de 800 líneas, deploy en 2 horas.",
    level: "avanzado",
    perfil: "ingenieria",
    durationMin: 28,
    programa: "track",
  },
  {
    slug: "hr_candidate_screening",
    title: "Screening de 50 candidatos",
    pitch: "Posición tech lead. CVs anonimizados parcialmente.",
    level: "basico",
    perfil: "hr",
    durationMin: 15,
    programa: "diagnostico",
  },
  {
    slug: "marketing_competitor_response",
    title: "Respuesta a campaña de competencia",
    pitch: "Lanzaron hoy. Mañana sales pregunta qué hacer.",
    level: "avanzado",
    perfil: "marketing",
    durationMin: 30,
    programa: "sprint",
  },
  {
    slug: "growth_pricing_test",
    title: "Test de pricing en landing",
    pitch: "PM quiere subir 20%. Tienes 24h para opinar.",
    level: "intermedio",
    perfil: "growth",
    durationMin: 18,
    programa: "sprint",
  },
  {
    slug: "ops_supplier_evaluation",
    title: "Evaluación de proveedor nuevo",
    pitch: "Propuesta de 40 páginas. Compras pide tu read.",
    level: "intermedio",
    perfil: "ops",
    durationMin: 25,
    programa: "track",
  },
  {
    slug: "sales_lost_deal_postmortem",
    title: "Postmortem de deal perdido $200k",
    pitch: "RFP gigante. Perdimos por 'fit'. Investiga.",
    level: "avanzado",
    perfil: "ventas",
    durationMin: 35,
    programa: "track",
  },
  {
    slug: "cs_renewal_negotiation",
    title: "Negociación de renovación",
    pitch: "Cliente $500k/año. Pide 30% descuento.",
    level: "avanzado",
    perfil: "customer_success",
    durationMin: 22,
    programa: "sprint",
  },
];

// ============================================================================
// FILTRO definitions
// ============================================================================

const LEVELS: { value: Level; label: string }[] = [
  { value: "basico", label: "Básico" },
  { value: "intermedio", label: "Intermedio" },
  { value: "avanzado", label: "Avanzado" },
];

const PERFILES: { value: Perfil; label: string }[] = [
  { value: "marketing", label: "Marketing" },
  { value: "growth", label: "Growth" },
  { value: "ops", label: "Operaciones" },
  { value: "ventas", label: "Ventas" },
  { value: "customer_success", label: "Customer Success" },
  { value: "ingenieria", label: "Ingeniería" },
  { value: "hr", label: "HR" },
];

const DURACIONES: {
  value: DuracionBucket;
  label: string;
  check: (m: number) => boolean;
}[] = [
  { value: "corto", label: "Menos de 15 min", check: (m) => m < 15 },
  { value: "medio", label: "15 a 30 min", check: (m) => m >= 15 && m <= 30 },
  { value: "largo", label: "Más de 30 min", check: (m) => m > 30 },
];

const PROGRAMAS: { value: Programa; label: string }[] = [
  { value: "diagnostico", label: "Diagnóstico" },
  { value: "sprint", label: "Sprint" },
  { value: "track", label: "Track" },
];

const LEVEL_LABEL: Record<Level, string> = Object.fromEntries(
  LEVELS.map((l) => [l.value, l.label]),
) as Record<Level, string>;
const PERFIL_LABEL: Record<Perfil, string> = Object.fromEntries(
  PERFILES.map((p) => [p.value, p.label]),
) as Record<Perfil, string>;
const PROGRAMA_LABEL: Record<Programa, string> = Object.fromEntries(
  PROGRAMAS.map((p) => [p.value, p.label]),
) as Record<Programa, string>;

// ============================================================================
// COMPONENT
// ============================================================================

function FilterChip<T extends string>({
  label,
  value,
  active,
  onToggle,
}: {
  label: string;
  value: T;
  active: boolean;
  onToggle: (v: T) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(value)}
      aria-pressed={active}
      className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-all ${
        active
          ? "bg-[var(--text-primary)] text-[var(--surface)]"
          : "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
      }`}
    >
      {label}
    </button>
  );
}

function FilterGroup<T extends string>({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: { value: T; label: string }[];
  selected: Set<T>;
  onToggle: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[12px] font-medium text-[var(--text-tertiary)]">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <FilterChip
            key={opt.value}
            label={opt.label}
            value={opt.value}
            active={selected.has(opt.value)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
}

function CaseCard({ item }: { item: CaseItem }) {
  return (
    <Link
      href={`/case/${item.slug}`}
      className="group flex flex-col rounded-[var(--radius-lg)] border border-[var(--hairline)] bg-[var(--surface)] p-5 transition-all hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[0_4px_16px_var(--shadow)]"
    >
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
        <span>{PROGRAMA_LABEL[item.programa]}</span>
        <span aria-hidden>·</span>
        <span>{item.durationMin} min</span>
      </div>
      <h3 className="mt-3 text-[15.5px] font-semibold leading-[1.3] tracking-tight text-[var(--text-primary)]">
        {item.title}
      </h3>
      <p className="mt-2 text-[13px] leading-[1.5] text-[var(--text-secondary)] line-clamp-2">
        {item.pitch}
      </p>
      <div className="mt-5 flex items-center gap-1.5 text-[12px] text-[var(--text-secondary)]">
        <span>{PERFIL_LABEL[item.perfil]}</span>
        <span aria-hidden>·</span>
        <span>{LEVEL_LABEL[item.level]}</span>
      </div>
    </Link>
  );
}

export default function TeamPage() {
  const [levels, setLevels] = useState<Set<Level>>(new Set());
  const [perfiles, setPerfiles] = useState<Set<Perfil>>(new Set());
  const [duraciones, setDuraciones] = useState<Set<DuracionBucket>>(new Set());
  const [programas, setProgramas] = useState<Set<Programa>>(new Set());

  function toggleSet<T>(set: Set<T>, value: T, setter: (s: Set<T>) => void) {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setter(next);
  }

  const filtered = useMemo(() => {
    return CASES.filter((c) => {
      if (levels.size && !levels.has(c.level)) return false;
      if (perfiles.size && !perfiles.has(c.perfil)) return false;
      if (programas.size && !programas.has(c.programa)) return false;
      if (duraciones.size) {
        const matches = DURACIONES.some(
          (d) => duraciones.has(d.value) && d.check(c.durationMin),
        );
        if (!matches) return false;
      }
      return true;
    });
  }, [levels, perfiles, duraciones, programas]);

  const anyFilterActive =
    levels.size > 0 ||
    perfiles.size > 0 ||
    duraciones.size > 0 ||
    programas.size > 0;

  function clearAll() {
    setLevels(new Set());
    setPerfiles(new Set());
    setDuraciones(new Set());
    setProgramas(new Set());
  }

  return (
    <main className="surface-canvas min-h-[calc(100vh-3.5rem)] px-8 py-12 sm:px-12 lg:px-16">
      <div className="mx-auto w-full max-w-[1280px]">
        {/* ============ HEADER ============ */}
        <header>
          <h1 className="display display-tight text-[var(--text-primary)] text-[32px] sm:text-[40px]">
            Catálogo de casos
          </h1>
          <p className="mt-3 text-[15px] text-[var(--text-secondary)] leading-[1.55] max-w-[640px]">
            Elige un caso para empezar tu diagnóstico. Cada caso dura entre 12
            y 35 minutos y evalúa tu criterio en 5 dimensiones.
          </p>
        </header>

        {/* ============ FILTROS ============ */}
        <section
          aria-label="Filtros"
          className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          <FilterGroup
            label="Nivel"
            options={LEVELS}
            selected={levels}
            onToggle={(v) => toggleSet(levels, v, setLevels)}
          />
          <FilterGroup
            label="Perfil"
            options={PERFILES}
            selected={perfiles}
            onToggle={(v) => toggleSet(perfiles, v, setPerfiles)}
          />
          <FilterGroup
            label="Duración"
            options={DURACIONES.map(({ value, label }) => ({ value, label }))}
            selected={duraciones}
            onToggle={(v) => toggleSet(duraciones, v, setDuraciones)}
          />
          <FilterGroup
            label="Programa"
            options={PROGRAMAS}
            selected={programas}
            onToggle={(v) => toggleSet(programas, v, setProgramas)}
          />
        </section>

        {/* ============ RESULTS META ============ */}
        <div className="mt-10 flex items-center justify-between">
          <span className="text-[13px] text-[var(--text-secondary)]">
            <span className="font-semibold text-[var(--text-primary)]">
              {filtered.length}
            </span>{" "}
            {filtered.length === 1 ? "caso" : "casos"}
            {anyFilterActive && (
              <span className="text-[var(--text-tertiary)]">
                {" "}
                de {CASES.length}
              </span>
            )}
          </span>
          {anyFilterActive && (
            <button
              type="button"
              onClick={clearAll}
              className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* ============ GRID DE CASOS ============ */}
        {filtered.length > 0 ? (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((item) => (
              <CaseCard key={item.slug} item={item} />
            ))}
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--hairline)] py-20 text-center">
            <div className="text-[15px] font-medium text-[var(--text-primary)]">
              No hay casos con esos filtros
            </div>
            <p className="mt-2 text-[13.5px] text-[var(--text-secondary)] max-w-[360px]">
              Prueba quitando alguno o usa el botón de arriba para limpiarlos
              todos.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

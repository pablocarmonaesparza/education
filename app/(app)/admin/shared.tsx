// Primitivas compartidas entre páginas del backoffice /admin.
// Fuente única del surface: orgs, judge-health, cases y lecciones consumen
// estos mismos átomos para que un cambio de estilo propague a todo el admin.

import type { ReactNode } from "react";
import { AppleBadge } from "@/components/simulador/apple";

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="mt-8 rounded-[var(--radius-lg)] bg-[var(--band-b-bg)] p-4 ts-callout text-[var(--band-b-text)]">
      {message}
    </div>
  );
}

// ----------------------------------------------------------------------------
// AdminMetric — tarjeta compacta de métrica operacional. Cubre las dos
// variantes que vivían duplicadas: `compact` (grids densos por org/caso) y
// `danger` (resaltar un umbral cruzado, p. ej. overdue/risk high).
// ----------------------------------------------------------------------------
export function AdminMetric({
  label,
  value,
  compact = false,
  danger = false,
}: {
  label: string;
  value: number | string;
  compact?: boolean;
  danger?: boolean;
}) {
  return (
    <div
      className={`rounded-[var(--radius-2xl)] ${
        danger
          ? "bg-[var(--band-b-bg)]"
          : "bg-[var(--surface-2)]"
      } ${compact ? "p-3" : "p-4"}`}
    >
      <div className="eyebrow">{label}</div>
      <div
        className={`mono font-semibold text-[var(--text-primary)] ${
          compact ? "mt-1 ts-headline" : "mt-2 ts-title-3"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Status / lifecycle pills — reusan el AppleBadge central (single-source).
// ----------------------------------------------------------------------------
type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger";

/** Mapea el lifecycle draft/active/archived a un tono del design system. */
export function lifecycleTone(status: string): BadgeTone {
  if (status === "active") return "success";
  if (status === "draft") return "warning";
  if (status === "archived") return "neutral";
  return "neutral";
}

export function LifecyclePill({ status }: { status: string }) {
  return <AppleBadge tone={lifecycleTone(status)}>{status}</AppleBadge>;
}

/** Pill de estado de billing/subscription (active/trial = saludable). */
export function BillingPill({ status }: { status: string }) {
  const healthy = ["active", "trial"].includes(status);
  return (
    <AppleBadge tone={healthy ? "success" : "neutral"}>{status}</AppleBadge>
  );
}

/** Pill de calificación de un prospecto de captación (válido / descartado / pendiente). */
export function QualifyPill({
  qualifies,
  scored,
}: {
  qualifies: boolean | null;
  scored: boolean;
}) {
  if (!scored) return <AppleBadge tone="warning">sin calificar</AppleBadge>;
  if (qualifies) return <AppleBadge tone="success">válido</AppleBadge>;
  return <AppleBadge tone="neutral">descartado</AppleBadge>;
}

/** Pill de estado de un lead comercial del field-test. */
type LeadStatusValue =
  | "new"
  | "qualified"
  | "contacted"
  | "converted"
  | "lost"
  | "archived";

const LEAD_STATUS_LABEL: Record<LeadStatusValue, string> = {
  new: "Nuevo",
  qualified: "Calificado",
  contacted: "Contactado",
  converted: "Convertido",
  lost: "Perdido",
  archived: "Archivado",
};

function leadStatusTone(status: LeadStatusValue): BadgeTone {
  if (status === "converted") return "success";
  if (status === "lost" || status === "archived") return "neutral";
  if (status === "contacted") return "warning";
  return "accent";
}

export function LeadStatusPill({ status }: { status: LeadStatusValue }) {
  return (
    <AppleBadge tone={leadStatusTone(status)}>
      {LEAD_STATUS_LABEL[status]}
    </AppleBadge>
  );
}

// ----------------------------------------------------------------------------
// Estados de carga / vacío del surface admin.
// ----------------------------------------------------------------------------
export function AdminLoading({ label }: { label: string }) {
  return (
    <div className="mt-12 ts-callout text-[var(--text-secondary)]">{label}</div>
  );
}

export function AdminEmpty({
  label,
  hint,
}: {
  label: string;
  hint?: ReactNode;
}) {
  return (
    <div className="mt-12 rounded-[var(--radius-2xl)] bg-[var(--surface-2)] p-8 ts-callout text-[var(--text-secondary)]">
      <div className="font-medium text-[var(--text-primary)]">{label}</div>
      {hint ? <div className="mt-1">{hint}</div> : null}
    </div>
  );
}

// ----------------------------------------------------------------------------
// Formatters compartidos.
// ----------------------------------------------------------------------------
export function formatDateTime(value: string) {
  return new Date(value).toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
  });
}

export function formatMoney(value: number | null) {
  if (value === null) return "sin precio";
  return `$${value.toLocaleString("en-US")} USD`;
}

/** % redondeado a 1 decimal; 0 si el denominador es 0. */
export function rate(numerator: number, denominator: number) {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
}

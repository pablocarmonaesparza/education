"use client";

/**
 * /admin/leads — bandeja comercial del field-test.
 *
 * Es la superficie staff para operar los leads que salen del diagnóstico
 * público: revisar contexto, cambiar estado y dejar notas internas.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { SelectItem } from "@heroui/react";
import {
  AppleButton,
  AppleKpiCard,
  AppleSelect,
  AppleTabs,
  AppleTextarea,
  type AppleTabItem,
} from "@/components/simulador/apple";
import { ErrorBox, LeadStatusPill } from "../shared";

type LeadStatus =
  | "new"
  | "qualified"
  | "contacted"
  | "converted"
  | "lost"
  | "archived";

interface FieldTestSession {
  id: string;
  case_slug: string;
  status: string;
  report_status: string;
  started_at: string;
  completed_at: string | null;
}

interface LeadItem {
  id: string;
  source: string;
  field_test_session_id: string | null;
  name: string | null;
  email: string;
  company: string | null;
  role: string | null;
  team_size: string | null;
  status: LeadStatus;
  owner_user_id: string | null;
  notes: string | null;
  metadata_json: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  field_test_session: FieldTestSession | null;
}

interface LeadsResponse {
  items: LeadItem[];
  summary: {
    total: number;
    by_status: Record<LeadStatus, number>;
    funnel: {
      window_days: number;
      started: number;
      submitted: number;
      report_viewed: number;
      lead_captured: number;
      abandoned: number;
      submit_rate: number;
      report_to_lead_rate: number;
      start_to_lead_rate: number;
    };
  };
}

const STATUSES: Array<{ id: LeadStatus; label: string }> = [
  { id: "new", label: "Nuevo" },
  { id: "qualified", label: "Calificado" },
  { id: "contacted", label: "Contactado" },
  { id: "converted", label: "Convertido" },
  { id: "lost", label: "Perdido" },
  { id: "archived", label: "Archivado" },
];

function formatDate(value: string | null | undefined) {
  if (!value) return "Sin fecha";
  return new Date(value).toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminLeadsPage() {
  const [data, setData] = useState<LeadsResponse | null>(null);
  const [status, setStatus] = useState<LeadStatus | "all">("all");
  const [error, setError] = useState<string | null>(null);
  const [savingLead, setSavingLead] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const qs = status === "all" ? "" : `?status=${status}`;
      const res = await fetch(`/api/admin/leads${qs}`, { cache: "no-store" });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error(d?.error ?? `Error ${res.status}.`);
      }
      setData((await res.json()) as LeadsResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  async function patchLead(
    leadId: string,
    patch: { status?: LeadStatus; notes?: string | null; assign_to_me?: boolean },
  ) {
    setSavingLead(leadId);
    setError(null);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error(d?.error ?? `Error ${res.status}.`);
      }
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo actualizar el lead.",
      );
    } finally {
      setSavingLead(null);
    }
  }

  const tabItems: AppleTabItem[] = useMemo(() => {
    const counts = data?.summary.by_status;
    return [
      { id: "all", label: "Todos", badge: data?.summary.total ?? 0 },
      ...STATUSES.map((item) => ({
        id: item.id,
        label: item.label,
        badge: counts?.[item.id] ?? 0,
      })),
    ];
  }, [data]);
  const funnel = data?.summary.funnel;

  return (
    <>
      <main className="surface-canvas min-h-screen pb-24">
        <section className="reading-col px-6 pt-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="display ts-display text-[var(--text-primary)]">
              Leads del field-test
            </h1>
            <p className="mt-4 max-w-2xl ts-body leading-[1.55] text-[var(--text-secondary)]">
              Personas que terminaron el diagnóstico público y pidieron contacto.
              Esta bandeja existe para que el aprendizaje de mercado no se quede
              escondido en la base de datos.
            </p>
          </motion.div>

          {error && <ErrorBox message={error} />}

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <AppleKpiCard label="Inicios" value={String(funnel?.started ?? 0)} />
            <AppleKpiCard label="Enviados" value={String(funnel?.submitted ?? 0)} />
            <AppleKpiCard label="Report vistos" value={String(funnel?.report_viewed ?? 0)} />
            <AppleKpiCard label="Leads" value={String(funnel?.lead_captured ?? 0)} />
            <AppleKpiCard label="Report → lead" value={`${funnel?.report_to_lead_rate ?? 0}%`} />
            <AppleKpiCard label="Abandono" value={String(funnel?.abandoned ?? 0)} />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <AppleTabs
              ariaLabel="Filtrar leads por status"
              items={tabItems}
              value={status}
              onChange={(value) => setStatus(value as LeadStatus | "all")}
            />
            <AppleButton
              tone="secondary"
              size="sm"
              className="bg-[var(--surface-2)] text-[var(--text-primary)]"
              onPress={load}
            >
              Actualizar
            </AppleButton>
          </div>

          {data === null && !error && (
            <div className="mt-12 ts-callout text-[var(--text-secondary)]">
              Cargando leads…
            </div>
          )}

          {data !== null && data.items.length === 0 && (
            <div className="mt-12 rounded-[var(--radius-2xl)] bg-[var(--surface)] p-8 ts-callout text-[var(--text-secondary)]">
              No hay leads en este estado.
            </div>
          )}

          <div className="mt-8 space-y-4">
            {data?.items.map((lead, index) => (
              <LeadCard
                key={`${lead.id}:${lead.updated_at}`}
                lead={lead}
                index={index}
                isSaving={savingLead === lead.id}
                onPatch={(patch) => patchLead(lead.id, patch)}
              />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

function LeadCard({
  lead,
  index,
  isSaving,
  onPatch,
}: {
  lead: LeadItem;
  index: number;
  isSaving: boolean;
  onPatch: (patch: {
    status?: LeadStatus;
    notes?: string | null;
    assign_to_me?: boolean;
  }) => void;
}) {
  const [notes, setNotes] = useState(lead.notes ?? "");
  const session = lead.field_test_session;
  const reportStatus =
    typeof lead.metadata_json?.report_status === "string"
      ? lead.metadata_json.report_status
      : session?.report_status;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.03 }}
      className="card-apple bg-[var(--surface)] p-6 sm:p-7"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <LeadStatusPill status={lead.status} />
            <span className="rounded-full bg-[var(--surface-2)] px-2.5 py-1 ts-caption-1 font-medium text-[var(--text-tertiary)]">
              {lead.source.replace(/_/g, " ")}
            </span>
            {reportStatus && (
              <span className="rounded-full bg-[var(--surface-2)] px-2.5 py-1 ts-caption-1 font-medium text-[var(--text-tertiary)]">
                reporte {reportStatus}
              </span>
            )}
          </div>

          <h2 className="mt-4 ts-title-3 font-semibold text-[var(--text-primary)]">
            {lead.name ?? "Sin nombre"}
          </h2>
          <div className="mt-2 ts-callout text-[var(--text-secondary)]">
            <a
              className="hover:text-[var(--text-primary)]"
              href={`mailto:${lead.email}`}
            >
              {lead.email}
            </a>
            {lead.company ? ` · ${lead.company}` : ""}
          </div>
          <div className="mt-2 ts-subhead text-[var(--text-tertiary)]">
            {lead.role || "Rol no indicado"}
            {lead.team_size ? ` · equipo ${lead.team_size}` : ""}
          </div>
        </div>

        <div className="text-left lg:text-right">
          <div className="ts-footnote mono text-[var(--text-tertiary)]">
            creado {formatDate(lead.created_at)}
          </div>
          {session && (
            <div className="mt-2 ts-footnote mono text-[var(--text-tertiary)]">
              {session.case_slug} · {session.status}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_240px]">
        <AppleTextarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Notas internas para seguimiento comercial..."
          minRows={3}
          className="min-h-[88px] w-full"
        />

        <div className="flex flex-col gap-2">
          <AppleSelect
            aria-label="Cambiar status del lead"
            selectedKeys={[lead.status]}
            onSelectionChange={(keys) => {
              const next = Array.from(keys)[0] as LeadStatus | undefined;
              if (next) onPatch({ status: next });
            }}
            isDisabled={isSaving}
            size="sm"
          >
            {STATUSES.map((item) => (
              <SelectItem key={item.id}>{item.label}</SelectItem>
            ))}
          </AppleSelect>

          <AppleButton
            size="sm"
            isDisabled={isSaving}
            onPress={() => onPatch({ notes, assign_to_me: true })}
          >
            {isSaving ? "Guardando…" : "Guardar y tomar"}
          </AppleButton>
          <AppleButton
            tone="secondary"
            size="sm"
            isDisabled={isSaving}
            className="bg-[var(--surface-2)] text-[var(--text-primary)]"
            onPress={() => onPatch({ notes })}
          >
            Guardar notas
          </AppleButton>
        </div>
      </div>
    </motion.article>
  );
}

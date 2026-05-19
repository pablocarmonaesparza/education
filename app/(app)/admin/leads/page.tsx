"use client";

/**
 * /admin/leads — bandeja comercial del field-test.
 *
 * Es la superficie staff para operar los leads que salen del diagnóstico
 * público: revisar contexto, cambiar estado y dejar notas internas.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@heroui/react";
import { motion } from "framer-motion";
import { SurfaceNav } from "@/components/simulador/SurfaceNav";

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

const STATUS_COPY: Record<LeadStatus, string> = {
  new: "Nuevo",
  qualified: "Calificado",
  contacted: "Contactado",
  converted: "Convertido",
  lost: "Perdido",
  archived: "Archivado",
};

function statusTone(status: LeadStatus) {
  if (status === "converted")
    return "bg-[var(--band-a-bg)] text-[var(--band-a-text)]";
  if (status === "lost" || status === "archived")
    return "bg-[var(--surface-2)] text-[var(--text-tertiary)]";
  if (status === "contacted")
    return "bg-[var(--band-m-bg)] text-[var(--band-m-text)]";
  return "bg-[var(--accent-soft)] text-[var(--accent)]";
}

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

  const summaryItems = useMemo(() => {
    const counts = data?.summary.by_status;
    return STATUSES.map((item) => ({
      ...item,
      count: counts?.[item.id] ?? 0,
    }));
  }, [data]);

  return (
    <>
      <SurfaceNav />
      <main className="surface-canvas min-h-screen pb-24">
        <section className="reading-col px-6 pt-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="eyebrow">Itera staff · adquisición</div>
            <h1 className="display mt-4 text-[36px] text-[var(--text-primary)]">
              Leads del field-test.
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-[1.55] text-[var(--text-secondary)]">
              Personas que terminaron el diagnóstico público y pidieron contacto.
              Esta bandeja existe para que el aprendizaje de mercado no se quede
              escondido en la base de datos.
            </p>
            <a
              href="/admin/review"
              className="mt-5 inline-flex rounded-full bg-[var(--surface-2)] px-4 py-2 text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--surface-3)]"
            >
              Ver review humano
            </a>
          </motion.div>

          {error && (
            <div className="mt-8 rounded-xl bg-[var(--band-b-bg)] p-4 text-[14px] text-[var(--band-b-text)]">
              {error}
            </div>
          )}

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {summaryItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setStatus(item.id)}
                className={`rounded-2xl border p-4 text-left transition-colors ${
                  status === item.id
                    ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                    : "border-[var(--hairline)] bg-[var(--surface)] hover:bg-[var(--surface-2)]"
                }`}
              >
                <div className="eyebrow">{item.label}</div>
                <div className="mt-2 mono text-[22px] font-semibold text-[var(--text-primary)]">
                  {item.count}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              radius="full"
              size="sm"
              className={
                status === "all"
                  ? "accent-bg text-white"
                  : "bg-[var(--surface-2)] text-[var(--text-primary)]"
              }
              onPress={() => setStatus("all")}
            >
              Todos
            </Button>
            <Button
              radius="full"
              size="sm"
              className="bg-[var(--surface-2)] text-[var(--text-primary)]"
              onPress={load}
            >
              Actualizar
            </Button>
          </div>

          {data === null && !error && (
            <div className="mt-12 text-[14px] text-[var(--text-secondary)]">
              Cargando leads…
            </div>
          )}

          {data !== null && data.items.length === 0 && (
            <div className="mt-12 rounded-2xl bg-[var(--surface)] p-8 text-[14px] text-[var(--text-secondary)]">
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
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusTone(lead.status)}`}>
              {STATUS_COPY[lead.status]}
            </span>
            <span className="rounded-full bg-[var(--surface-2)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-tertiary)]">
              {lead.source.replace(/_/g, " ")}
            </span>
            {reportStatus && (
              <span className="rounded-full bg-[var(--surface-2)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-tertiary)]">
                reporte {reportStatus}
              </span>
            )}
          </div>

          <h2 className="mt-4 text-[22px] font-semibold text-[var(--text-primary)]">
            {lead.name ?? "Sin nombre"}
          </h2>
          <div className="mt-2 text-[14px] text-[var(--text-secondary)]">
            <a
              className="hover:text-[var(--text-primary)]"
              href={`mailto:${lead.email}`}
            >
              {lead.email}
            </a>
            {lead.company ? ` · ${lead.company}` : ""}
          </div>
          <div className="mt-2 text-[13px] text-[var(--text-tertiary)]">
            {lead.role || "Rol no indicado"}
            {lead.team_size ? ` · equipo ${lead.team_size}` : ""}
          </div>
        </div>

        <div className="text-left lg:text-right">
          <div className="text-[12px] mono text-[var(--text-tertiary)]">
            creado {formatDate(lead.created_at)}
          </div>
          {session && (
            <div className="mt-2 text-[12px] mono text-[var(--text-tertiary)]">
              {session.case_slug} · {session.status}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_240px]">
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Notas internas para seguimiento comercial..."
          className="min-h-[88px] w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
        />

        <div className="flex flex-col gap-2">
          <select
            aria-label="Cambiar status del lead"
            value={lead.status}
            onChange={(event) =>
              onPatch({ status: event.target.value as LeadStatus })
            }
            disabled={isSaving}
            className="h-10 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 text-[13px] text-[var(--text-primary)]"
          >
            {STATUSES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>

          <Button
            radius="full"
            size="sm"
            isDisabled={isSaving}
            className="accent-bg text-white"
            onPress={() => onPatch({ notes, assign_to_me: true })}
          >
            {isSaving ? "Guardando…" : "Guardar y tomar"}
          </Button>
          <Button
            radius="full"
            size="sm"
            isDisabled={isSaving}
            className="bg-[var(--surface-2)] text-[var(--text-primary)]"
            onPress={() => onPatch({ notes })}
          >
            Guardar notas
          </Button>
        </div>
      </div>
    </motion.article>
  );
}

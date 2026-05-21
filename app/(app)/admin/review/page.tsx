"use client";

/**
 * /admin/review — cola de review humano para staff Itera.
 *
 * Lista evaluation_runs con risk_event severity=high que esperan doble firma
 * antes de que el report se publique al manager. Staff puede:
 *   - Ver bandas + risk events + recomendación del judge
 *   - Override la recommendation (e.g. de "pausar" a "entrenar" si el judge
 *     fue muy estricto, o a "escalar" si el patrón se ve cross-equipo)
 *   - Agregar resolver_notes (visible solo staff)
 *   - Firmar → primera firma retiene, segunda firma publica.
 *
 * Acceso protegido por isStaffEmail (allowlist por env).
 */

import { useCallback, useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { motion } from "framer-motion";

interface DimensionScore {
  id: string;
  band: "A" | "M" | "B";
  rationale: string;
  confidence: number;
}

interface RiskEvent {
  type: string;
  severity: "low" | "medium" | "high";
  step_ordinal: number;
  evidence_text: string;
}

interface QueueItem {
  queue_id: string;
  triggered_by: string;
  status: "queued" | "in_review";
  due_at: string | null;
  created_at: string;
  review_policy: "single" | "double_high_risk";
  required_review_count: number;
  completed_review_count: number;
  last_reviewed_at: string | null;
  published_at: string | null;
  session_id: string | null;
  evaluation_run: {
    id: string;
    rubric_version: string;
    judge_model: string;
    computed_recommendation: "pilotar" | "entrenar" | "pausar" | "escalar";
    dimension_scores_json: DimensionScore[];
    risk_summary_json: RiskEvent[];
    raw_judge_output_json: unknown;
    override_applied_json: unknown;
    created_at: string;
  } | null;
  report: {
    id: string;
    status: string;
    payload_json: Record<string, unknown>;
  } | null;
  review_decisions: Array<{
    id: string;
    reviewer_user_id: string;
    decision: "approve" | "override" | "escalate";
    reviewer_notes: string | null;
    override_recommendation: string | null;
    created_at: string;
  }>;
}

const RECOMMENDATIONS = ["pilotar", "entrenar", "pausar", "escalar"] as const;

export default function AdminReviewPage() {
  const [items, setItems] = useState<QueueItem[] | null>(null);
  const [currentStaffUserId, setCurrentStaffUserId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [resolving, setResolving] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/admin/review", { cache: "no-store" });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error(d?.error ?? `Error ${res.status}.`);
      }
      const data = await res.json();
      setItems(data.items as QueueItem[]);
      setCurrentStaffUserId(data.current_staff_user_id ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function resolve(
    queueId: string,
    overrideRec: string | null,
    notes: string,
    decision?: "approve" | "override" | "escalate",
  ) {
    setResolving(queueId);
    try {
      const res = await fetch(`/api/admin/review/${queueId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          decision,
          override_recommendation: overrideRec || undefined,
          resolver_notes: notes || undefined,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error(d?.error ?? `Error ${res.status}.`);
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al publicar.");
    } finally {
      setResolving(null);
    }
  }

  return (
    <>
      
      <main className="surface-canvas min-h-screen pb-24">
        <section className="reading-col px-6 pt-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="eyebrow">Itera staff · cola interna</div>
            <h1 className="display mt-4 text-[36px] text-[var(--text-primary)]">
              Review humano de reports
            </h1>
            <p className="mt-4 text-[15px] text-[var(--text-secondary)] max-w-2xl leading-[1.55]">
              Reports con risk events de severidad alta. Requieren doble firma
              humana antes de publicarse al manager; la primera firma retiene el
              reporte, la segunda lo libera.
            </p>
            <AdminLinks />
          </motion.div>

          {error && (
            <div className="mt-8 p-4 rounded-xl bg-[var(--band-b-bg)] text-[var(--band-b-text)] text-[14px]">
              ⚠ {error}
            </div>
          )}

          {items === null && !error && (
            <div className="mt-12 text-[14px] text-[var(--text-secondary)]">
              Cargando cola…
            </div>
          )}

          {items !== null && items.length === 0 && (
            <div className="mt-12 text-[14px] text-[var(--text-secondary)]">
              No hay items pendientes.
            </div>
          )}

          {items?.map((it) => (
            <QueueCard
              key={it.queue_id}
              item={it}
              currentStaffUserId={currentStaffUserId}
              isResolving={resolving === it.queue_id}
              onResolve={(rec, notes, decision) =>
                resolve(it.queue_id, rec, notes, decision)
              }
            />
          ))}
        </section>
      </main>
    </>
  );
}

function AdminLinks() {
  return (
    <div className="mt-5 flex flex-wrap gap-2">
      {[
        ["/admin/leads", "Leads"],
        ["/admin/orgs", "Orgs"],
        ["/admin/judge-health", "Judge health"],
        ["/admin/audit-log", "Audit log"],
      ].map(([href, label]) => (
        <a
          key={href}
          href={href}
          className="rounded-full bg-[var(--surface-2)] px-4 py-2 text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--surface-3)]"
        >
          {label}
        </a>
      ))}
    </div>
  );
}

function QueueCard({
  item,
  currentStaffUserId,
  isResolving,
  onResolve,
}: {
  item: QueueItem;
  currentStaffUserId: string | null;
  isResolving: boolean;
  onResolve: (
    rec: string | null,
    notes: string,
    decision?: "approve" | "override" | "escalate",
  ) => void;
}) {
  const [overrideRec, setOverrideRec] = useState<string>(
    item.evaluation_run?.computed_recommendation ?? "",
  );
  const [notes, setNotes] = useState<string>("");

  const dims = item.evaluation_run?.dimension_scores_json ?? [];
  const risks = item.evaluation_run?.risk_summary_json ?? [];
  const highRisks = risks.filter((r) => r.severity === "high");
  const hasCurrentStaffSigned = item.review_decisions.some(
    (decision) => decision.reviewer_user_id === currentStaffUserId,
  );
  const nextSignatureCount = item.completed_review_count + 1;
  const isFinalSignature = nextSignatureCount >= item.required_review_count;
  const sla = getSlaState(item.due_at);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-8 card-apple bg-[var(--surface)] p-7"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="eyebrow">Sesión {item.session_id?.slice(0, 8)}…</div>
          <h3 className="text-[18px] font-semibold mt-2 text-[var(--text-primary)]">
            Judge recomienda:{" "}
            <span className="capitalize">
              {item.evaluation_run?.computed_recommendation}
            </span>
          </h3>
          <p className="mt-1 text-[12px] mono text-[var(--text-tertiary)]">
            {item.evaluation_run?.judge_model} · rúbrica{" "}
            {item.evaluation_run?.rubric_version} · creado{" "}
            {new Date(item.created_at).toLocaleString("es-MX")}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-[var(--band-b-bg)] text-[var(--band-b-text)]">
            {highRisks.length} risk high
          </span>
          <span
            className={`text-[11px] font-semibold px-2 py-1 rounded-full ${
              sla.isOverdue
                ? "bg-[var(--band-b-bg)] text-[var(--band-b-text)]"
                : "bg-[var(--surface-2)] text-[var(--text-secondary)]"
            }`}
          >
            SLA {sla.label}
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl bg-[var(--surface-2)] p-4">
          <div className="eyebrow">política</div>
          <div className="mt-1 text-[14px] font-semibold text-[var(--text-primary)]">
            {item.review_policy === "double_high_risk"
              ? "doble firma"
              : "firma simple"}
          </div>
        </div>
        <div className="rounded-xl bg-[var(--surface-2)] p-4">
          <div className="eyebrow">firmas</div>
          <div className="mt-1 text-[14px] font-semibold text-[var(--text-primary)] mono">
            {item.completed_review_count}/{item.required_review_count}
          </div>
        </div>
        <div className="rounded-xl bg-[var(--surface-2)] p-4">
          <div className="eyebrow">vencimiento</div>
          <div className="mt-1 text-[14px] font-semibold text-[var(--text-primary)]">
            {item.due_at ? new Date(item.due_at).toLocaleString("es-MX") : "sin SLA"}
          </div>
        </div>
      </div>

      {item.review_decisions.length > 0 && (
        <div className="mt-5 rounded-xl bg-[var(--surface-2)] p-4">
          <div className="eyebrow">firmas registradas</div>
          <div className="mt-3 space-y-2">
            {item.review_decisions.map((decision, index) => (
              <div
                key={decision.id}
                className="flex flex-wrap items-center justify-between gap-2 text-[12px] text-[var(--text-secondary)]"
              >
                <span>
                  firma {index + 1}:{" "}
                  <strong className="text-[var(--text-primary)]">
                    {decision.decision}
                  </strong>
                </span>
                <span className="mono">
                  {decision.reviewer_user_id.slice(0, 8)} ·{" "}
                  {new Date(decision.created_at).toLocaleString("es-MX")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dimensions */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-5 gap-2">
        {dims.map((d) => (
          <div
            key={d.id}
            className="rounded-lg bg-[var(--surface-2)] p-3 text-center"
          >
            <div className="eyebrow">{d.id}</div>
            <div className="mt-1 text-[20px] font-semibold text-[var(--text-primary)] mono">
              {d.band}
            </div>
            <div className="text-[10px] mono text-[var(--text-tertiary)]">
              {(d.confidence * 100).toFixed(0)}%
            </div>
          </div>
        ))}
      </div>

      {/* Risk events high */}
      {highRisks.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="eyebrow">Risk events de alta severidad</div>
          {highRisks.map((r, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-[var(--band-b-bg)] border border-[var(--band-b-text)]/20"
            >
              <div className="flex items-center gap-2 text-[12px]">
                <span className="font-mono">step {r.step_ordinal}</span>
                <span className="capitalize font-semibold">
                  {r.type.replace(/_/g, " ")}
                </span>
              </div>
              <p className="mt-2 text-[13px] text-[var(--band-b-text)] italic leading-[1.5]">
                «{r.evidence_text}»
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Override controls */}
      <div className="mt-7 border-t border-[var(--hairline)] pt-5">
        <div className="eyebrow">Override recomendación</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {RECOMMENDATIONS.map((rec) => (
            <button
              key={rec}
              type="button"
              onClick={() => setOverrideRec(rec)}
              className={`px-3 py-1.5 rounded-full text-[13px] font-medium capitalize transition-colors ${
                overrideRec === rec
                  ? "accent-bg text-white"
                  : "bg-[var(--surface-2)] text-[var(--text-primary)] hover:bg-[var(--surface-3)]"
              }`}
            >
              {rec}
            </button>
          ))}
        </div>
        <textarea
          placeholder="Notas internas (visibles solo staff)..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-4 w-full min-h-[80px] p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
        />
        <div className="mt-4 flex gap-3">
          <Button
            onPress={() =>
              onResolve(
                overrideRec === item.evaluation_run?.computed_recommendation
                  ? null
                  : overrideRec || null,
                notes,
              )
            }
            isDisabled={isResolving || hasCurrentStaffSigned}
            radius="md"
            size="md"
            className="accent-bg text-white h-10 px-5 text-[14px] font-medium"
          >
            {hasCurrentStaffSigned
              ? "Esperando otro revisor"
              : isResolving
              ? isFinalSignature
                ? "Publicando…"
                : "Firmando…"
              : isFinalSignature
                ? "Firmar y publicar"
                : "Firmar revisión"}
          </Button>
          <Button
            onPress={() => onResolve(null, notes, "escalate")}
            isDisabled={isResolving || hasCurrentStaffSigned}
            radius="md"
            size="md"
            variant="bordered"
            className="h-10 px-5 text-[14px] font-medium"
          >
            Escalar sin publicar
          </Button>
        </div>
        {hasCurrentStaffSigned ? (
          <p className="mt-3 text-[12px] text-[var(--text-tertiary)]">
            Tu firma ya quedó guardada. La publicación queda bloqueada hasta
            que otra persona de staff firme la revisión.
          </p>
        ) : !isFinalSignature && (
          <p className="mt-3 text-[12px] text-[var(--text-tertiary)]">
            Esta firma deja el reporte en revisión. Hace falta otra persona de
            staff para publicarlo.
          </p>
        )}
      </div>
    </motion.div>
  );
}

function getSlaState(dueAt: string | null) {
  if (!dueAt) return { label: "sin fecha", isOverdue: false };
  const due = new Date(dueAt).getTime();
  const diffMs = due - Date.now();
  if (Number.isNaN(due)) return { label: "sin fecha", isOverdue: false };
  if (diffMs <= 0) return { label: "vencido", isOverdue: true };
  const hours = Math.ceil(diffMs / (60 * 60 * 1000));
  return {
    label: hours <= 24 ? `vence en ${hours}h` : `vence en ${Math.ceil(hours / 24)}d`,
    isOverdue: false,
  };
}

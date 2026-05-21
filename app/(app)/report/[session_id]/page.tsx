"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Avatar, Button, Link } from "@heroui/react";
import { motion } from "framer-motion";
import { DIMENSIONS } from "@/lib/simulador/config";
import type { BandKey } from "@/lib/simulador/config";
import {
  BAND_DISPLAY,
  bandScore,
  capFirst,
  computeOverall,
  dimensionsById,
  humanRiskType,
  redactSensitiveEvidence,
  type ReportEnvelope,
  type ReportPayload,
} from "@/lib/simulador/reports/model";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
};

function bandTone(b: BandKey) {
  if (b === "A")
    return {
      bg: "bg-[var(--band-a-bg)]",
      text: "text-[var(--band-a-text)]",
      bar: "var(--band-a-bar)",
    };
  if (b === "M")
    return {
      bg: "bg-[var(--band-m-bg)]",
      text: "text-[var(--band-m-text)]",
      bar: "var(--band-m-bar)",
    };
  return {
    bg: "bg-[var(--band-b-bg)]",
    text: "text-[var(--band-b-text)]",
    bar: "var(--band-b-bar)",
  };
}

function severityTone(s: "high" | "medium" | "low") {
  if (s === "high")
    return {
      bg: "bg-[var(--band-b-bg)]",
      text: "text-[var(--band-b-text)]",
      label: "Alta",
    };
  if (s === "medium")
    return {
      bg: "bg-[var(--band-m-bg)]",
      text: "text-[var(--band-m-text)]",
      label: "Media",
    };
  return {
    bg: "bg-[var(--surface-3)]",
    text: "text-[var(--text-secondary)]",
    label: "Baja",
  };
}

// ============================================================================
// PAGE
// ============================================================================

const POLL_INTERVAL_MS = 4000;
const MAX_POLLS = 30; // ~2 minutos a 4s

export default function ReportePage() {
  const params = useParams<{ session_id: string }>();
  const sessionId = params?.session_id ?? null;

  const [envelope, setEnvelope] = useState<ReportEnvelope | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function fetchOnce() {
      try {
        const res = await fetch(`/api/sessions/${sessionId}/report`, {
          cache: "no-store",
        });
        if (cancelled) return;
        if (!res.ok && res.status !== 404) {
          const data = await res.json().catch(() => null);
          throw new Error(
            data?.error ?? `Error ${res.status} al leer el reporte.`,
          );
        }
        const data = (await res.json()) as ReportEnvelope;
        setEnvelope(data);

        // Si está en estado intermedio, seguimos polleando.
        if (
          data.status === "none" &&
          data.session_status === "submitted" &&
          pollCount < MAX_POLLS
        ) {
          timer = setTimeout(() => {
            if (!cancelled) setPollCount((c) => c + 1);
          }, POLL_INTERVAL_MS);
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Error inesperado.");
      }
    }

    fetchOnce();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [sessionId, pollCount]);

  // ============ LOADING / WAITING / ERROR ============
  if (error) {
    return (
      <ShellMessage
        eyebrow="Error al cargar reporte"
        title="No pudimos leer tu reporte."
        body={error}
      />
    );
  }

  if (!envelope) {
    return (
      <ShellMessage
        eyebrow="Cargando"
        title="Preparando tu reporte…"
        spinner
      />
    );
  }

  if (envelope.status === "none") {
    return (
      <ShellMessage
        eyebrow="Evaluación en curso"
        title="Estamos evaluando tu sesión."
        body={
          envelope.message ??
          "El judge LLM compara tus 5 decisiones contra la rúbrica. Esto suele tardar ~30 segundos."
        }
        spinner
      />
    );
  }

  if (!envelope.payload) {
    return (
      <ShellMessage
        eyebrow="Sin payload"
        title="El reporte aún no tiene contenido."
        body="Vuelve en unos segundos."
      />
    );
  }

  return (
    <ReportView
      payload={envelope.payload}
      status={envelope.status}
      generatedAt={envelope.generated_at}
      sessionId={sessionId ?? ""}
    />
  );
}

// ============================================================================
// SHELL MESSAGE (loading / waiting / error)
// ============================================================================

function ShellMessage({
  eyebrow,
  title,
  body,
  spinner,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  spinner?: boolean;
}) {
  return (
    <>
      
      <main className="surface-canvas min-h-[calc(100vh-3.5rem)] grid place-items-center px-6">
        <motion.div {...fadeUp} className="max-w-md text-center">
          {spinner && (
            <div className="mx-auto h-10 w-10 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin" />
          )}
          <div className={`eyebrow ${spinner ? "mt-8" : ""}`}>{eyebrow}</div>
          <h1 className="display mt-3 text-[28px] text-[var(--text-primary)]">
            {title}
          </h1>
          {body && (
            <p className="mt-4 text-[15px] text-[var(--text-secondary)] leading-[1.55]">
              {body}
            </p>
          )}
        </motion.div>
      </main>
    </>
  );
}

// ============================================================================
// REPORT VIEW
// ============================================================================

function ReportView({
  payload,
  status,
  generatedAt,
  sessionId,
}: {
  payload: ReportPayload;
  status: "pending_review" | "published" | "shared";
  generatedAt?: string;
  sessionId: string;
}) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState<
    "idle" | "creating" | "ready" | "copied" | "error"
  >("idle");
  const [shareError, setShareError] = useState<string | null>(null);

  const bands = dimensionsById(payload);
  const { score: overallScore, band: overallBand } = computeOverall(payload);

  const generatedDate = generatedAt ? new Date(generatedAt) : null;
  const evaluatedAtStr = generatedDate
    ? generatedDate.toISOString().slice(0, 10)
    : "—";

  const isPending = status === "pending_review";

  async function createShareLink() {
    setShareStatus("creating");
    setShareError(null);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/report/share`, {
        method: "POST",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          data?.error ?? `No pudimos generar el link (${res.status}).`,
        );
      }
      setShareUrl(data.share_url);
      setShareStatus("ready");
    } catch (err) {
      setShareStatus("error");
      setShareError(err instanceof Error ? err.message : "Error inesperado.");
    }
  }

  async function copyShareLink() {
    if (!shareUrl) return;
    await navigator.clipboard?.writeText(shareUrl);
    setShareStatus("copied");
    window.setTimeout(() => setShareStatus("ready"), 1800);
  }

  return (
    <>
      
      <main className="surface-canvas min-h-screen pb-24">
        {/* Disclaimer */}
        <div className="border-b border-[var(--hairline)] bg-[var(--surface-2)]">
          <div className="reading-col px-6 py-3 flex items-center gap-2 text-[12px] text-[var(--text-secondary)]">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor: isPending
                  ? "var(--band-b-bar)"
                  : "var(--band-a-bar)",
              }}
            />
            <span>
              <span className="text-[var(--text-primary)] font-medium">
                {isPending
                  ? "En revisión humana"
                  : "Reporte publicado"}
              </span>{" "}
              · judge {payload.judge_model} · rúbrica {payload.rubric_version}
              {isPending &&
                " · este reporte tiene risk events que requieren confirmación del equipo Itera antes de publicarse al manager."}
            </span>
          </div>
        </div>

        {/* Header */}
        <section className="reading-col px-6 pt-14">
          <motion.div {...fadeUp}>
            <div className="eyebrow">Reporte ejecutivo · participante</div>
            <h1 className="display display-tight mt-5 text-[40px] sm:text-[52px] text-[var(--text-primary)]">
              Diagnóstico operativo.
            </h1>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-[13px] text-[var(--text-secondary)]">
              <Avatar
                size="sm"
                className="bg-[var(--surface-3)] text-[var(--text-primary)] text-[12px] font-semibold"
                name=" "
              />
              <span className="mono">
                {sessionId.slice(0, 8).toUpperCase()}
              </span>
              <span className="text-[var(--border-strong)]">·</span>
              <span>{evaluatedAtStr}</span>
              <span className="text-[var(--border-strong)]">·</span>
              <span>{payload.case_version}</span>
            </div>
          </motion.div>

          {/* Overall pull */}
          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.06 }}
            className="mt-12 card-apple bg-[var(--surface)] p-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-start gap-8">
              <div className="flex-shrink-0">
                <div className="eyebrow">Readiness general</div>
                <div className="display mt-3 text-[64px] text-[var(--text-primary)] leading-none">
                  {overallScore}
                  <span className="text-[var(--text-tertiary)] text-[28px] ml-1">
                    /100
                  </span>
                </div>
                <div className="mt-3">
                  <span
                    className={`text-[12px] font-semibold px-2.5 py-1 rounded-full ${bandTone(overallBand).bg} ${bandTone(overallBand).text}`}
                  >
                    Banda {BAND_DISPLAY[overallBand]}
                  </span>
                </div>
              </div>
              <div className="flex-1 pt-1">
                <p className="text-[16px] text-[var(--text-primary)] leading-[1.65]">
                  {capFirst(payload.recommendation.reason)}
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Dimensiones */}
        <section className="reading-col px-6 mt-20">
          <motion.div {...fadeUp}>
            <div className="eyebrow">Desempeño por dimensión</div>
            <h2 className="display mt-3 text-[28px] text-[var(--text-primary)]">
              Las cinco dimensiones
            </h2>
          </motion.div>

          <div className="mt-8 space-y-5">
            {DIMENSIONS.map((d, i) => {
              const band = (bands[d.id] ?? "M") as BandKey;
              const score = bandScore(band);
              const tone = bandTone(band);
              const dimRationale = payload.dimensions.find(
                (x) => x.id === d.id,
              )?.rationale;
              return (
                <motion.div
                  key={d.id}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: i * 0.04 }}
                  className="card-apple bg-[var(--surface)] p-6"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="text-[17px] font-semibold text-[var(--text-primary)]">
                          {capFirst(d.label)}
                        </span>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${tone.bg} ${tone.text}`}
                        >
                          Banda {BAND_DISPLAY[band]}
                        </span>
                      </div>
                      <p className="mt-2 text-[14px] text-[var(--text-secondary)] leading-[1.6]">
                        {capFirst(dimRationale ?? d.description)}
                      </p>
                    </div>
                    <span className="text-[20px] mono font-semibold text-[var(--text-primary)] flex-shrink-0">
                      {score}
                    </span>
                  </div>
                  <div className="mt-4 h-[5px] bg-[var(--surface-3)] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: tone.bar }}
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{
                        duration: 0.8,
                        delay: 0.15 + i * 0.04,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Gaps */}
        {payload.gaps.length > 0 && (
          <section className="reading-col px-6 mt-20">
            <motion.div {...fadeUp}>
              <div className="eyebrow">Gaps identificados</div>
              <h2 className="display mt-3 text-[28px] text-[var(--text-primary)]">
                Dónde se torció.
              </h2>
            </motion.div>

            <div className="mt-8 space-y-3">
              {payload.gaps.map((g, i) => {
                const tone = severityTone(g.severity);
                return (
                  <motion.div
                    key={g.id + i}
                    {...fadeUp}
                    transition={{ ...fadeUp.transition, delay: i * 0.05 }}
                    className="card-apple bg-[var(--surface)] p-6"
                  >
                    <div className="flex items-start gap-4">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 mt-1 ${tone.bg} ${tone.text}`}
                      >
                        Severidad {tone.label}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="eyebrow">Qué observamos</div>
                        <p className="mt-2 text-[15px] text-[var(--text-primary)] leading-[1.65]">
                          {capFirst(g.observed)}
                        </p>
                        <div className="eyebrow mt-5">Por qué importa</div>
                        <p className="mt-2 text-[14px] text-[var(--text-secondary)] leading-[1.65]">
                          {capFirst(g.why_matters)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* Risk events */}
        {payload.risk_events.length > 0 && (
          <section className="reading-col px-6 mt-20">
            <motion.div {...fadeUp}>
              <div className="eyebrow">Eventos de riesgo</div>
              <h2 className="display mt-3 text-[28px] text-[var(--text-primary)]">
                Momentos críticos en la sesión.
              </h2>
            </motion.div>

            <div className="mt-8 space-y-3">
              {payload.risk_events.map((e, i) => {
                const tone = severityTone(e.severity);
                return (
                  <motion.div
                    key={e.type + i}
                    {...fadeUp}
                    transition={{ ...fadeUp.transition, delay: i * 0.05 }}
                    className="card-apple bg-[var(--surface)] p-6"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="mono text-[12px] text-[var(--text-tertiary)] flex-shrink-0">
                          Paso {e.step_ordinal}
                        </span>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${tone.bg} ${tone.text}`}
                        >
                          {tone.label}
                        </span>
                        <span className="text-[14px] text-[var(--text-primary)] truncate">
                          {humanRiskType(e.type)}
                        </span>
                      </div>
                    </div>
                    <blockquote className="mt-4 pl-4 border-l-2 border-[var(--border)] text-[14px] text-[var(--text-secondary)] italic leading-[1.65]">
                      «
                      {capFirst(
                        redactSensitiveEvidence(e.evidence_text, e.severity),
                      )}
                      »
                    </blockquote>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* Fortalezas */}
        {payload.strengths.length > 0 && (
          <section className="reading-col px-6 mt-20">
            <motion.div {...fadeUp}>
              <div className="eyebrow">Fortalezas</div>
              <h2 className="display mt-3 text-[28px] text-[var(--text-primary)]">
                Qué hizo bien
              </h2>
            </motion.div>

            <ul className="mt-8 space-y-4">
              {payload.strengths.map((s, i) => (
                <motion.li
                  key={i}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: i * 0.04 }}
                  className="flex items-start gap-4"
                >
                  <span
                    className="flex-shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: "var(--accent)" }}
                  />
                  <p className="text-[15px] text-[var(--text-primary)] leading-[1.65]">
                    {capFirst(s)}
                  </p>
                </motion.li>
              ))}
            </ul>
          </section>
        )}

        {/* Recomendación */}
        <section className="reading-col px-6 mt-20">
          <motion.div
            {...fadeUp}
            className="card-apple p-8"
            style={{
              backgroundColor: "var(--accent-soft)",
              borderColor: "var(--accent)",
              borderWidth: 1,
            }}
          >
            <div className="eyebrow accent-text">Recomendación</div>
            <h2 className="display mt-3 text-[34px] text-[var(--text-primary)]">
              {capFirst(payload.recommendation.action)}.
            </h2>
            <p className="mt-3 text-[15px] text-[var(--text-secondary)]">
              {capFirst(payload.recommendation.applies_to)}
            </p>

            <div className="mt-7">
              <div className="eyebrow">Próximos 7 días</div>
              <ol className="mt-4 space-y-3">
                {payload.recommendation.next_week_actions.map((a, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span className="mono text-[13px] text-[var(--text-tertiary)] flex-shrink-0 mt-0.5 w-5">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="text-[15px] text-[var(--text-primary)] leading-[1.6]">
                      {capFirst(a)}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
            className="mt-10 flex flex-col sm:flex-row sm:flex-wrap gap-3"
          >
            <Button
              as={Link}
              href={`/api/sessions/${sessionId}/report/pdf`}
              radius="md"
              variant="bordered"
              size="lg"
              className="h-12 px-7 border-[var(--border-strong)] text-[var(--text-primary)] bg-[var(--surface)] text-[15px]"
            >
              Descargar PDF
            </Button>
            <Button
              radius="md"
              variant="bordered"
              size="lg"
              isLoading={shareStatus === "creating"}
              onPress={shareUrl ? copyShareLink : createShareLink}
              className="h-12 px-7 border-[var(--border-strong)] text-[var(--text-primary)] bg-[var(--surface)] text-[15px]"
            >
              {shareStatus === "copied"
                ? "Link copiado"
                : shareUrl
                  ? "Copiar link"
                  : "Generar link compartible"}
            </Button>
            <Button
              as={Link}
              href="/equipo"
              radius="md"
              size="lg"
              className="accent-bg text-white h-12 px-7 text-[15px] font-medium shadow-none"
            >
              Vista del manager →
            </Button>
            <Button
              as={Link}
              href="/"
              radius="md"
              variant="bordered"
              size="lg"
              className="h-12 px-7 border-[var(--border-strong)] text-[var(--text-primary)] bg-[var(--surface)] text-[15px]"
            >
              Volver a landing
            </Button>
          </motion.div>

          {(shareUrl || shareError) && (
            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.16 }}
              className="mt-5 card-apple bg-[var(--surface)] p-4"
            >
              {shareUrl ? (
                <>
                  <div className="eyebrow">Link compartible</div>
                  <p className="mt-2 break-all text-[13px] text-[var(--text-primary)] mono">
                    {shareUrl}
                  </p>
                  <p className="mt-2 text-[12px] text-[var(--text-secondary)]">
                    Válido por 30 días. Los eventos de riesgo alto se muestran
                    con datos sensibles anonimizados.
                  </p>
                </>
              ) : (
                <p className="text-[13px] text-[var(--band-b-text)]">
                  {shareError}
                </p>
              )}
            </motion.div>
          )}
        </section>

        {/* Meta footer */}
        <section className="reading-col px-6 mt-20">
          <div className="border-t border-[var(--hairline)] pt-6 flex flex-wrap gap-x-6 gap-y-2 text-[12px] text-[var(--text-tertiary)] mono">
            <span>Judge {payload.judge_model}</span>
            <span>·</span>
            <span>Rúbrica {payload.rubric_version}</span>
            <span>·</span>
            <span>Caso {payload.case_version}</span>
            <span>·</span>
            <span>Variante {payload.variant}</span>
            <span>·</span>
            <span>Eval {(payload.duration_ms / 1000).toFixed(1)}s</span>
          </div>
        </section>
      </main>
    </>
  );
}

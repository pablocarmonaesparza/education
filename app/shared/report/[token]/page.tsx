import { notFound } from "next/navigation";
import { SurfaceNav } from "@/components/simulador/SurfaceNav";
import { createAdminClient } from "@/lib/supabase/admin";
import { DIMENSIONS } from "@/lib/simulador/config";
import {
  BAND_DISPLAY,
  capFirst,
  computeOverall,
  dimensionsById,
  humanRiskType,
  redactSensitiveEvidence,
  severityLabel,
  shortenId,
  type ReportPayload,
} from "@/lib/simulador/reports/model";
import { hashReportShareToken } from "@/lib/simulador/reports/share-links";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function bandClass(band: string) {
  if (band === "A") return "bg-[var(--band-a-bg)] text-[var(--band-a-text)]";
  if (band === "M") return "bg-[var(--band-m-bg)] text-[var(--band-m-text)]";
  return "bg-[var(--band-b-bg)] text-[var(--band-b-text)]";
}

function severityClass(severity: string) {
  if (severity === "high")
    return "bg-[var(--band-b-bg)] text-[var(--band-b-text)]";
  if (severity === "medium")
    return "bg-[var(--band-m-bg)] text-[var(--band-m-text)]";
  return "bg-[var(--surface-3)] text-[var(--text-secondary)]";
}

export default async function SharedReportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const admin = createAdminClient();
  const tokenHash = hashReportShareToken(token);
  const now = new Date().toISOString();

  const { data: link } = await admin
    .schema("simulador")
    .from("report_share_links")
    .select("id, report_id, expires_at")
    .eq("token_hash", tokenHash)
    .is("revoked_at", null)
    .gt("expires_at", now)
    .maybeSingle();

  if (!link) notFound();

  const { data: report } = await admin
    .schema("simulador")
    .from("reports")
    .select("id, status, payload_json, generated_at, simulation_session_id")
    .eq("id", link.report_id)
    .in("status", ["published", "shared"])
    .maybeSingle();

  if (!report) notFound();

  await admin
    .schema("simulador")
    .from("report_share_links")
    .update({ last_accessed_at: now })
    .eq("id", link.id);

  const payload = report.payload_json as ReportPayload;
  const bands = dimensionsById(payload);
  const overall = computeOverall(payload);
  const generatedAt = report.generated_at
    ? new Date(report.generated_at).toISOString().slice(0, 10)
    : "—";

  return (
    <>
      <SurfaceNav />
      <main className="surface-canvas min-h-screen pb-24">
        <div className="border-b border-[var(--hairline)] bg-[var(--surface-2)]">
          <div className="reading-col px-6 py-3 text-[12px] text-[var(--text-secondary)]">
            <span className="font-medium text-[var(--text-primary)]">
              Link compartible
            </span>{" "}
            · vence el {new Date(link.expires_at).toISOString().slice(0, 10)}
            · evidencias de riesgo alto anonimizadas.
          </div>
        </div>

        <section className="reading-col px-6 pt-14">
          <div className="eyebrow">Reporte ejecutivo compartido</div>
          <h1 className="display display-tight mt-5 text-[40px] sm:text-[52px] text-[var(--text-primary)]">
            Diagnóstico operativo.
          </h1>
          <div className="mt-6 flex flex-wrap gap-3 text-[13px] text-[var(--text-secondary)]">
            <span className="mono">
              {shortenId(report.simulation_session_id ?? report.id)}
            </span>
            <span>·</span>
            <span>{generatedAt}</span>
            <span>·</span>
            <span>{payload.case_version}</span>
          </div>

          <div className="mt-12 card-apple bg-[var(--surface)] p-8">
            <div className="eyebrow">Recomendación</div>
            <h2 className="display mt-3 text-[34px] text-[var(--text-primary)]">
              {capFirst(payload.recommendation.action)}.
            </h2>
            <p className="mt-4 text-[16px] text-[var(--text-primary)] leading-[1.65]">
              {capFirst(payload.recommendation.reason)}
            </p>
            <div className="mt-6 flex items-center gap-3">
              <span className="mono text-[28px] font-semibold text-[var(--text-primary)]">
                {overall.score}/100
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${bandClass(
                  overall.band,
                )}`}
              >
                Banda {BAND_DISPLAY[overall.band]}
              </span>
            </div>
          </div>
        </section>

        <section className="reading-col px-6 mt-20">
          <div className="eyebrow">Desempeño por dimensión</div>
          <h2 className="display mt-3 text-[28px] text-[var(--text-primary)]">
            Las cinco dimensiones
          </h2>
          <div className="mt-8 space-y-4">
            {DIMENSIONS.map((dimension) => {
              const band = bands[dimension.id] ?? "M";
              const result = payload.dimensions.find(
                (item) => item.id === dimension.id,
              );
              return (
                <div
                  key={dimension.id}
                  className="card-apple bg-[var(--surface)] p-6"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[17px] font-semibold text-[var(--text-primary)]">
                      {capFirst(dimension.label)}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${bandClass(
                        band,
                      )}`}
                    >
                      Banda {BAND_DISPLAY[band]}
                    </span>
                  </div>
                  <p className="mt-3 text-[14px] leading-[1.6] text-[var(--text-secondary)]">
                    {capFirst(result?.rationale ?? dimension.description)}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {payload.risk_events.length > 0 && (
          <section className="reading-col px-6 mt-20">
            <div className="eyebrow">Eventos de riesgo</div>
            <h2 className="display mt-3 text-[28px] text-[var(--text-primary)]">
              Momentos críticos en la sesión.
            </h2>
            <div className="mt-8 space-y-3">
              {payload.risk_events.map((event, index) => (
                <div
                  key={`${event.type}-${index}`}
                  className="card-apple bg-[var(--surface)] p-6"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="mono text-[12px] text-[var(--text-tertiary)]">
                      Paso {event.step_ordinal}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${severityClass(
                        event.severity,
                      )}`}
                    >
                      {severityLabel(event.severity)}
                    </span>
                    <span className="text-[14px] text-[var(--text-primary)]">
                      {humanRiskType(event.type)}
                    </span>
                  </div>
                  <blockquote className="mt-4 border-l-2 border-[var(--border)] pl-4 text-[14px] italic leading-[1.65] text-[var(--text-secondary)]">
                    «
                    {capFirst(
                      redactSensitiveEvidence(
                        event.evidence_text,
                        event.severity,
                      ),
                    )}
                    »
                  </blockquote>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="reading-col px-6 mt-20">
          <div className="card-apple bg-[var(--surface)] p-8">
            <div className="eyebrow">Próximos 7 días</div>
            <ol className="mt-5 space-y-3">
              {payload.recommendation.next_week_actions.map((action, index) => (
                <li key={index} className="flex gap-4">
                  <span className="mono w-5 shrink-0 text-[13px] text-[var(--text-tertiary)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[15px] leading-[1.6] text-[var(--text-primary)]">
                    {capFirst(action)}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="reading-col px-6 mt-20">
          <div className="border-t border-[var(--hairline)] pt-6 text-[12px] text-[var(--text-tertiary)] mono">
            Judge {payload.judge_model} · Rúbrica {payload.rubric_version} ·
            Caso {payload.case_version} · Variante {payload.variant}
          </div>
        </section>
      </main>
    </>
  );
}

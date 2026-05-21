"use client";

/**
 * /team — Inicio del employee.
 *
 * Bento dashboard glance-friendly (sin scroll vertical):
 *   [Hero: avatar + greeting + nivel]
 *   [Mi performance] [Leaderboard] [Casos recomendados]
 *
 * Mock data — cuando se cablee BD se deriva de:
 *   - simulador.users.{full_name, metadata.job_title, avatar_url}
 *   - simulator_sessions agregadas (banda promedio, dim averages)
 *   - team_memberships JOIN sessions para leaderboard
 *   - case_recommendations algorítmico (level matching + department)
 */

import Link from "next/link";

// ============================================================================
// MOCK DATA
// ============================================================================

const USER = {
  fullName: "Ana López",
  initials: "AL",
  jobTitle: "Growth Manager",
  orgName: "Acme LATAM",
  currentLevel: "N2" as const, // Automatización
};

type Band = "A" | "M" | "B";
const BAND_LABEL: Record<Band, string> = { A: "Alta", M: "Media", B: "Baja" };

const PERFORMANCE = {
  averageBand: "M" as Band,
  casesCompleted: 4,
  casesInProgress: 1,
  dimensions: [
    { id: "contexto", label: "Contexto", score: 82 },
    { id: "datos", label: "Datos", score: 65 },
    { id: "ejecucion_ia", label: "Ejecución IA", score: 71 },
    { id: "validacion", label: "Validación", score: 58 },
    { id: "juicio", label: "Juicio", score: 79 },
    { id: "impacto", label: "Impacto", score: 68 },
  ],
};

interface LeaderboardEntry {
  name: string;
  initials: string;
  score: number;
  isCurrentUser?: boolean;
}

const LEADERBOARD: LeaderboardEntry[] = [
  { name: "Mariana Cortés", initials: "MC", score: 92 },
  { name: "Juan Esparza", initials: "JE", score: 87 },
  { name: "Ana López", initials: "AL", score: 78, isCurrentUser: true },
  { name: "Pedro Ruiz", initials: "PR", score: 74 },
  { name: "Sofía Martín", initials: "SM", score: 69 },
];

const RECOMMENDED = [
  {
    slug: "growth_attribution_anomaly",
    title: "Anomalía en atribución de ads",
    level: "Automatización",
    durationMin: 20,
    reason: "Match con tu nivel y departamento",
  },
  {
    slug: "growth_pricing_test",
    title: "Test de pricing en landing",
    level: "Automatización",
    durationMin: 18,
    reason: "Refuerza validación, tu dim más baja",
  },
  {
    slug: "marketing_competitor_response_agent",
    title: "Agente de respuesta a competencia",
    level: "Agentes",
    durationMin: 32,
    reason: "Salto a N3, listo si haces 2 más",
  },
  {
    slug: "ops_invoice_reconciliation",
    title: "Conciliación de facturas con IA",
    level: "Automatización",
    durationMin: 22,
    reason: "Tu equipo lo recomienda",
  },
  {
    slug: "cs_churn_signal_review",
    title: "Detección de churn con health score",
    level: "Automatización",
    durationMin: 25,
    reason: "Mariana lo completó con banda A",
  },
  {
    slug: "marketing_urgent_campaign_pii",
    title: "Campaña urgente con datos sensibles",
    level: "Fundamentos",
    durationMin: 18,
    reason: "Caso clásico de PII bajo presión",
  },
  {
    slug: "legal_contract_redline_assist",
    title: "Redline de contrato MSA con IA",
    level: "Automatización",
    durationMin: 28,
    reason: "Cross-functional, expande tu perfil",
  },
  {
    slug: "product_pricing_test_call",
    title: "Llamada de pricing test al PM",
    level: "Automatización",
    durationMin: 22,
    reason: "Stakeholder C-level + tradeoff claro",
  },
];

// ============================================================================
// COMPONENTS
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
      className={`rounded-[var(--radius-lg)] border border-[var(--hairline)] bg-[var(--surface)] p-5 ${className}`}
    >
      {children}
    </div>
  );
}

function CardHeader({
  eyebrow,
  cta,
}: {
  eyebrow: string;
  cta?: { label: string; href: string };
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
        {eyebrow}
      </span>
      {cta && (
        <Link
          href={cta.href}
          className="text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          {cta.label} →
        </Link>
      )}
    </div>
  );
}

function Avatar({
  initials,
  size = "md",
  ring = false,
}: {
  initials: string;
  size?: "sm" | "md" | "lg";
  ring?: boolean;
}) {
  const dimensions =
    size === "lg" ? "h-14 w-14 text-[16px]" : size === "md" ? "h-9 w-9 text-[12.5px]" : "h-7 w-7 text-[11px]";
  return (
    <div
      className={`${dimensions} flex items-center justify-center rounded-full bg-[var(--surface-2)] font-semibold text-[var(--text-primary)] tabular-nums ${
        ring ? "ring-2 ring-[var(--accent)]" : ""
      }`}
      aria-hidden
    >
      {initials}
    </div>
  );
}

function BandPill({ band }: { band: Band }) {
  const cls =
    band === "A"
      ? "bg-[var(--band-a-bg)] text-[var(--band-a-text)]"
      : band === "M"
        ? "bg-[var(--band-m-bg)] text-[var(--band-m-text)]"
        : "bg-[var(--band-b-bg)] text-[var(--band-b-text)]";
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${cls}`}
    >
      Banda {BAND_LABEL[band]}
    </span>
  );
}

// ============================================================================
// PAGE
// ============================================================================

export default function TeamHomePage() {
  return (
    <main className="surface-canvas h-[calc(100vh-3.5rem)] overflow-hidden px-6 py-6 sm:px-10 sm:py-8">
      <div className="mx-auto flex h-full w-full max-w-[1280px] flex-col gap-4">
        {/* ============ HERO ============ */}
        <header className="flex flex-none items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--hairline)] bg-[var(--surface)] p-5">
          <Avatar initials={USER.initials} size="lg" ring />
          <div className="min-w-0 flex-1">
            <h1 className="display display-tight text-[var(--text-primary)] text-[24px] sm:text-[28px] leading-tight">
              Hola, {USER.fullName.split(" ")[0]}
            </h1>
            <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
              {USER.jobTitle} · {USER.orgName} · Nivel actual:{" "}
              <span className="text-[var(--text-primary)] font-medium">
                Automatización
              </span>
            </p>
          </div>
          <Link
            href="/casos"
            className="hidden sm:inline-flex h-10 items-center justify-center rounded-[var(--radius-md)] accent-bg px-5 text-[13.5px] font-medium text-white hover:opacity-95 transition-opacity"
          >
            Ver catálogo
          </Link>
        </header>

        {/* ============ BENTO TOP: Performance + Leaderboard (2 cols) ============ */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 flex-none">
          {/* ---- Mi performance ---- */}
          <Card>
            <CardHeader
              eyebrow="Mi performance"
              cta={{ label: "Ver reporte", href: "/reportes" }}
            />
            <div className="mt-3 flex items-baseline gap-3">
              <BandPill band={PERFORMANCE.averageBand} />
              <span className="text-[11px] text-[var(--text-tertiary)]">
                promedio sobre {PERFORMANCE.casesCompleted} casos
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              {PERFORMANCE.dimensions.map((d) => (
                <div key={d.id} className="flex items-center gap-3">
                  <span className="w-[100px] flex-none truncate text-[12px] text-[var(--text-secondary)]">
                    {d.label}
                  </span>
                  <div className="flex-1 h-[6px] rounded-full bg-[var(--surface-2)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--accent)]"
                      style={{ width: `${d.score}%` }}
                    />
                  </div>
                  <span className="w-[28px] flex-none text-right text-[11.5px] font-medium tabular-nums text-[var(--text-primary)]">
                    {d.score}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* ---- Leaderboard ---- */}
          <Card>
            <CardHeader eyebrow="Leaderboard del equipo" />

            <ul className="mt-3 flex flex-col gap-1">
              {LEADERBOARD.map((entry, i) => (
                <li
                  key={entry.name}
                  className={`flex items-center gap-3 rounded-[var(--radius-md)] px-2 py-1.5 ${
                    entry.isCurrentUser ? "bg-[var(--accent-soft)]" : ""
                  }`}
                >
                  <span
                    className={`w-[16px] flex-none text-center text-[11px] font-semibold tabular-nums ${
                      entry.isCurrentUser
                        ? "text-[var(--accent)]"
                        : "text-[var(--text-tertiary)]"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <Avatar initials={entry.initials} size="sm" />
                  <span
                    className={`flex-1 truncate text-[12.5px] ${
                      entry.isCurrentUser
                        ? "font-semibold text-[var(--text-primary)]"
                        : "text-[var(--text-secondary)]"
                    }`}
                  >
                    {entry.name}
                    {entry.isCurrentUser && (
                      <span className="ml-1.5 text-[10px] text-[var(--accent)]">
                        Tú
                      </span>
                    )}
                  </span>
                  <span className="text-[12px] font-semibold tabular-nums text-[var(--text-primary)]">
                    {entry.score}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        {/* ============ BOTTOM: Casos para ti (4 cols × 2 filas) ============ */}
        <section className="flex flex-1 min-h-0 flex-col">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
              Casos para ti
            </span>
            <Link
              href="/casos"
              className="text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Ver todos →
            </Link>
          </div>

          <div className="mt-3 grid flex-1 min-h-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {RECOMMENDED.slice(0, 8).map((rec) => (
              <Link
                key={rec.slug}
                href={`/case/${rec.slug}`}
                className="group flex flex-col rounded-[var(--radius-md)] border border-[var(--hairline)] bg-[var(--surface)] p-3 transition-all hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]"
              >
                <div className="flex items-center gap-2 text-[10.5px]">
                  <span className="rounded-md bg-[var(--accent-soft)] px-1.5 py-0.5 font-semibold text-[var(--accent)]">
                    {rec.level}
                  </span>
                  <span className="text-[var(--text-tertiary)]">
                    {rec.durationMin} min
                  </span>
                </div>
                <h3 className="mt-2 text-[13.5px] font-semibold leading-[1.3] tracking-tight text-[var(--text-primary)] line-clamp-2">
                  {rec.title}
                </h3>
                <p className="mt-auto pt-2 text-[11px] leading-[1.4] text-[var(--text-tertiary)] line-clamp-2">
                  {rec.reason}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

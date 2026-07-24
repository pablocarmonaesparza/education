import { Fragment } from "react";
import type { Metadata } from "next";
import { PublicNav } from "@/components/simulador/PublicNav";
import { AppleButtonLink, AppleKpiCard, AppleTimeline } from "@/components/simulador/apple";
import type { AppleTimelineEvent } from "@/components/simulador/apple";
import { SIMULADOR_TIERS, YEARLY_DISCOUNT_PCT } from "@/lib/simulador/billing";
import { IBM_COST_DEMO_CLAIM, MARKET_STATS } from "@/lib/simulador/copy/market-stats";
import { loadAssembledCase } from "@/lib/simulador/load-assembled-case";
import { DemoScreensGallery, type GallerySlide } from "./DemoScreensGallery";

/**
 * /demo — el demo del COMPRADOR (manager/jefe). v2 tras feedback de Pablo:
 * "gráficas y widgets, no puro texto; secciones definidas; precios inline;
 * las pantallas del caso en scroll horizontal, no ir a buscarlas".
 *
 * Estructura: hero con widgets del equipo → reporte visual → matriz heatmap →
 * recomendaciones → GALERÍA de pantallas reales del caso → "The improvement"
 * (attempt 1 → práctica → resim → delta; LOOP_STEPS/LOOP_DELTA) → precios
 * (SIMULADOR_TIERS inline) → CTA. Datos de demostración curados de outputs
 * reales del judge. Pública, noindex.
 *
 * Idioma: inglés de EEUU (pivot 2026-07-15). El nav que corona esta página es
 * PublicNav — sus anchors (#how-it-works, #cases, #pricing) apuntan a ids que
 * viven AQUÍ; si cambian aquí, cambian allá.
 */

export const metadata: Metadata = {
  title: "Manager demo · Itera",
  description:
    "What you get as a manager: an executive report per person, the team matrix, operating recommendations, and continuous AI practice.",
  robots: { index: false, follow: false },
};

// ============================================================================
// Datos de demostración (curados de outputs reales del judge, anonimizados)
// ============================================================================

type Band = "A" | "M" | "B";

const BAND_LABEL: Record<Band, string> = { A: "High", M: "Medium", B: "Low" };
const BAND_STYLE: Record<Band, string> = {
  A: "bg-[var(--band-a-bg)] text-[var(--band-a-text)]",
  M: "bg-[var(--band-m-bg)] text-[var(--band-m-text)]",
  B: "bg-[var(--band-b-bg)] text-[var(--band-b-text)]",
};
const BAND_BAR: Record<Band, string> = {
  A: "var(--band-a-bar)",
  M: "var(--band-m-bar)",
  B: "var(--band-b-bar)",
};
// Ancho de barra por banda (score representativo 0-100 del sistema).
const BAND_WIDTH: Record<Band, number> = { A: 92, M: 75, B: 32 };

const REPORT_DIMENSIONS: Array<{ label: string; band: Band; note: string }> = [
  { label: "Context", band: "A", note: "Reframes the goal before acting: win back appointments without burning the list." },
  { label: "Data handling", band: "B", note: "Lets customer phone numbers and emails reach the model untransformed." },
  { label: "AI execution", band: "M", note: "Gives audience and tone, but never sets what to leave out." },
  { label: "Verification", band: "M", note: "Fixes the draft, but lets an unsourced number through." },
  { label: "Judgment", band: "A", note: "Escalates to Legal on the risk signal instead of shipping." },
  { label: "Impact", band: "M", note: "Defines the win-back metric, with no clear baseline." },
];

const REPORT_RISKS: Array<{ type: string; severity: "High" | "Medium"; evidence: string }> = [
  {
    type: "Personal data exposed to the model",
    severity: "High",
    evidence:
      "Includes customer phone numbers and emails in the prompt: “Customers: Paula R. <paula…@gmail.com, cell 415…>”. That is the Data handling gap.",
  },
  {
    type: "Unverified number",
    severity: "Medium",
    evidence:
      "Asks the model to claim that “their spend goes up 40% with us”, a number with no source.",
  },
];

const MATRIX = [
  { label: "Context", counts: { A: 4, M: 3, B: 1 } },
  { label: "Data handling", counts: { A: 2, M: 3, B: 3 } },
  { label: "AI execution", counts: { A: 3, M: 4, B: 1 } },
  { label: "Verification", counts: { A: 2, M: 4, B: 2 } },
  { label: "Judgment", counts: { A: 3, M: 3, B: 2 } },
  { label: "Impact", counts: { A: 2, M: 5, B: 1 } },
] as const;

const RECOMMENDATIONS = [
  { action: "Pilot", n: 2, tone: "A" as Band, meaning: "Can run AI solo, with a weekly check-in." },
  { action: "Coach", n: 4, tone: "M" as Band, meaning: "Partial judgment: targeted practice before autonomy." },
  { action: "Pause", n: 2, tone: "B" as Band, meaning: "Hold AI on sensitive flows until the gap closes." },
];

// Recorrido ILUSTRATIVO de la misma persona: intento 1 → práctica real → resim → delta.
// No es un histórico de un cliente; es cómo se ve cerrar el gap con el sistema.
const LOOP_STEPS: AppleTimelineEvent[] = [
  {
    when: "Attempt 1",
    what: "First run of the case: Data handling in the low band. Let customer phone numbers and emails reach the model untransformed.",
    who: "Gap found: data minimization (PII)",
  },
  {
    what: "Itera assigns the practice for the gap automatically: “Decide what the model sees: as-is, transformed, or nothing.”",
    when: "Practice",
    who: "6 min · 2 exercises · Data handling dimension, level 1",
  },
  {
    when: "Resim",
    what: "Runs the same case again. This time they block the contact fields and transform the address before uploading the file.",
    // Aquí decía literal `practice_datos_minimizacion_pii_v1`. AppleTimeline
    // renderiza `who` como TEXTO VISIBLE, así que el prospecto de EEUU leía el
    // slug interno en español. Los identificadores no se traducen (glosario §3),
    // pero se localizan en la capa de display — como aquí.
    who: "Same case, second run · data minimization practice completed",
  },
  {
    when: "Improvement",
    what: "Data handling moves from the low band to medium and the personal-data risk drops off the report.",
    who: "Manager action: from Coach to Pilot with supervision",
    emphasis: true,
  },
];

const LOOP_DELTA: Array<{
  label: string;
  value: string;
  delta: { value: string; direction: "up" | "down" };
}> = [
  { label: "Data handling · the gap dimension", value: "Medium", delta: { value: "up from Low", direction: "up" } },
  { label: "Judgment score", value: "72/100", delta: { value: "+14 vs. attempt 1", direction: "up" } },
  { label: "Personal-data risks", value: "0", delta: { value: "−2 after the practice", direction: "down" } },
];

// Pantallas del caso para la galería (las visualmente ricas).
const GALLERY_SLIDE_IDS = [
  "contexto-3",
  "contexto-4",
  "datos-1",
  "datos-3",
  "ia-3",
  "revision-2",
  "cierre-5",
];

// ============================================================================
// Widgets (SVG/CSS puros, tokens del sistema)
// ============================================================================

function Donut({ value, total, label }: { value: number; total: number; label: string }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const pct = value / total;
  return (
    <div className="flex items-center gap-4">
      <svg width="76" height="76" viewBox="0 0 76 76" role="img" aria-label={label}>
        <circle cx="38" cy="38" r={r} fill="none" stroke="var(--surface-3)" strokeWidth="8" />
        <circle
          cx="38"
          cy="38"
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${c * pct} ${c}`}
          transform="rotate(-90 38 38)"
        />
        <text
          x="38"
          y="43"
          textAnchor="middle"
          fill="var(--text-primary)"
          fontSize="17"
          fontWeight="600"
        >
          {value}/{total}
        </text>
      </svg>
      <div className="ts-footnote leading-[1.4] text-[var(--text-secondary)]">{label}</div>
    </div>
  );
}

function Bar({ band, width }: { band: Band; width: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-3)]">
      <div
        className="h-full rounded-full"
        style={{ width: `${width}%`, backgroundColor: BAND_BAR[band] }}
      />
    </div>
  );
}

function BandPill({ band }: { band: Band }) {
  return (
    <span
      className={`inline-flex flex-none items-center rounded-[var(--radius-sm)] px-2 py-0.5 ts-caption-1 font-semibold ${BAND_STYLE[band]}`}
    >
      {BAND_LABEL[band]}
    </span>
  );
}

function SectionHead({
  step,
  title,
  body,
  center,
}: {
  step: string;
  title: string;
  body: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <span className="inline-flex items-center rounded-full bg-[var(--accent-soft)] px-3 py-1 ts-caption-1 font-semibold text-[var(--accent)]">
        {step}
      </span>
      <h2 className="display mt-4 ts-title-1 sm:ts-display text-[var(--text-primary)]">
        {title}
      </h2>
      <p className="mt-3 ts-body leading-[1.55] text-[var(--text-secondary)]">{body}</p>
    </div>
  );
}

// ============================================================================
// Página
// ============================================================================

export default function ManagerDemoPage() {
  // Pantallas reales del caso, del registro estático (mismo contenido que prod).
  const playable = loadAssembledCase("marketing_dirty_data_relaunch");
  const gallerySlides: GallerySlide[] = [];
  if (playable) {
    for (const section of playable.sections) {
      for (const slide of section.slides) {
        if (GALLERY_SLIDE_IDS.includes(slide.slideId)) {
          gallerySlides.push({
            slideId: slide.slideId,
            blockId: slide.blockId,
            title: slide.title,
            section: section.name,
            caseContext: slide.caseContext,
          });
        }
      }
    }
    gallerySlides.sort(
      (a, b) => GALLERY_SLIDE_IDS.indexOf(a.slideId) - GALLERY_SLIDE_IDS.indexOf(b.slideId),
    );
  }

  return (
    <div className="simulador-root min-h-screen surface-canvas text-[var(--text-primary)]">
      <PublicNav />
      <main>
        {/* ============ HERO + WIDGETS DEL EQUIPO ============ */}
        <section className="mx-auto max-w-5xl px-6 pt-16 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-2)] px-3 py-1 ts-caption-1 text-[var(--text-secondary)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              Manager demo · illustrative examples in the product&apos;s real format
            </span>
            <h1 className="display display-tight mt-6 ts-display sm:ts-display-xl">
              Here is what you get on your team
            </h1>
            {/* Decía "You see who decides well with AI, WHO IS A RISK, and what to
                do with each one". Es la contradicción producto-vs-legal más seria
                del pivot: caracteriza a un empleado como riesgo, mientras
                legal.ts:123 promete "Itera is not a selection procedure... we do
                not rank participants against each other". El GC del comprador lee
                eso y pregunta por qué compró una herramienta que clasifica gente.
                El riesgo lo corre el FLUJO, no la persona. */}
            <p className="mx-auto mt-5 max-w-xl ts-body-lg leading-[1.5] text-[var(--text-secondary)]">
              Your team runs 15-minute work cases. You see where the judgment is
              solid, where the gaps are, and what each person needs next.
            </p>
          </div>

          {/* widgets del equipo demo */}
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-[var(--radius-lg)] bg-[var(--surface-2)] p-5">
              <Donut value={6} total={8} label="of the team has completed the assessment" />
            </div>
            <div className="rounded-[var(--radius-lg)] bg-[var(--surface-2)] p-5">
              <div className="flex items-baseline justify-between">
                <span className="ts-caption-1 font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
                  Team readiness
                </span>
                <span className="ts-title-2 font-semibold tabular-nums">64<span className="ts-caption-1 text-[var(--text-tertiary)]">/100</span></span>
              </div>
              <div className="mt-3">
                <Bar band="M" width={64} />
              </div>
              <div className="mt-2 ts-caption-1 text-[var(--text-tertiary)]">
                2 in the high band · 4 medium · 2 low
              </div>
            </div>
            <div className="rounded-[var(--radius-lg)] bg-[var(--surface-2)] p-5">
              <span className="ts-caption-1 font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
                Risks found
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="ts-display font-semibold tabular-nums text-[var(--band-b-text)]">11</span>
                <span className="ts-caption-1 text-[var(--text-tertiary)]">3 high severity</span>
              </div>
              <div className="mt-2 flex gap-1.5">
                <span className="rounded-[var(--radius-xs)] bg-[var(--band-b-bg)] px-2 py-0.5 ts-caption-2 font-medium text-[var(--band-b-text)]">PII to the model</span>
                <span className="rounded-[var(--radius-xs)] bg-[var(--band-m-bg)] px-2 py-0.5 ts-caption-2 font-medium text-[var(--band-m-text)]">Unsourced numbers</span>
              </div>
            </div>
          </div>
        </section>

        {/* ============ STRIP · LA PARTE QUE NO VES (canvas) ============ */}
        {/* Stats del MERCADO (fuente única: lib/simulador/copy/market-stats.ts,
            máx 3 por superficie, cada figura con su fuente visible). Mismo
            patrón visual que los widgets del hero de arriba. */}
        <section className="mx-auto max-w-5xl px-6 mt-16 sm:mt-20">
          <p className="mx-auto max-w-2xl text-center ts-body leading-[1.55] text-[var(--text-secondary)]">
            Before the report: the numbers on what teams do with AI when nobody
            is measuring.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { stat: MARKET_STATS.KPMG_HIDE, claim: MARKET_STATS.KPMG_HIDE.claim },
              { stat: MARKET_STATS.VERIZON_ACCOUNTS, claim: MARKET_STATS.VERIZON_ACCOUNTS.claim },
              // IBM usa la variante que une las dos cifras del mismo reporte
              // (20% de las brechas + ~$670K extra por brecha).
              { stat: MARKET_STATS.IBM_COST, claim: IBM_COST_DEMO_CLAIM },
            ].map(({ stat, claim }) => (
              <div key={stat.id} className="rounded-[var(--radius-lg)] bg-[var(--surface-2)] p-5">
                <span className="ts-title-2 font-semibold tabular-nums">{stat.figure}</span>
                <p className="mt-1.5 ts-footnote leading-[1.45] text-[var(--text-secondary)]">
                  {claim}
                </p>
                <p className="mt-2 ts-caption-2 leading-[1.4] text-[var(--text-tertiary)]">
                  {stat.source}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ============ 1 · REPORTE (tinted) ============ */}
        <section id="how-it-works" className="surface-tinted mt-20 py-16 sm:mt-24 sm:py-20">
          <div className="mx-auto max-w-5xl px-6">
            <SectionHead
              step="1 · The assessment"
              title="An executive report for every person"
              body="Six dimensions with evidence cited from the case, plus an operating recommendation. An illustrative example in the evaluator's real format and output, not a customer's report."
            />

            <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr]">
              {/* dimensiones con barras */}
              <div className="rounded-[var(--radius-lg)] bg-[var(--surface)] p-6 shadow-[0_2px_12px_var(--shadow)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="ts-headline font-semibold">Participant D. · Marketing</div>
                    <div className="mt-0.5 ts-caption-1 text-[var(--text-tertiary)]">
                      Case: appointment win-back · 14 min
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-[var(--radius-sm)] bg-[var(--band-m-bg)] px-3 py-1 ts-callout font-semibold text-[var(--band-m-text)]">
                    Coach
                  </span>
                </div>
                <div className="mt-6 flex flex-col gap-4">
                  {REPORT_DIMENSIONS.map((d) => (
                    <div key={d.label}>
                      <div className="flex items-center justify-between gap-3">
                        <span className="ts-callout font-medium">{d.label}</span>
                        <BandPill band={d.band} />
                      </div>
                      <div className="mt-1.5">
                        <Bar band={d.band} width={BAND_WIDTH[d.band]} />
                      </div>
                      <p className="mt-1 ts-caption-1 text-[var(--text-tertiary)]">{d.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* riesgos con evidencia */}
              <div className="flex flex-col gap-3">
                <span className="ts-caption-1 font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
                  Risks, with cited evidence
                </span>
                {REPORT_RISKS.map((r) => (
                  <div
                    key={r.type}
                    className="rounded-[var(--radius-md)] bg-[var(--surface)] p-4 shadow-[0_1px_4px_var(--shadow)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="ts-callout font-semibold">{r.type}</span>
                      <span
                        className={`flex-none rounded-[var(--radius-xs)] px-2 py-0.5 ts-caption-2 font-semibold ${
                          r.severity === "High"
                            ? "bg-[var(--band-b-bg)] text-[var(--band-b-text)]"
                            : "bg-[var(--band-m-bg)] text-[var(--band-m-text)]"
                        }`}
                      >
                        {r.severity}
                      </span>
                    </div>
                    <p className="mt-1.5 ts-footnote leading-[1.55] text-[var(--text-secondary)]">
                      {r.evidence}
                    </p>
                  </div>
                ))}
                <p className="ts-caption-1 leading-[1.5] text-[var(--text-tertiary)]">
                  Good judgment overall, with Context and Judgment in the high
                  band, but a specific gap in Data handling with a high risk
                  attached. That is why this is not Pilot yet: close the gap with
                  targeted practice first, then resimulate.
                </p>
                {/* Stat de mercado (IBM_COST, market-stats.ts) — fuente en
                    tooltip title=. Conecta los risk events del reporte con lo
                    que aparece después en los breach reports. */}
                <p
                  className="ts-caption-1 leading-[1.5] text-[var(--text-tertiary)]"
                  title={MARKET_STATS.IBM_COST.source}
                >
                  Risk events like these are exactly what shows up later in
                  breach reports — shadow AI is involved in 20% of breaches.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============ 2 · MATRIZ (canvas) ============ */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-6">
            <SectionHead
              step="2 · The analysis"
              title="Your team's matrix"
              body="Eight people, six dimensions, at a glance. The shared gap is obvious: 3 people in the low band on Data handling."
            />
            <div className="mt-10 overflow-x-auto">
              <div className="min-w-[520px] rounded-[var(--radius-lg)] bg-[var(--surface-2)] p-6">
                <div className="grid grid-cols-[130px_1fr_1fr_1fr] items-center gap-2">
                  <div />
                  {(["A", "M", "B"] as Band[]).map((b) => (
                    <div key={b} className="text-center ts-caption-1 font-semibold" style={{ color: BAND_BAR[b] }}>
                      {BAND_LABEL[b]}
                    </div>
                  ))}
                  {MATRIX.map((row) => (
                    <Fragment key={row.label}>
                      <div className="ts-callout font-medium py-1.5">{row.label}</div>
                      {(["A", "M", "B"] as Band[]).map((b) => {
                        const n = row.counts[b];
                        const intensity = n / 8;
                        return (
                          <div
                            key={`${row.label}-${b}`}
                            className="flex h-11 items-center justify-center rounded-[var(--radius-sm)] ts-callout font-semibold tabular-nums"
                            style={{
                              backgroundColor: n > 0 ? BAND_BAR[b] : "var(--surface-3)",
                              opacity: n > 0 ? 0.25 + intensity * 0.75 : 0.6,
                              color: n > 0 ? "var(--text-primary)" : "var(--text-disabled)",
                            }}
                          >
                            {n || "·"}
                          </div>
                        );
                      })}
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ 3 · RECOMENDACIONES (tinted) ============ */}
        <section className="surface-tinted py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-6">
            <SectionHead
              step="3 · The decision"
              title="What to do with each person"
              body="Not a vanity score: a management action. Autonomy, practice, or a hold."
            />
            {/* barra apilada del equipo */}
            <div className="mt-10">
              <div className="flex h-4 w-full overflow-hidden rounded-full">
                {RECOMMENDATIONS.map((r) => (
                  <div
                    key={r.action}
                    style={{ width: `${(r.n / 8) * 100}%`, backgroundColor: BAND_BAR[r.tone] }}
                  />
                ))}
              </div>
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {RECOMMENDATIONS.map((r) => (
                  <div key={r.action} className="rounded-[var(--radius-lg)] bg-[var(--surface)] p-5 shadow-[0_1px_4px_var(--shadow)]">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center rounded-[var(--radius-sm)] px-2.5 py-1 ts-callout font-semibold ${BAND_STYLE[r.tone]}`}>
                        {r.action}
                      </span>
                      <span className="ts-title-2 font-semibold tabular-nums">{r.n}</span>
                    </div>
                    <p className="mt-3 ts-footnote leading-[1.5] text-[var(--text-secondary)]">{r.meaning}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============ 4 · GALERÍA DE PANTALLAS (canvas) ============ */}
        <section id="cases" className="py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-6">
            <SectionHead
              step="4 · The case your team lives"
              title="The actual screens"
              body="These are real screens from the case, rendered by the product: the dirty list, the pressure from Legal, the AI copilot, the review, and the final decision."
            />
          </div>
          <div className="mx-auto mt-10 max-w-6xl px-6">
            {gallerySlides.length > 0 && <DemoScreensGallery slides={gallerySlides} />}
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <AppleButtonLink href="/case-demo" tone="secondary" className="px-6 h-11">
                Play the full case
              </AppleButtonLink>
              <AppleButtonLink href="/aprender-demo" tone="ghost" className="px-4 h-11">
                Try a practice →
              </AppleButtonLink>
            </div>
          </div>
        </section>

        {/* ============ 5 · EL LOOP: MISMA PERSONA, MEJORA (tinted) ============ */}
        <section className="surface-tinted py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-6">
            <SectionHead
              step="5 · The improvement"
              title="The same person, after practice"
              body="An illustrative run generated with the system, not a real customer history: this is how Participant D. closes their Data handling gap, from the first attempt to the resim. The assessment finds the gap, the practice closes it, and the resim proves it."
            />

            <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1fr]">
              {/* el recorrido, paso a paso */}
              <div className="rounded-[var(--radius-lg)] bg-[var(--surface)] p-6 shadow-[0_2px_12px_var(--shadow)]">
                <span className="ts-caption-1 font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
                  The loop, step by step
                </span>
                <div className="mt-5">
                  <AppleTimeline events={LOOP_STEPS} />
                </div>
              </div>

              {/* el delta visible */}
              <div className="flex flex-col gap-4">
                <span className="ts-caption-1 font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
                  The delta, measured in the report
                </span>
                {/* la dimensión del gap, antes → después */}
                <div className="rounded-[var(--radius-lg)] bg-[var(--surface)] p-5 shadow-[0_1px_4px_var(--shadow)]">
                  <div className="ts-callout font-medium">Data handling · before → after</div>
                  <div className="mt-4 flex items-center gap-3">
                    <BandPill band="B" />
                    <div className="flex-1"><Bar band="B" width={BAND_WIDTH.B} /></div>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <BandPill band="M" />
                    <div className="flex-1"><Bar band="M" width={BAND_WIDTH.M} /></div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  {LOOP_DELTA.map((k) => (
                    <AppleKpiCard key={k.label} label={k.label} value={k.value} delta={k.delta} />
                  ))}
                </div>
              </div>
            </div>

            <p className="mt-6 ts-footnote leading-[1.5] text-[var(--text-tertiary)]">
              That loop is the product: Itera proves behavior change instead of
              bolting an assessment onto microlearning as two disconnected products. Every
              AI update becomes a new practice inside the subscription.
            </p>
          </div>
        </section>

        {/* ============ 6 · PRECIOS INLINE (canvas) ============ */}
        <section id="pricing" className="py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-6">
            <SectionHead
              center
              step="6 · The price"
              title="Per seat, no surprises"
              body={`Monthly or annual (annual: ${YEARLY_DISCOUNT_PCT}% off, 2 months free). USD via Stripe. Cancel anytime and keep access through the end of the period.`}
            />
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {SIMULADOR_TIERS.map((tier) => (
                <div key={tier.id} className="rounded-[var(--radius-lg)] bg-[var(--surface-2)] p-5">
                  <div className="ts-callout font-semibold">{tier.label}</div>
                  <div className="mt-2 ts-title-2 font-semibold tabular-nums">
                    ${tier.pricePerSeatUsd}
                    <span className="ts-footnote font-medium text-[var(--text-tertiary)]"> /seat/month</span>
                  </div>
                  <div className="mt-2 ts-caption-1 text-[var(--text-tertiary)]">
                    {tier.maxSeats ? `${tier.minSeats}–${tier.maxSeats} seats` : `${tier.minSeats}+ seats`}
                    {!tier.selfServe && " · contact sales"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ CTA FINAL (tinted) ============ */}
        <section className="surface-tinted py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="display ts-title-1 sm:ts-display">Start with your team this week</h2>
            <p className="mx-auto mt-4 max-w-xl ts-body text-[var(--text-secondary)]">
              First full team assessment in days. Every person&apos;s report, the
              matrix, and ongoing practice, from the first sprint.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <AppleButtonLink
                href="/auth/signup?next=%2Fonboarding%2Forg"
                tone="primary"
                className="px-7 h-12"
              >
                Start with my team
              </AppleButtonLink>
              <AppleButtonLink href="/case-demo" tone="secondary" className="px-7 h-12">
                Play the demo
              </AppleButtonLink>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

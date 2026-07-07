import { Fragment } from "react";
import type { Metadata } from "next";
import { PublicNav } from "@/components/simulador/PublicNav";
import { AppleButtonLink } from "@/components/simulador/apple";
import { SIMULADOR_TIERS, YEARLY_DISCOUNT_PCT } from "@/lib/simulador/billing";
import { loadAssembledCase } from "@/lib/simulador/load-assembled-case";
import { DemoScreensGallery, type GallerySlide } from "./DemoScreensGallery";

/**
 * /demo — el demo del COMPRADOR (manager/jefe). v2 tras feedback de Pablo:
 * "gráficas y widgets, no puro texto; secciones definidas; precios inline;
 * las pantallas del caso en scroll horizontal, no ir a buscarlas".
 *
 * Estructura: hero con widgets del equipo → reporte visual → matriz heatmap →
 * recomendaciones → GALERÍA de pantallas reales del caso → capacitación con
 * cobertura → precios (SIMULADOR_TIERS inline) → CTA. Datos de demostración
 * curados de outputs reales del judge. Pública, noindex.
 */

export const metadata: Metadata = {
  title: "Demo para managers · Itera",
  description:
    "Lo que recibes como manager: reporte ejecutivo por persona, matriz del equipo, recomendaciones operativas y capacitación continua en IA.",
  robots: { index: false, follow: false },
};

// ============================================================================
// Datos de demostración (curados de outputs reales del judge, anonimizados)
// ============================================================================

type Band = "A" | "M" | "B";

const BAND_LABEL: Record<Band, string> = { A: "Alto", M: "Medio", B: "Bajo" };
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
  { label: "Contexto", band: "B", note: "No demuestra comprensión del objetivo antes de ejecutar." },
  { label: "Datos", band: "B", note: "Decide que un dato de salud vaya al modelo sin transformar." },
  { label: "Ejecución IA", band: "B", note: "Pide sin objetivo, audiencia ni límites definidos." },
  { label: "Validación", band: "B", note: "No marca ningún segmento incorrecto en el borrador." },
  { label: "Juicio", band: "B", note: "Lanza sin escalar pese a las señales de riesgo." },
  { label: "Impacto", band: "B", note: "Sin métrica ni resultado verificable para el negocio." },
];

const REPORT_RISKS: Array<{ type: string; severity: "Alto" | "Medio"; evidence: string }> = [
  {
    type: "Dato personal expuesto al modelo",
    severity: "Alto",
    evidence:
      "Incluye teléfono y correo de pacientes en el prompt: “Clientes: Paola R. <paola…@gmail.com, tel 310…>”",
  },
  {
    type: "Dato sensible sin transformar",
    severity: "Alto",
    evidence:
      "Decide que el campo “condición” (dato de salud) vaya al modelo sin transformar, violando la política de datos.",
  },
  {
    type: "Ignoró la ruta de escalamiento",
    severity: "Alto",
    evidence:
      "Decide “lanzamos el lunes como pediste, la base va como llegó”, ignorando la alerta de Legal.",
  },
  {
    type: "Cifra sin verificar",
    severity: "Medio",
    evidence:
      "Solicita al modelo decir que “sus compras suben 40% con nosotros”, cifra sin ninguna fuente.",
  },
];

const MATRIX = [
  { label: "Contexto", counts: { A: 4, M: 3, B: 1 } },
  { label: "Datos", counts: { A: 2, M: 3, B: 3 } },
  { label: "Ejecución IA", counts: { A: 3, M: 4, B: 1 } },
  { label: "Validación", counts: { A: 2, M: 4, B: 2 } },
  { label: "Juicio", counts: { A: 3, M: 3, B: 2 } },
  { label: "Impacto", counts: { A: 2, M: 5, B: 1 } },
] as const;

const RECOMMENDATIONS = [
  { action: "Pilotar", n: 2, tone: "A" as Band, meaning: "Operan con IA de forma autónoma, con supervisión semanal." },
  { action: "Entrenar", n: 4, tone: "M" as Band, meaning: "Criterio parcial: práctica dirigida antes de autonomía." },
  { action: "Pausar", n: 2, tone: "B" as Band, meaning: "Sin IA en flujos sensibles hasta remediar el gap." },
];

const TRAINING = [
  {
    title: "Con Fable 5 cambia cuánto le delegas, no si lo revisas",
    topic: "Claude Fable 5 · nuevo modelo",
    done: 6,
    total: 8,
  },
  {
    title: "Conecta poco, revisa todo lo que sale",
    topic: "Conectores de IA · Drive, correo, CRM",
    done: 5,
    total: 8,
  },
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
              Demo para managers · datos generados por el sistema real
            </span>
            <h1 className="display display-tight mt-6 ts-display sm:ts-display-xl">
              Esto es lo que recibes de tu equipo.
            </h1>
            <p className="mx-auto mt-5 max-w-xl ts-body-lg leading-[1.5] text-[var(--text-secondary)]">
              Tu equipo juega casos de trabajo de 15 minutos. Tú ves quién decide
              bien con IA, quién es un riesgo, y qué hacer con cada uno.
            </p>
          </div>

          {/* widgets del equipo demo */}
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-[var(--radius-lg)] bg-[var(--surface-2)] p-5">
              <Donut value={6} total={8} label="del equipo ya completó su diagnóstico" />
            </div>
            <div className="rounded-[var(--radius-lg)] bg-[var(--surface-2)] p-5">
              <div className="flex items-baseline justify-between">
                <span className="ts-caption-1 font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
                  Readiness del equipo
                </span>
                <span className="ts-title-2 font-semibold tabular-nums">64<span className="ts-caption-1 text-[var(--text-tertiary)]">/100</span></span>
              </div>
              <div className="mt-3">
                <Bar band="M" width={64} />
              </div>
              <div className="mt-2 ts-caption-1 text-[var(--text-tertiary)]">
                2 en banda alta · 4 media · 2 baja
              </div>
            </div>
            <div className="rounded-[var(--radius-lg)] bg-[var(--surface-2)] p-5">
              <span className="ts-caption-1 font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
                Riesgos detectados
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="ts-display font-semibold tabular-nums text-[var(--band-b-text)]">11</span>
                <span className="ts-caption-1 text-[var(--text-tertiary)]">3 de severidad alta</span>
              </div>
              <div className="mt-2 flex gap-1.5">
                <span className="rounded-[var(--radius-xs)] bg-[var(--band-b-bg)] px-2 py-0.5 ts-caption-2 font-medium text-[var(--band-b-text)]">PII al modelo</span>
                <span className="rounded-[var(--radius-xs)] bg-[var(--band-m-bg)] px-2 py-0.5 ts-caption-2 font-medium text-[var(--band-m-text)]">Cifras sin fuente</span>
              </div>
            </div>
          </div>
        </section>

        {/* ============ 1 · REPORTE (tinted) ============ */}
        <section className="surface-tinted mt-20 py-16 sm:mt-24 sm:py-20">
          <div className="mx-auto max-w-5xl px-6">
            <SectionHead
              step="1 · La evaluación"
              title="Un reporte ejecutivo por persona"
              body="Seis dimensiones con evidencia citada del caso y una recomendación operativa. Este es un reporte real del evaluador, anonimizado."
            />

            <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr]">
              {/* dimensiones con barras */}
              <div className="rounded-[var(--radius-lg)] bg-[var(--surface)] p-6 shadow-[0_2px_12px_var(--shadow)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="ts-headline font-semibold">Participante D. · Marketing</div>
                    <div className="mt-0.5 ts-caption-1 text-[var(--text-tertiary)]">
                      Caso: reactivación de citas · 14 min
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-[var(--radius-sm)] bg-[var(--band-b-bg)] px-3 py-1 ts-callout font-semibold text-[var(--band-b-text)]">
                    Pausar
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
                  Riesgos, con evidencia citada
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
                          r.severity === "Alto"
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
                  Un riesgo alto siempre baja la autonomía recomendada, por regla
                  determinista. No importa qué tan bien suene el resto.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============ 2 · MATRIZ (canvas) ============ */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-6">
            <SectionHead
              step="2 · El análisis"
              title="La matriz de tu equipo"
              body="Ocho personas, seis dimensiones, de un vistazo. El gap compartido salta solo: 3 personas en banda baja en Datos."
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
              step="3 · La decisión"
              title="Qué hacer con cada persona"
              body="No un score decorativo: una acción de management. Autonomía, práctica o freno."
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
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-6">
            <SectionHead
              step="4 · El caso que vive tu equipo"
              title="Las pantallas, tal cual son"
              body="Estas son pantallas reales del caso, renderizadas por el producto: la base sucia, la presión de Legal, el copiloto de IA, la revisión y la decisión final."
            />
          </div>
          <div className="mx-auto mt-10 max-w-6xl px-6">
            {gallerySlides.length > 0 && <DemoScreensGallery slides={gallerySlides} />}
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <AppleButtonLink href="/case-demo" tone="secondary" className="px-6 h-11">
                Jugar el caso completo
              </AppleButtonLink>
              <AppleButtonLink href="/aprender-demo" tone="ghost" className="px-4 h-11">
                Probar un módulo de capacitación →
              </AppleButtonLink>
            </div>
          </div>
        </section>

        {/* ============ 5 · CAPACITACIÓN (tinted) ============ */}
        <section className="surface-tinted py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-6">
            <SectionHead
              step="5 · La capacitación continua"
              title="Cada update de IA, convertido en práctica"
              body="La IA cambia todas las semanas. Cada update relevante se vuelve un módulo de 6 minutos para todo tu equipo, dentro de la suscripción. Tú ves la cobertura."
            />
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {TRAINING.map((m) => (
                <div key={m.title} className="rounded-[var(--radius-lg)] bg-[var(--surface)] p-5 shadow-[0_1px_4px_var(--shadow)]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center rounded-[var(--radius-sm)] bg-[var(--accent-soft)] px-2 py-0.5 ts-caption-1 font-semibold text-[var(--accent)]">
                      Nuevo esta semana
                    </span>
                    <span className="ts-caption-1 text-[var(--text-tertiary)]">6 min</span>
                  </div>
                  <h3 className="mt-3 ts-headline font-semibold leading-[1.3]">{m.title}</h3>
                  <div className="mt-1 ts-caption-1 text-[var(--text-tertiary)]">{m.topic}</div>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--surface-3)]">
                      <div
                        className="h-full rounded-full bg-[var(--band-a-bar)]"
                        style={{ width: `${(m.done / m.total) * 100}%` }}
                      />
                    </div>
                    <span className="ts-caption-1 font-medium tabular-nums text-[var(--text-secondary)]">
                      {m.done}/{m.total} del equipo
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 ts-footnote text-[var(--text-tertiary)]">
              El examen encuentra el gap; el curso lo cierra; el siguiente diagnóstico lo comprueba.
            </p>
          </div>
        </section>

        {/* ============ 6 · PRECIOS INLINE (canvas) ============ */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-6">
            <SectionHead
              center
              step="6 · El precio"
              title="Por persona, sin sorpresas"
              body={`Mensual o anual (anual: ${YEARLY_DISCOUNT_PCT}% de descuento, 2 meses gratis). USD vía Stripe. Cancelas cuando quieras y conservas acceso hasta el fin del período.`}
            />
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {SIMULADOR_TIERS.map((tier) => (
                <div key={tier.id} className="rounded-[var(--radius-lg)] bg-[var(--surface-2)] p-5">
                  <div className="ts-callout font-semibold">{tier.label}</div>
                  <div className="mt-2 ts-title-2 font-semibold tabular-nums">
                    ${tier.pricePerSeatUsd}
                    <span className="ts-footnote font-medium text-[var(--text-tertiary)]"> /persona/mes</span>
                  </div>
                  <div className="mt-2 ts-caption-1 text-[var(--text-tertiary)]">
                    {tier.maxSeats ? `${tier.minSeats}–${tier.maxSeats} personas` : `${tier.minSeats}+ personas`}
                    {!tier.selfServe && " · contacto"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ CTA FINAL (tinted) ============ */}
        <section className="surface-tinted py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="display ts-title-1 sm:ts-display">Empieza con tu equipo esta semana.</h2>
            <p className="mx-auto mt-4 max-w-xl ts-body text-[var(--text-secondary)]">
              Primer diagnóstico completo del equipo en días. El reporte de cada
              persona, la matriz y la capacitación, desde el primer sprint.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <AppleButtonLink
                href="/auth/signup?next=%2Fonboarding%2Forg"
                tone="primary"
                className="px-7 h-12"
              >
                Empezar con mi equipo
              </AppleButtonLink>
              <AppleButtonLink href="/case-demo" tone="secondary" className="px-7 h-12">
                Jugar el demo
              </AppleButtonLink>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

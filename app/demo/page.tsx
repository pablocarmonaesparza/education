import { Fragment } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { PublicNav } from "@/components/simulador/PublicNav";
import { AppleButtonLink } from "@/components/simulador/apple";

/**
 * /demo — el demo del COMPRADOR (manager/jefe), pedido de Pablo 2026-07-06:
 * "no solo vea el producto, sino los RESULTADOS del producto".
 *
 * Una URL pública que se manda al prospecto por email/WhatsApp. No juega nada:
 * ve lo que RECIBE como manager — el reporte ejecutivo por persona, la matriz
 * del equipo, las recomendaciones operativas y la cobertura de capacitación.
 * Al final, los demos jugables (la vista del empleado) y el CTA de compra.
 *
 * Los datos son de demostración pero CURADOS DE OUTPUTS REALES del judge
 * (sesiones de QA de F2): la evidencia citada, las bandas y las recomendaciones
 * son literalmente lo que el sistema produjo. Nombres anonimizados.
 *
 * Pública en prod, noindex (robots.ts + metadata).
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

const REPORT_DIMENSIONS: Array<{ id: string; label: string; band: Band; note: string }> = [
  { id: "contexto", label: "Contexto", band: "B", note: "No demuestra comprensión del objetivo antes de ejecutar." },
  { id: "datos", label: "Datos", band: "B", note: "Decide que un dato de salud vaya al modelo sin transformar." },
  { id: "ejecucion_ia", label: "Ejecución IA", band: "B", note: "Pide sin objetivo, audiencia ni límites definidos." },
  { id: "validacion", label: "Validación", band: "B", note: "No marca ningún segmento incorrecto en el primer borrador." },
  { id: "juicio", label: "Juicio", band: "B", note: "Lanza sin escalar pese a las señales de riesgo." },
  { id: "impacto", label: "Impacto", band: "B", note: "Sin métrica ni resultado verificable para el negocio." },
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
      "Decide “lanzamos el lunes como pediste, la base va como llegó para no perder tiempo”, ignorando la alerta de Legal.",
  },
  {
    type: "Cifra sin verificar",
    severity: "Medio",
    evidence:
      "Solicita al modelo decir que “sus compras suben 40% con nosotros”, cifra no respaldada por ninguna fuente.",
  },
];

const MATRIX_DIMENSIONS = [
  { label: "Contexto", counts: { A: 4, M: 3, B: 1 } },
  { label: "Datos", counts: { A: 2, M: 3, B: 3 } },
  { label: "Ejecución IA", counts: { A: 3, M: 4, B: 1 } },
  { label: "Validación", counts: { A: 2, M: 4, B: 2 } },
  { label: "Juicio", counts: { A: 3, M: 3, B: 2 } },
  { label: "Impacto", counts: { A: 2, M: 5, B: 1 } },
] as const;

const RECOMMENDATIONS: Array<{
  action: string;
  tone: string;
  people: string;
  meaning: string;
}> = [
  {
    action: "Pilotar",
    tone: "bg-[var(--band-a-bg)] text-[var(--band-a-text)]",
    people: "2 personas",
    meaning: "Operan con IA de forma autónoma en su scope, con supervisión semanal.",
  },
  {
    action: "Entrenar",
    tone: "bg-[var(--accent-soft)] text-[var(--accent)]",
    people: "4 personas",
    meaning: "Criterio parcial: práctica dirigida antes de soltarles autonomía.",
  },
  {
    action: "Pausar",
    tone: "bg-[var(--band-b-bg)] text-[var(--band-b-text)]",
    people: "2 personas",
    meaning: "No deben usar IA en flujos sensibles hasta remediar el gap.",
  },
];

const TRAINING_MODULES = [
  {
    title: "Con Fable 5 cambia cuánto le delegas por tramo, no si lo revisas",
    topic: "Claude Fable 5 (la familia Claude 5)",
    coverage: "6 de 8 completaron",
  },
  {
    title: "Conecta poco, revisa todo lo que sale",
    topic: "Conectores de inteligencia artificial",
    coverage: "5 de 8 completaron",
  },
];

// ============================================================================
// Atoms locales (tokens del design system; sin contornos en cards)
// ============================================================================

function BandPill({ band }: { band: Band }) {
  return (
    <span
      className={`inline-flex flex-none items-center rounded-[var(--radius-sm)] px-2 py-0.5 ts-caption-1 font-semibold ${BAND_STYLE[band]}`}
    >
      {BAND_LABEL[band]}
    </span>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="ts-caption-1 font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
      {children}
    </span>
  );
}

function SectionHeader({
  step,
  title,
  body,
}: {
  step: string;
  title: string;
  body: string;
}) {
  return (
    <div className="max-w-2xl">
      <Eyebrow>{step}</Eyebrow>
      <h2 className="mt-2 display ts-title-1 sm:ts-display text-[var(--text-primary)]">
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
  return (
    <div className="simulador-root min-h-screen surface-canvas text-[var(--text-primary)]">
      <PublicNav />
      <main className="pb-24">
        {/* ============ HERO ============ */}
        <section className="mx-auto max-w-3xl px-6 pt-16 text-center sm:pt-24">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-2)] px-3 py-1 ts-caption-1 text-[var(--text-secondary)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            Demo para managers · datos de demostración generados por el sistema real
          </span>
          <h1 className="display display-tight mt-6 ts-display sm:ts-display-xl">
            Esto es lo que recibes de tu equipo.
          </h1>
          <p className="mx-auto mt-5 max-w-xl ts-body-lg leading-[1.5] text-[var(--text-secondary)]">
            Tu equipo juega casos de trabajo reales de 15 minutos. Tú recibes esto:
            quién decide bien con IA, quién es un riesgo, y qué hacer con cada uno.
          </p>
        </section>

        {/* ============ 1 · REPORTE EJECUTIVO ============ */}
        <section className="mx-auto mt-20 max-w-4xl px-6 sm:mt-28">
          <SectionHeader
            step="1 · La evaluación"
            title="Un reporte ejecutivo por persona"
            body="Seis dimensiones de criterio con evidencia citada del caso, los riesgos que cometió, y una recomendación operativa. Este es un reporte real generado por el evaluador (anonimizado)."
          />

          <div className="mt-8 rounded-[var(--radius-lg)] bg-[var(--surface-2)] p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="ts-headline font-semibold">Participante D. — Marketing</div>
                <div className="mt-0.5 ts-caption-1 text-[var(--text-tertiary)]">
                  Caso: reactivación de citas · 25 pantallas · 14 min
                </div>
              </div>
              <span className="inline-flex items-center rounded-[var(--radius-sm)] bg-[var(--band-b-bg)] px-3 py-1 ts-callout font-semibold text-[var(--band-b-text)]">
                Recomendación: Pausar
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {REPORT_DIMENSIONS.map((d) => (
                <div
                  key={d.id}
                  className="flex items-start justify-between gap-3 rounded-[var(--radius-md)] bg-[var(--surface)] p-4"
                >
                  <div className="min-w-0">
                    <div className="ts-callout font-semibold">{d.label}</div>
                    <p className="mt-1 ts-footnote leading-[1.5] text-[var(--text-secondary)]">
                      {d.note}
                    </p>
                  </div>
                  <BandPill band={d.band} />
                </div>
              ))}
            </div>

            <div className="mt-6">
              <Eyebrow>Riesgos detectados, con evidencia citada</Eyebrow>
              <div className="mt-3 flex flex-col gap-2">
                {REPORT_RISKS.map((r) => (
                  <div
                    key={r.type}
                    className="rounded-[var(--radius-md)] bg-[var(--surface)] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="ts-callout font-semibold">{r.type}</span>
                      <span
                        className={`ts-caption-1 font-semibold ${
                          r.severity === "Alto"
                            ? "text-[var(--band-b-text)]"
                            : "text-[var(--band-m-text)]"
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
              </div>
            </div>

            <p className="mt-6 ts-footnote leading-[1.55] text-[var(--text-tertiary)]">
              La recomendación no la inventa nadie: la produce el evaluador con reglas
              deterministas. Un riesgo alto siempre baja la autonomía, sin importar qué
              tan bien suene el resto.
            </p>
          </div>
        </section>

        {/* ============ 2 · LA MATRIZ ============ */}
        <section className="mx-auto mt-20 max-w-4xl px-6 sm:mt-28">
          <SectionHeader
            step="2 · El análisis"
            title="La matriz de tu equipo"
            body="Ocho personas evaluadas, seis dimensiones. De un vistazo: dónde está fuerte tu equipo y qué dimensión es el riesgo compartido."
          />

          <div className="mt-8 overflow-x-auto rounded-[var(--radius-lg)] bg-[var(--surface-2)] p-6">
            <div className="min-w-[480px]">
              <div className="grid grid-cols-[140px_1fr_1fr_1fr] gap-2">
                <div />
                <div className="text-center ts-caption-1 font-semibold text-[var(--band-a-text)]">Alto</div>
                <div className="text-center ts-caption-1 font-semibold text-[var(--band-m-text)]">Medio</div>
                <div className="text-center ts-caption-1 font-semibold text-[var(--band-b-text)]">Bajo</div>
                {MATRIX_DIMENSIONS.map((row) => (
                  <Fragment key={row.label}>
                    <div className="ts-callout font-medium py-2">{row.label}</div>
                    {(["A", "M", "B"] as Band[]).map((b) => {
                      const n = row.counts[b];
                      return (
                        <div
                          key={`${row.label}-${b}`}
                          className={`flex items-center justify-center rounded-[var(--radius-sm)] py-2 ts-callout font-semibold tabular-nums ${
                            n > 0 ? BAND_STYLE[b] : "bg-[var(--surface)] text-[var(--text-disabled)]"
                          }`}
                        >
                          {n}
                        </div>
                      );
                    })}
                  </Fragment>
                ))}
              </div>
            </div>
            <p className="mt-4 ts-footnote text-[var(--text-tertiary)]">
              Lectura de ejemplo: 3 personas están en banda Baja en Datos — el gap
              compartido del equipo es el manejo de información sensible con IA.
            </p>
          </div>
        </section>

        {/* ============ 3 · RECOMENDACIONES ============ */}
        <section className="mx-auto mt-20 max-w-4xl px-6 sm:mt-28">
          <SectionHeader
            step="3 · La decisión"
            title="Qué hacer con cada persona"
            body="No un score decorativo: una acción de management por persona. Autonomía para quien la sostiene, práctica para quien la necesita, freno para quien es un riesgo."
          />

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {RECOMMENDATIONS.map((r) => (
              <div key={r.action} className="rounded-[var(--radius-lg)] bg-[var(--surface-2)] p-5">
                <span
                  className={`inline-flex items-center rounded-[var(--radius-sm)] px-2.5 py-1 ts-callout font-semibold ${r.tone}`}
                >
                  {r.action}
                </span>
                <div className="mt-3 ts-title-3 font-semibold tabular-nums">{r.people}</div>
                <p className="mt-2 ts-footnote leading-[1.55] text-[var(--text-secondary)]">
                  {r.meaning}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ============ 4 · CAPACITACIÓN CONTINUA ============ */}
        <section className="mx-auto mt-20 max-w-4xl px-6 sm:mt-28">
          <SectionHeader
            step="4 · La capacitación continua"
            title="Cada update de IA, convertido en práctica"
            body="La IA cambia todas las semanas. Cada update relevante se vuelve un módulo de 6 minutos para todo tu equipo, dentro de la suscripción — y tú ves quién lo completó."
          />

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {TRAINING_MODULES.map((m) => (
              <div key={m.title} className="rounded-[var(--radius-lg)] bg-[var(--surface-2)] p-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center rounded-[var(--radius-sm)] bg-[var(--accent-soft)] px-2 py-0.5 ts-caption-1 font-semibold text-[var(--accent)]">
                    Nuevo esta semana
                  </span>
                  <span className="ts-caption-1 text-[var(--text-tertiary)]">6 min</span>
                </div>
                <h3 className="mt-3 ts-headline font-semibold leading-[1.3]">{m.title}</h3>
                <div className="mt-2 ts-caption-1 text-[var(--text-tertiary)]">{m.topic}</div>
                <div className="mt-4 ts-footnote font-medium text-[var(--band-a-text)]">
                  {m.coverage}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 ts-footnote text-[var(--text-tertiary)]">
            Además, la evaluación desbloquea práctica dirigida a los gaps de cada persona.
            El examen encuentra el gap; el curso lo cierra; el siguiente diagnóstico lo
            comprueba.
          </p>
        </section>

        {/* ============ 5 · LO QUE VIVE TU EQUIPO ============ */}
        <section className="mx-auto mt-20 max-w-4xl px-6 sm:mt-28">
          <SectionHeader
            step="5 · La experiencia de tu equipo"
            title="Míralo desde su asiento"
            body="Dos demos jugables, sin registro. Lo que tu equipo vive: un caso de trabajo real bajo presión, y un módulo de capacitación con feedback."
          />
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link
              href="/case-demo"
              className="group rounded-[var(--radius-lg)] bg-[var(--surface-2)] p-6 transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_16px_var(--shadow)]"
            >
              <Eyebrow>Demo · el caso vivo</Eyebrow>
              <h3 className="mt-2 ts-headline font-semibold">
                Juega el caso que evalúa el criterio
              </h3>
              <p className="mt-2 ts-footnote leading-[1.55] text-[var(--text-secondary)]">
                15 minutos: datos sucios, presión de la jefa, decisiones de IA. Termina
                con el reporte que tú recibirías.
              </p>
              <span className="mt-4 inline-block ts-callout font-medium text-[var(--accent)]">
                Jugar el caso →
              </span>
            </Link>
            <Link
              href="/aprender-demo"
              className="group rounded-[var(--radius-lg)] bg-[var(--surface-2)] p-6 transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_16px_var(--shadow)]"
            >
              <Eyebrow>Demo · la capacitación</Eyebrow>
              <h3 className="mt-2 ts-headline font-semibold">
                Practica el módulo de Fable 5
              </h3>
              <p className="mt-2 ts-footnote leading-[1.55] text-[var(--text-secondary)]">
                6 minutos: el modelo nuevo de Anthropic, qué delegarle y qué revisar,
                con feedback en cada decisión.
              </p>
              <span className="mt-4 inline-block ts-callout font-medium text-[var(--accent)]">
                Probar el módulo →
              </span>
            </Link>
          </div>
        </section>

        {/* ============ CTA FINAL ============ */}
        <section className="mx-auto mt-20 max-w-3xl px-6 text-center sm:mt-28">
          <h2 className="display ts-title-1 sm:ts-display">
            Empieza con tu equipo esta semana.
          </h2>
          <p className="mx-auto mt-4 max-w-xl ts-body text-[var(--text-secondary)]">
            Por asiento, desde $109 USD al mes. Primer diagnóstico completo del equipo en
            días, no trimestres. Cancelas cuando quieras.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <AppleButtonLink
              href="/auth/signup?next=%2Fonboarding%2Forg"
              tone="primary"
              className="px-7 h-12"
            >
              Empezar con mi equipo
            </AppleButtonLink>
            <AppleButtonLink href="/#precio" tone="secondary" className="px-7 h-12">
              Ver precios
            </AppleButtonLink>
          </div>
        </section>
      </main>
    </div>
  );
}

import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  AppleBadge,
  AppleButton,
  AppleCard,
  AppleCardBody,
  AppleIcon,
  AppleProgress,
  AppleStepDots,
} from "@/components/simulador/apple";

export const metadata: Metadata = {
  title: "exercise lab | Itera",
  description: "Demo interno de ejercicios por seccion para simulaciones Itera.",
  robots: {
    index: false,
    follow: false,
  },
};

const caseSteps = [
  { id: "contexto", label: "Contexto", status: "completed" as const },
  { id: "datos", label: "Datos", status: "completed" as const },
  { id: "ia", label: "IA", status: "current" as const },
  { id: "revision", label: "Revision", status: "pending" as const },
  { id: "decision", label: "Decision", status: "pending" as const },
  { id: "respuesta", label: "Respuesta", status: "pending" as const },
];

const dataRows = [
  {
    field: "Nombre del contacto",
    sample: "Mariana Robles",
    action: "mascarar",
    note: "identificador personal",
  },
  {
    field: "Empresa",
    sample: "Aurora SaaS",
    action: "usar",
    note: "contexto comercial",
  },
  {
    field: "Email",
    sample: "mariana@aurora.example",
    action: "excluir",
    note: "no aporta señal",
  },
  {
    field: "Tickets recientes",
    sample: "12 conversaciones",
    action: "resumir",
    note: "usar patrones, no texto crudo",
  },
  {
    field: "ARR",
    sample: "$84,000",
    action: "rango",
    note: "suficiente para priorizar",
  },
];

const outputLines = [
  {
    text: "Aurora SaaS puede reducir churn 40% en 30 dias con nuestro agente.",
    flag: "claim no verificado",
    tone: "danger" as const,
  },
  {
    text: "La propuesta se enviara a mariana@aurora.example antes de legal.",
    flag: "dato personal + aprobacion faltante",
    tone: "danger" as const,
  },
  {
    text: "Recomendamos iniciar con un piloto interno y aprobacion humana.",
    flag: "usable",
    tone: "success" as const,
  },
];

const decisionOptions = [
  {
    title: "Lanzar hoy",
    risk: "alto",
    detail: "Maxima velocidad, pero publica claims y datos sin validacion.",
    tone: "danger" as const,
  },
  {
    title: "Piloto con aprobacion",
    risk: "controlado",
    detail: "Mantiene avance, exige revision legal y medicion clara.",
    tone: "success" as const,
    selected: true,
  },
  {
    title: "Solo uso interno",
    risk: "medio",
    detail: "Reduce exposicion, pero no prueba impacto con clientes.",
    tone: "warning" as const,
  },
  {
    title: "Pausar",
    risk: "bajo",
    detail: "Evita riesgo inmediato, pero no genera aprendizaje operativo.",
    tone: "neutral" as const,
  },
];

export default function ExerciseLabPage() {
  return (
    <main className="simulador-root min-h-screen surface-canvas">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-6 md:py-12">
        <header className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
          <div className="max-w-4xl">
            <AppleBadge tone="neutral">laboratorio interno</AppleBadge>
            <h1 className="display mt-5 text-[3rem] leading-[1.02] md:text-[4.5rem]">
              Ejercicios por sección.
            </h1>
            <p className="mt-5 max-w-[62ch] text-[1.0625rem] leading-7 text-[var(--text-secondary)]">
              Un caso completo mostrado como lo viviria el participante: seis secciones, seis ejercicios y evidencia clara para el manager.
            </p>
          </div>

          <AppleCard variant="elevated" padding="lg" className="border-[var(--border)]">
            <p className="text-[0.8125rem] font-medium text-[var(--text-tertiary)]">
              caso demo
            </p>
            <h2 className="mt-2 text-[1.375rem] font-semibold tracking-[-0.022em] text-[var(--text-primary)]">
              Campaña urgente con datos sensibles
            </h2>
            <div className="mt-6">
              <AppleStepDots steps={caseSteps} />
            </div>
          </AppleCard>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <MiniMetric label="duracion estimada" value="18 min" />
          <MiniMetric label="mix de ejercicios" value="70% IA" />
          <MiniMetric label="evidencia emitida" value="6 señales" />
        </div>

        <div className="grid gap-6">
          <ExerciseSection
            id="contexto"
            number="1"
            title="Contexto"
            subtitle="Entender la situacion, la audiencia y que decision necesita el manager."
          >
            <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <AppleCard variant="default" padding="md" className="border-[var(--border)]">
                <p className="text-[0.8125rem] font-medium text-[var(--text-tertiary)]">
                  mensaje recibido
                </p>
                <p className="mt-3 text-[1rem] leading-7 text-[var(--text-primary)]">
                  “Necesito una campaña para enterprise antes de las 5. Usa los tickets, el CRM y lo que tengamos. El VP quiere ver algo hoy.”
                </p>
              </AppleCard>

              <div className="grid gap-4">
                <HigField
                  label="Que decision debe poder tomar el manager?"
                  defaultValue="Si podemos lanzar un piloto externo o solo un borrador interno."
                />
                <HigField
                  label="Audiencia"
                  defaultValue="VP de Marketing + Legal como aprobador"
                />
                <HigTextarea
                  label="Restriccion principal"
                  minRows={3}
                  defaultValue="No usar datos personales ni claims de performance sin fuente verificable."
                />
              </div>
            </div>
          </ExerciseSection>

          <ExerciseSection
            id="datos"
            number="2"
            title="Datos"
            subtitle="Elegir que informacion entra a IA, que se transforma y que se excluye."
          >
            <AppleCard variant="default" padding="none" className="overflow-hidden border-[var(--border)]">
              <div className="grid grid-cols-[1.1fr_1fr_0.8fr_1.1fr] border-b border-[var(--hairline)] bg-[var(--surface-2)] px-4 py-3 text-[0.75rem] font-semibold uppercase tracking-[0.05em] text-[var(--text-tertiary)]">
                <span>campo</span>
                <span>muestra</span>
                <span>accion</span>
                <span>razon</span>
              </div>
              {dataRows.map((row) => (
                <div
                  key={row.field}
                  className="grid grid-cols-[1.1fr_1fr_0.8fr_1.1fr] items-center gap-3 border-b border-[var(--hairline)] px-4 py-4 last:border-b-0"
                >
                  <span className="text-[0.9375rem] font-medium text-[var(--text-primary)]">
                    {row.field}
                  </span>
                  <span className="text-[0.875rem] text-[var(--text-secondary)]">{row.sample}</span>
                  <AppleBadge tone={row.action === "excluir" ? "danger" : row.action === "usar" ? "success" : "warning"}>
                    {row.action}
                  </AppleBadge>
                  <span className="text-[0.875rem] leading-5 text-[var(--text-secondary)]">
                    {row.note}
                  </span>
                </div>
              ))}
            </AppleCard>
          </ExerciseSection>

          <ExerciseSection
            id="ia"
            number="3"
            title="IA"
            subtitle="Configurar la instruccion correcta antes de pedirle trabajo al modelo."
          >
            <div className="grid gap-5 lg:grid-cols-[1fr_0.95fr]">
              <div className="grid gap-4">
                <HigField label="Objetivo" defaultValue="Crear primer borrador de campaña enterprise" />
                <HigField label="Contexto que si puede usar" defaultValue="sector, dolor principal, resumen agregado de tickets" />
                <HigField label="Limites" defaultValue="sin PII, sin descuentos, sin claims no verificados" />
                <HigField label="Formato esperado" defaultValue="3 asuntos + 1 email + checklist de aprobacion" />
                <AppleButton className="w-fit" tone="primary">
                  enviar a IA
                </AppleButton>
              </div>
              <AppleCard variant="default" padding="md" className="border-[var(--border)] bg-[var(--surface-2)]">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <AppleBadge tone="accent">prompt preview</AppleBadge>
                  <AppleBadge tone="neutral">temp 0</AppleBadge>
                </div>
                <p className="text-[0.9375rem] leading-7 text-[var(--text-primary)]">
                  Actua como marketer B2B. Crea un borrador de campaña enterprise usando solo contexto agregado. No uses datos personales, descuentos ni metricas sin fuente. Devuelve asuntos, email y checklist de aprobacion.
                </p>
              </AppleCard>
            </div>
          </ExerciseSection>

          <ExerciseSection
            id="revision"
            number="4"
            title="Revisión"
            subtitle="Detectar errores, claims debiles, datos sensibles o partes reutilizables del output."
          >
            <div className="grid gap-4">
              {outputLines.map((line, index) => (
                <label
                  key={line.text}
                  className="grid cursor-pointer gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4 md:grid-cols-[2rem_minmax(0,1fr)_auto] md:items-start"
                >
                  <input
                    defaultChecked={index < 2}
                    type="checkbox"
                    className="mt-1 h-5 w-5 rounded border-[var(--border)] accent-[var(--accent)]"
                    aria-label={`marcar linea ${index + 1}`}
                  />
                  <span className="text-[0.9375rem] leading-6 text-[var(--text-primary)]">
                    {line.text}
                  </span>
                  <AppleBadge tone={line.tone}>{line.flag}</AppleBadge>
                </label>
              ))}
              <HigTextarea
                label="Correccion que pedirias a IA"
                minRows={3}
                defaultValue="Reescribe sin prometer resultados cuantificados, elimina emails/personas y agrega aprobacion legal antes de uso externo."
              />
            </div>
          </ExerciseSection>

          <ExerciseSection
            id="decision"
            number="5"
            title="Decisión"
            subtitle="Elegir una accion con consecuencias reales, no solo la respuesta mas obvia."
          >
            <div className="grid gap-3 md:grid-cols-2">
              {decisionOptions.map((option) => (
                <label
                  key={option.title}
                  className="cursor-pointer rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:bg-[var(--surface-2)]"
                >
                  <div className="flex items-start gap-3">
                    <input
                      name="decision"
                      defaultChecked={option.selected}
                      type="radio"
                      className="mt-1 h-5 w-5 accent-[var(--accent)]"
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-[var(--text-primary)]">{option.title}</span>
                        <AppleBadge tone={option.tone}>{option.risk}</AppleBadge>
                      </div>
                      <p className="mt-2 text-[0.875rem] leading-5 text-[var(--text-secondary)]">
                        {option.detail}
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </ExerciseSection>

          <ExerciseSection
            id="respuesta"
            number="6"
            title="Respuesta"
            subtitle="Explicar al manager que se haria, por que y con que evidencia."
          >
            <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
              <HigTextarea
                label="Respuesta al manager"
                minRows={8}
                defaultValue={`Recomiendo piloto con aprobacion humana, no lanzamiento directo.\n\nMotivo: el output inicial incluye un claim no verificable y datos personales que no deben entrar a una campaña externa. Podemos avanzar hoy si limitamos el uso a borrador interno, eliminamos PII, pedimos fuente para cualquier metrica y dejamos Legal como aprobador antes de envio.\n\nSiguiente paso: generar version limpia, validar claims y revisar con Legal antes de las 5.`}
              />
              <AppleCard variant="elevated" padding="md" className="border-[var(--border)]">
                <p className="text-[0.8125rem] font-medium text-[var(--text-tertiary)]">
                  evidencia para reporte
                </p>
                <div className="mt-5 grid gap-4">
                  <EvidenceMetric label="contexto" value={82} />
                  <EvidenceMetric label="datos" value={74} />
                  <EvidenceMetric label="validacion" value={88} />
                </div>
                <div className="mt-5 rounded-[var(--radius-md)] bg-[var(--band-m-bg)] p-3">
                  <p className="text-[0.8125rem] leading-5 text-[var(--band-m-text)]">
                    recomendacion: entrenar en minimizacion de datos antes de permitir automatizacion externa.
                  </p>
                </div>
              </AppleCard>
            </div>
          </ExerciseSection>
        </div>
      </section>
    </main>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <AppleCard variant="default" padding="md" className="border-[var(--border)]">
      <p className="text-[0.8125rem] font-medium text-[var(--text-tertiary)]">{label}</p>
      <p className="mt-2 text-[1.375rem] font-semibold tracking-[-0.022em] text-[var(--text-primary)]">
        {value}
      </p>
    </AppleCard>
  );
}

function ExerciseSection({
  id,
  number,
  title,
  subtitle,
  children,
}: {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-8">
      <AppleCard variant="default" padding="none" className="border-[var(--border)]">
        <AppleCardBody className="grid gap-6 p-5 md:p-7">
          <div className="grid gap-4 lg:grid-cols-[14rem_minmax(0,1fr)] lg:items-start">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)] text-[0.9375rem] font-semibold text-white">
                  {number}
                </span>
                <AppleBadge tone="neutral">seccion</AppleBadge>
              </div>
              <h2 className="mt-4 text-[2rem] font-semibold tracking-[-0.022em] text-[var(--text-primary)]">
                {title}
              </h2>
              <p className="mt-2 text-[0.9375rem] leading-6 text-[var(--text-secondary)]">
                {subtitle}
              </p>
            </div>
            <div className="min-w-0">{children}</div>
          </div>
        </AppleCardBody>
      </AppleCard>
    </section>
  );
}

function HigField({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <label className="grid gap-2">
      <span className="text-[0.8125rem] font-medium text-[var(--text-secondary)]">
        {label}
      </span>
      <input
        defaultValue={defaultValue}
        className="min-h-11 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 text-[0.9375rem] text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)]"
      />
    </label>
  );
}

function HigTextarea({
  label,
  defaultValue,
  minRows = 4,
}: {
  label: string;
  defaultValue: string;
  minRows?: number;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-[0.8125rem] font-medium text-[var(--text-secondary)]">
        {label}
      </span>
      <textarea
        defaultValue={defaultValue}
        rows={minRows}
        className="resize-none rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-[0.9375rem] leading-6 text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)]"
      />
    </label>
  );
}

function EvidenceMetric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-[0.875rem] text-[var(--text-secondary)]">{label}</span>
        <span className="text-[0.875rem] font-medium text-[var(--text-primary)]">{value}%</span>
      </div>
      <AppleProgress value={value} aria-label={label} />
    </div>
  );
}

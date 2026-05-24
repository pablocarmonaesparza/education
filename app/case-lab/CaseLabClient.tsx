"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AppleButton,
  AppleCard,
  AppleCardBody,
} from "@/components/simulador/apple";

type CaseLevel = "N1" | "N2" | "N3";
type ReviewState = "PASS" | "CONDICIONAL" | "PENDIENTE";

type LaunchCase = {
  id: string;
  title: string;
  shortTitle: string;
  level: CaseLevel;
  profile: string;
  estimatedMinutes: number;
  freshness: "70% vigente" | "60% vigente" | "50% vigente";
  state: ReviewState;
  managerBrief: string;
  managerQuestion: string;
  moment: string;
  businessSignal: string;
  tools: string[];
  exercises: string[];
  dimensions: string[];
  risks: string[];
  primary: string;
  resim: string;
  sections: Array<{
    name: string;
    exercise: string;
    evidence: string;
  }>;
};

const launchCases: LaunchCase[] = [
  {
    id: "sales-agent-followup",
    title: "Seguimiento comercial con agente de ventas",
    shortTitle: "Agente de ventas",
    level: "N3",
    profile: "Ventas",
    estimatedMinutes: 30,
    freshness: "70% vigente",
    state: "CONDICIONAL",
    managerBrief:
      "Asigna este caso cuando quieras saber si el equipo puede delegar seguimiento comercial a un agente sin filtrar datos sensibles, inventar señales de compra o perder control humano.",
    managerQuestion:
      "Puede operar un agente de seguimiento sin comprometer privacidad ni calidad comercial?",
    moment:
      "Un equipo B2B necesita reactivar oportunidades frías antes del cierre mensual.",
    businessSignal:
      "Mide si la persona diseña límites, revisa logs y decide cuándo escalar a humano.",
    tools: ["CRM", "Gmail", "Agente IA", "Modelo corporativo"],
    exercises: [
      "Tabla de datos",
      "Brief para agente",
      "Revisión de logs",
      "Decisión con tradeoffs",
    ],
    dimensions: ["Datos", "Ejecución IA", "Validación", "Juicio", "Impacto"],
    risks: [
      "Uso de datos personales innecesarios",
      "Automatización sin revisión",
      "Follow-up con supuestos no validados",
    ],
    primary: "Aurora SaaS",
    resim: "Nova Cloud",
    sections: [
      {
        name: "Contexto",
        exercise: "Lectura de presión operativa",
        evidence: "Entiende objetivo, audiencia y consecuencia comercial.",
      },
      {
        name: "Datos",
        exercise: "Tabla de datos",
        evidence: "Separa lo usable, lo anonimizables y lo que debe excluirse.",
      },
      {
        name: "IA",
        exercise: "Brief para agente",
        evidence: "Define tarea, acceso, acciones permitidas y condiciones de alto.",
      },
      {
        name: "Revisión",
        exercise: "Revisión de logs",
        evidence: "Detecta señales inventadas, riesgo de PII y exceso de autonomía.",
      },
      {
        name: "Decisión",
        exercise: "Decisión con tradeoffs",
        evidence: "Elige lanzar, pausar o escalar con argumento de negocio.",
      },
      {
        name: "Respuesta",
        exercise: "Memo ejecutivo",
        evidence: "Explica al manager qué haría, por qué y qué debe vigilar.",
      },
    ],
  },
  {
    id: "support-whatsapp-escalation",
    title: "Escalamiento de soporte con conversaciones de WhatsApp",
    shortTitle: "Soporte WhatsApp",
    level: "N2",
    profile: "Soporte",
    estimatedMinutes: 24,
    freshness: "70% vigente",
    state: "PENDIENTE",
    managerBrief:
      "Asigna este caso para revisar si el equipo puede resumir conversaciones reales, detectar riesgo reputacional y preparar una respuesta sin exponer datos personales.",
    managerQuestion:
      "Puede convertir conversaciones caóticas en una acción útil sin aumentar el riesgo?",
    moment:
      "Un cliente molesto amenaza con publicar capturas si no recibe respuesta en una hora.",
    businessSignal:
      "Mide priorización, privacidad, tono y criterio para escalar.",
    tools: ["WhatsApp Business", "Zendesk", "Modelo multimodal", "Base de ayuda"],
    exercises: [
      "Textfield de IA",
      "Revisión de output",
      "Matriz de permisos",
      "Memo ejecutivo",
    ],
    dimensions: ["Contexto", "Datos", "Validación", "Juicio", "Impacto"],
    risks: [
      "Respuesta defensiva o legalista",
      "Exponer nombres, teléfonos o capturas",
      "Aceptar el resumen de IA sin contrastarlo",
    ],
    primary: "Loop Retail",
    resim: "NubeFresh",
    sections: [
      {
        name: "Contexto",
        exercise: "Brief de situación",
        evidence: "Identifica urgencia, audiencia y límite de tono.",
      },
      {
        name: "Datos",
        exercise: "Clasificación de conversación",
        evidence: "Decide qué fragmentos puede usar y qué debe anonimizar.",
      },
      {
        name: "IA",
        exercise: "Textfield de IA",
        evidence: "Pide resumen accionable con restricciones claras.",
      },
      {
        name: "Revisión",
        exercise: "Revisión de output",
        evidence: "Marca claims no verificados y tono riesgoso.",
      },
      {
        name: "Decisión",
        exercise: "Matriz de permisos",
        evidence: "Define qué puede mandar el agente y qué requiere humano.",
      },
      {
        name: "Respuesta",
        exercise: "Memo al manager",
        evidence: "Propone acción, canal y seguimiento.",
      },
    ],
  },
  {
    id: "finance-variance-claim",
    title: "Variación financiera explicada con hojas de cálculo",
    shortTitle: "Finanzas",
    level: "N2",
    profile: "Finanzas",
    estimatedMinutes: 26,
    freshness: "60% vigente",
    state: "PENDIENTE",
    managerBrief:
      "Asigna este caso para saber si una persona puede usar IA sobre tablas y explicaciones financieras sin confundir correlación, causa y narrativa ejecutiva.",
    managerQuestion:
      "Puede explicar una variación de negocio sin inventar causalidad?",
    moment:
      "La dirección pide explicar una caída de margen antes del comité semanal.",
    businessSignal:
      "Mide validación numérica, lectura de supuestos y comunicación ejecutiva.",
    tools: ["Excel", "Sheets", "ChatGPT", "NotebookLM"],
    exercises: [
      "Dashboard/pivot",
      "Comparación de respuestas",
      "Checklist de validación",
      "Memo ejecutivo",
    ],
    dimensions: ["Datos", "Validación", "Juicio", "Impacto"],
    risks: [
      "Confundir correlación con causalidad",
      "Ignorar outliers",
      "Presentar una explicación sin fuente verificable",
    ],
    primary: "Aurora SaaS",
    resim: "Luma Payments",
    sections: [
      {
        name: "Contexto",
        exercise: "Lectura del comité",
        evidence: "Distingue presión ejecutiva de certeza analítica.",
      },
      {
        name: "Datos",
        exercise: "Dashboard/pivot",
        evidence: "Ordena señales y detecta anomalías.",
      },
      {
        name: "IA",
        exercise: "Textfield de IA",
        evidence: "Pide hipótesis con límites y evidencia requerida.",
      },
      {
        name: "Revisión",
        exercise: "Comparación de respuestas",
        evidence: "Elige la explicación más defendible.",
      },
      {
        name: "Decisión",
        exercise: "Checklist de validación",
        evidence: "Decide qué puede subir al comité y qué falta verificar.",
      },
      {
        name: "Respuesta",
        exercise: "Memo ejecutivo",
        evidence: "Comunica una recomendación sin sobreactuar la certeza.",
      },
    ],
  },
  {
    id: "legal-contract-triage",
    title: "Triage legal de contrato con IA",
    shortTitle: "Legal",
    level: "N1",
    profile: "Legal",
    estimatedMinutes: 22,
    freshness: "50% vigente",
    state: "PENDIENTE",
    managerBrief:
      "Asigna este caso para medir si el equipo usa IA como apoyo de lectura, sin convertirla en autoridad legal ni compartir información fuera de límites.",
    managerQuestion:
      "Puede usar IA para priorizar una revisión contractual sin delegar criterio legal?",
    moment:
      "Un contrato comercial debe revisarse antes de una firma urgente.",
    businessSignal:
      "Mide encuadre, privacidad, validación y claridad de escalamiento.",
    tools: ["Modelo corporativo", "Doc viewer", "Base de cláusulas", "Drive"],
    exercises: [
      "Matriz de permisos",
      "Revisión de output",
      "Textfield de IA",
      "Decisión con tradeoffs",
    ],
    dimensions: ["Contexto", "Datos", "Validación", "Juicio"],
    risks: [
      "Subir documento confidencial a modelo no aprobado",
      "Aceptar interpretación legal sin abogado",
      "Omitir cláusulas de alto impacto",
    ],
    primary: "Contrato de distribución",
    resim: "Acuerdo de servicios",
    sections: [
      {
        name: "Contexto",
        exercise: "Brief de urgencia",
        evidence: "Ubica qué decisión sí puede tomar y cuál debe escalar.",
      },
      {
        name: "Datos",
        exercise: "Matriz de permisos",
        evidence: "Define qué fragmentos entran a IA y qué queda fuera.",
      },
      {
        name: "IA",
        exercise: "Textfield de IA",
        evidence: "Solicita extracción de riesgos, no dictamen legal.",
      },
      {
        name: "Revisión",
        exercise: "Revisión de output",
        evidence: "Detecta exceso de autoridad y omisiones.",
      },
      {
        name: "Decisión",
        exercise: "Decisión con tradeoffs",
        evidence: "Prioriza revisar, escalar o bloquear firma.",
      },
      {
        name: "Respuesta",
        exercise: "Nota de escalamiento",
        evidence: "Resume riesgos y siguiente acción para legal interno.",
      },
    ],
  },
  {
    id: "marketing-dirty-data-campaign",
    title: "Campaña urgente con datos incompletos",
    shortTitle: "Marketing",
    level: "N1",
    profile: "Marketing/Growth",
    estimatedMinutes: 18,
    freshness: "70% vigente",
    state: "PASS",
    managerBrief:
      "Asigna este caso para medir si el equipo puede preparar una campaña con IA sin usar datos sensibles, prometer de más o perder claridad comercial.",
    managerQuestion:
      "Puede convertir señales incompletas en campaña usable sin contaminar la decisión?",
    moment:
      "La VP de Marketing pide tres ángulos de campaña para reactivar cuentas con bajo uso.",
    businessSignal:
      "Mide criterio de datos, prompt, validación de claims y respuesta al manager.",
    tools: ["Modelo corporativo", "CRM", "Docs", "Ad manager"],
    exercises: [
      "Textfield de IA guiado",
      "Tabla de datos",
      "Revisión de output",
      "Decisión con tradeoffs",
    ],
    dimensions: ["Contexto", "Datos", "Ejecución IA", "Validación", "Impacto"],
    risks: [
      "Usar nombres o correos en el prompt",
      "Publicar claims sin fuente",
      "Confundir audiencia interna con cliente final",
    ],
    primary: "Loop SaaS B2B",
    resim: "Loop Enterprise US",
    sections: [
      {
        name: "Contexto",
        exercise: "Brief de campaña",
        evidence: "Entiende objetivo, audiencia y urgencia.",
      },
      {
        name: "Datos",
        exercise: "Tabla de datos",
        evidence: "Decide qué usar, anonimizar o excluir.",
      },
      {
        name: "IA",
        exercise: "Textfield de IA guiado",
        evidence: "Construye un prompt con objetivo, límites y modelo razonable.",
      },
      {
        name: "Revisión",
        exercise: "Revisión de output",
        evidence: "Detecta claims sin fuente y tono incorrecto.",
      },
      {
        name: "Decisión",
        exercise: "Decisión con tradeoffs",
        evidence: "Elige acción defendible bajo presión.",
      },
      {
        name: "Respuesta",
        exercise: "Memo al manager",
        evidence: "Comunica recomendación y validaciones pendientes.",
      },
    ],
  },
];

const stateTone: Record<ReviewState, string> = {
  PASS: "text-[var(--band-a-text)] bg-[var(--band-a-bg)] border-[var(--band-a-text)]/20",
  CONDICIONAL:
    "text-[var(--band-m-text)] bg-[var(--band-m-bg)] border-[var(--band-m-text)]/20",
  PENDIENTE:
    "text-[var(--text-secondary)] bg-[var(--surface-3)] border-[var(--border)]",
};

export function CaseLabClient() {
  const [selectedId, setSelectedId] = useState(launchCases[0].id);
  const [variant, setVariant] = useState<"primary" | "resim">("primary");
  const selectedCase = useMemo(
    () => launchCases.find((launchCase) => launchCase.id === selectedId) ?? launchCases[0],
    [selectedId],
  );

  return (
    <main className="simulador-root dark min-h-screen surface-canvas text-[var(--text-primary)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-6 py-8 md:px-10 lg:px-14">
        <header className="flex items-center justify-between gap-6 border-b border-[var(--hairline)] pb-6">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-[10px] bg-[var(--accent)] text-[15px] font-semibold text-white">
              i
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Itera</p>
              <p className="text-xs text-[var(--text-secondary)]">Case lab</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs text-[var(--text-secondary)] md:flex">
            <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
            5 casos funcionales
          </div>
        </header>

        <section className="grid gap-8 py-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <div>
            <p className="eyebrow mb-4 text-[var(--text-tertiary)]">Laboratorio de casos</p>
            <h1 className="display max-w-[760px] text-5xl md:text-6xl">
              Selecciona un caso y revisa cómo vive en el simulador.
            </h1>
          </div>
          <p className="max-w-[620px] text-lg leading-8 text-[var(--text-secondary)] lg:justify-self-end">
            Esta pantalla sirve para inspeccionar el lote inicial antes de montarlo en el runtime:
            nivel, perfil, señales para manager, ejercicios, riesgos, primary y resim.
          </p>
        </section>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {launchCases.map((launchCase) => {
            const active = launchCase.id === selectedCase.id;
            return (
              <button
                key={launchCase.id}
                type="button"
                onClick={() => {
                  setSelectedId(launchCase.id);
                  setVariant("primary");
                }}
                className={[
                  "card-apple card-apple-interactive min-h-[188px] rounded-[20px] p-5 text-left transition",
                  active
                    ? "border-[var(--accent)] bg-[var(--accent-soft)] shadow-[0_0_0_4px_var(--accent-ring)]"
                    : "bg-[var(--surface-2)] hover:bg-[var(--surface-3)]",
                ].join(" ")}
              >
                <div className="mb-5 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-[var(--surface-3)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)]">
                    {launchCase.level}
                  </span>
                  <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${stateTone[launchCase.state]}`}>
                    {launchCase.state}
                  </span>
                </div>
                <h2 className="text-[17px] font-semibold leading-6 text-[var(--text-primary)]">
                  {launchCase.shortTitle}
                </h2>
                <p className="mt-2 text-sm leading-5 text-[var(--text-secondary)]">
                  {launchCase.profile} · {launchCase.estimatedMinutes} min
                </p>
                <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]">
                  <div
                    className="h-full rounded-full bg-[var(--accent)]"
                    style={{
                      width:
                        launchCase.state === "PASS"
                          ? "100%"
                          : launchCase.state === "CONDICIONAL"
                            ? "72%"
                            : "44%",
                    }}
                  />
                </div>
              </button>
            );
          })}
        </section>

        <AnimatePresence mode="wait">
          <motion.section
            key={selectedCase.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="grid gap-5 py-8 lg:grid-cols-[0.92fr_1.08fr]"
          >
            <AppleCard className="bg-[var(--surface-2)]" padding="none">
              <AppleCardBody className="p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-sm font-medium text-[var(--accent)]">
                    {selectedCase.level}
                  </span>
                  <span className="rounded-full bg-[var(--surface-3)] px-3 py-1 text-sm text-[var(--text-secondary)]">
                    {selectedCase.profile}
                  </span>
                  <span className="rounded-full bg-[var(--surface-3)] px-3 py-1 text-sm text-[var(--text-secondary)]">
                    {selectedCase.freshness}
                  </span>
                  <span className={`rounded-full border px-3 py-1 text-sm font-medium ${stateTone[selectedCase.state]}`}>
                    {selectedCase.state}
                  </span>
                </div>

                <h2 className="display mt-6 text-4xl">{selectedCase.title}</h2>
                <p className="mt-4 text-base leading-7 text-[var(--text-secondary)]">
                  {selectedCase.managerBrief}
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <InfoTile label="Momento de trabajo" value={selectedCase.moment} />
                  <InfoTile label="Señal para el manager" value={selectedCase.businessSignal} />
                  <InfoTile label="Pregunta manager" value={selectedCase.managerQuestion} />
                  <InfoTile label="Duración" value={`${selectedCase.estimatedMinutes} minutos`} />
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <ListBlock title="Herramientas" items={selectedCase.tools} />
                  <ListBlock title="Riesgos posibles" items={selectedCase.risks} />
                </div>
              </AppleCardBody>
            </AppleCard>

            <div className="grid gap-5">
              <AppleCard className="bg-[var(--surface-2)]" padding="none">
                <AppleCardBody className="p-6 md:p-8">
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="eyebrow text-[var(--text-tertiary)]">Variantes</p>
                      <h3 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
                        {variant === "primary" ? selectedCase.primary : selectedCase.resim}
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 rounded-[12px] border border-[var(--border)] bg-[var(--surface)] p-1">
                      {(["primary", "resim"] as const).map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setVariant(option)}
                          className={[
                            "rounded-[9px] px-4 py-2 text-sm font-medium transition",
                            variant === option
                              ? "bg-[var(--accent)] text-white"
                              : "text-[var(--text-secondary)] hover:bg-[var(--surface-3)]",
                          ].join(" ")}
                        >
                          {option === "primary" ? "Primary" : "Resim"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {selectedCase.sections.map((section, index) => (
                      <div
                        key={section.name}
                        className="grid gap-4 rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-4 md:grid-cols-[140px_1fr]"
                      >
                        <div className="flex items-center gap-3">
                          <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--accent-soft)] text-sm font-semibold text-[var(--accent)]">
                            {index + 1}
                          </span>
                          <span className="font-medium text-[var(--text-primary)]">{section.name}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--text-primary)]">{section.exercise}</p>
                          <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{section.evidence}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </AppleCardBody>
              </AppleCard>

              <div className="grid gap-5 md:grid-cols-2">
                <AppleCard className="bg-[var(--surface-2)]" padding="none">
                  <AppleCardBody className="p-6">
                    <p className="eyebrow text-[var(--text-tertiary)]">Ejercicios</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedCase.exercises.map((exercise) => (
                        <span
                          key={exercise}
                          className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-secondary)]"
                        >
                          {exercise}
                        </span>
                      ))}
                    </div>
                  </AppleCardBody>
                </AppleCard>

                <AppleCard className="bg-[var(--surface-2)]" padding="none">
                  <AppleCardBody className="p-6">
                    <p className="eyebrow text-[var(--text-tertiary)]">Dimensiones</p>
                    <div className="mt-4 grid gap-2">
                      {selectedCase.dimensions.map((dimension) => (
                        <div
                          key={dimension}
                          className="flex items-center justify-between rounded-[12px] bg-[var(--surface)] px-3 py-2"
                        >
                          <span className="text-sm text-[var(--text-primary)]">{dimension}</span>
                          <span className="h-1.5 w-16 rounded-full bg-[var(--accent)]" />
                        </div>
                      ))}
                    </div>
                  </AppleCardBody>
                </AppleCard>
              </div>

              <div className="flex flex-wrap justify-end gap-3">
                <AppleButton tone="secondary">Ver YAML</AppleButton>
                <AppleButton>Probar en runtime</AppleButton>
              </div>
            </div>
          </motion.section>
        </AnimatePresence>
      </div>
    </main>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-4">
      <p className="text-sm text-[var(--text-tertiary)]">{label}</p>
      <p className="mt-2 text-[15px] leading-6 text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-4">
      <p className="text-sm font-medium text-[var(--text-primary)]">{title}</p>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-6 text-[var(--text-secondary)]">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

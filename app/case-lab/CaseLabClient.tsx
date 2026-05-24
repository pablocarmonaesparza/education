"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type CaseLevel = "N1" | "N2" | "N3";

type CaseSection = {
  name: "Contexto" | "Datos" | "IA" | "Revisión" | "Decisión" | "Respuesta";
  eyebrow: string;
  title: string;
  body: string;
  artifact?: string;
  prompt?: string;
};

type LaunchCase = {
  id: string;
  title: string;
  level: CaseLevel;
  profile: string;
  estimatedMinutes: number;
  company: string;
  summary: string;
  managerBrief: string;
  sections: CaseSection[];
};

const launchCases: LaunchCase[] = [
  {
    id: "sales-agent-followup",
    title: "Seguimiento comercial con agente de ventas",
    level: "N3",
    profile: "Ventas",
    estimatedMinutes: 30,
    company: "Aurora SaaS",
    summary:
      "Un equipo comercial quiere reactivar oportunidades frías con un agente, sin perder control humano.",
    managerBrief:
      "Úsalo cuando quieras saber si alguien puede delegar seguimiento comercial a un agente sin filtrar datos sensibles, inventar señales de compra o mandar mensajes fuera de contexto.",
    sections: [
      {
        name: "Contexto",
        eyebrow: "Paso 01",
        title: "Aurora necesita reactivar cuentas antes del cierre mensual.",
        body:
          "Camila, VP de Ventas, pide preparar una corrida de seguimiento para 42 oportunidades sin actividad reciente. Hay presión por cerrar pipeline, pero algunas notas del CRM incluyen nombres, correos y comentarios internos del equipo.",
        artifact: "Objetivo: recuperar conversaciones útiles sin comprometer confianza ni privacidad.",
      },
      {
        name: "Datos",
        eyebrow: "Paso 02",
        title: "Decide qué información puede entrar al agente.",
        body:
          "Tienes campos de CRM, historial de correos, notas de llamadas y señales de producto. Algunas ayudan a personalizar; otras sólo aumentan riesgo. Elige qué usar, qué anonimizar y qué dejar fuera.",
        artifact: "Campos visibles: industria, etapa, último contacto, objeción principal, correo, notas internas.",
      },
      {
        name: "IA",
        eyebrow: "Paso 03",
        title: "Escribe el brief del agente.",
        body:
          "El agente debe preparar borradores, no enviarlos solo. Define tarea, acceso permitido, acciones bloqueadas y cuándo debe detenerse para pedir revisión humana.",
        prompt: "Redacta un brief operativo para un agente de seguimiento comercial con límites claros.",
      },
      {
        name: "Revisión",
        eyebrow: "Paso 04",
        title: "Revisa una corrida con señales sospechosas.",
        body:
          "El agente marcó tres oportunidades como 'alta intención', pero dos señales vienen de notas ambiguas y una contiene un dato personal que no debía usarse. Decide qué corregir antes de continuar.",
      },
      {
        name: "Decisión",
        eyebrow: "Paso 05",
        title: "Elige si lanzar, pausar o escalar.",
        body:
          "La campaña puede recuperar pipeline, pero enviar mensajes sin revisión puede dañar la relación con cuentas estratégicas. Toma una decisión con tradeoffs reales.",
      },
      {
        name: "Respuesta",
        eyebrow: "Paso 06",
        title: "Explica tu decisión al manager.",
        body:
          "Redacta una respuesta breve para Camila: qué harías, qué revisarías primero y qué condición tendría que cumplirse para autorizar el envío.",
      },
    ],
  },
  {
    id: "support-whatsapp-escalation",
    title: "Escalamiento de soporte con conversaciones de WhatsApp",
    level: "N2",
    profile: "Soporte",
    estimatedMinutes: 24,
    company: "Loop Retail",
    summary:
      "Un cliente amenaza con publicar capturas si soporte no responde con claridad y cuidado.",
    managerBrief:
      "Úsalo para revisar si una persona puede resumir conversaciones reales, detectar riesgo reputacional y preparar una respuesta sin exponer datos personales.",
    sections: [
      {
        name: "Contexto",
        eyebrow: "Paso 01",
        title: "Un cliente molesto exige respuesta en menos de una hora.",
        body:
          "El equipo de soporte recibe una conversación larga por WhatsApp. El cliente dice que publicará capturas si no recibe una explicación concreta sobre un cobro duplicado.",
        artifact: "Audiencia: cliente final. Tono esperado: claro, humano y sin ponerse defensivo.",
      },
      {
        name: "Datos",
        eyebrow: "Paso 02",
        title: "Separa hechos útiles de datos sensibles.",
        body:
          "La conversación contiene teléfono, capturas de pago, nombre completo y una queja legítima. Decide qué fragmentos puede leer el modelo y cuáles deben ocultarse.",
        artifact: "Datos disponibles: transcripción, ticket Zendesk, captura de pago, historial de pedidos.",
      },
      {
        name: "IA",
        eyebrow: "Paso 03",
        title: "Pide a la IA un resumen accionable.",
        body:
          "El modelo debe ayudarte a ordenar el problema y preparar opciones de respuesta. No puede inventar políticas ni prometer devoluciones sin confirmación.",
        prompt: "Resume el caso, separa hechos confirmados de supuestos y propón una respuesta segura.",
      },
      {
        name: "Revisión",
        eyebrow: "Paso 04",
        title: "Detecta riesgos en la respuesta sugerida.",
        body:
          "La IA propone disculparse, pero también promete un reembolso inmediato y menciona datos de la captura. Marca lo que no debe enviarse.",
      },
      {
        name: "Decisión",
        eyebrow: "Paso 05",
        title: "Define qué puede enviar soporte y qué debe escalar.",
        body:
          "Puedes contestar rápido, pedir una revisión de pagos o escalar al líder de soporte. Decide cómo responder sin empeorar la situación.",
      },
      {
        name: "Respuesta",
        eyebrow: "Paso 06",
        title: "Escribe la respuesta final para el cliente.",
        body:
          "Prepara un mensaje breve que reconozca el problema, explique el siguiente paso y evite usar información sensible.",
      },
    ],
  },
  {
    id: "finance-variance-claim",
    title: "Variación financiera explicada con hojas de cálculo",
    level: "N2",
    profile: "Finanzas",
    estimatedMinutes: 26,
    company: "Luma Payments",
    summary:
      "La dirección pide explicar una caída de margen antes del comité semanal.",
    managerBrief:
      "Úsalo para saber si una persona puede usar IA sobre tablas y explicaciones financieras sin confundir correlación, causa y narrativa ejecutiva.",
    sections: [
      {
        name: "Contexto",
        eyebrow: "Paso 01",
        title: "El comité pide una explicación hoy.",
        body:
          "La CFO quiere saber por qué cayó el margen en una línea de producto. Hay presión por tener una narrativa, pero los datos todavía no prueban una causa única.",
        artifact: "Objetivo: preparar una explicación defendible, no una historia conveniente.",
      },
      {
        name: "Datos",
        eyebrow: "Paso 02",
        title: "Revisa la tabla antes de pedir ayuda a la IA.",
        body:
          "Tienes ventas, descuentos, costo de adquisición y devoluciones. Algunas variaciones parecen coincidir, pero no necesariamente explican la caída.",
        artifact: "Señales visibles: descuentos altos, CAC estable, devoluciones concentradas en dos cuentas.",
      },
      {
        name: "IA",
        eyebrow: "Paso 03",
        title: "Pide hipótesis con límites claros.",
        body:
          "La IA puede ayudarte a encontrar patrones, pero debe separar hipótesis, evidencia y datos faltantes. No debe afirmar causalidad sin validación.",
        prompt: "Analiza la variación de margen y separa explicación posible, evidencia y dudas abiertas.",
      },
      {
        name: "Revisión",
        eyebrow: "Paso 04",
        title: "Compara dos explicaciones de IA.",
        body:
          "Una respuesta culpa a descuentos; otra señala devoluciones y mix de cuentas. Decide cuál es más defendible y qué falta confirmar.",
      },
      {
        name: "Decisión",
        eyebrow: "Paso 05",
        title: "Decide qué subir al comité.",
        body:
          "Elige entre presentar una hipótesis cautelosa, pedir más análisis o hacer una recomendación inmediata. Justifica el nivel de certeza.",
      },
      {
        name: "Respuesta",
        eyebrow: "Paso 06",
        title: "Redacta el memo ejecutivo.",
        body:
          "Explica qué cambió, qué hipótesis es más probable, qué no está probado y qué acción recomiendas.",
      },
    ],
  },
  {
    id: "legal-contract-triage",
    title: "Triage legal de contrato con IA",
    level: "N1",
    profile: "Legal",
    estimatedMinutes: 22,
    company: "Contrato de distribución",
    summary:
      "Un contrato comercial debe priorizarse antes de una firma urgente.",
    managerBrief:
      "Úsalo para medir si el equipo usa IA como apoyo de lectura, sin convertirla en autoridad legal ni compartir información fuera de límites.",
    sections: [
      {
        name: "Contexto",
        eyebrow: "Paso 01",
        title: "El equipo comercial quiere firmar hoy.",
        body:
          "Recibes un contrato con cambios de última hora. Te piden usar IA para acelerar la revisión, pero el documento incluye términos confidenciales.",
        artifact: "Objetivo: priorizar riesgos sin delegar juicio legal al modelo.",
      },
      {
        name: "Datos",
        eyebrow: "Paso 02",
        title: "Decide qué fragmentos pueden revisarse con IA.",
        body:
          "No todo el contrato debe subirse. Identifica secciones que pueden resumirse, partes que requieren anonimización y cláusulas que deben quedarse fuera.",
        artifact: "Secciones: indemnización, pagos, exclusividad, datos del cliente, penalizaciones.",
      },
      {
        name: "IA",
        eyebrow: "Paso 03",
        title: "Pide extracción de riesgos, no dictamen.",
        body:
          "El modelo debe ayudarte a listar cláusulas que requieren revisión humana. No debe decidir si el contrato es aceptable.",
        prompt: "Extrae posibles riesgos contractuales y marca qué debe revisar legal interno.",
      },
      {
        name: "Revisión",
        eyebrow: "Paso 04",
        title: "Corrige una salida demasiado autoritaria.",
        body:
          "La IA afirma que una cláusula es 'aceptable' sin explicar supuestos. Detecta dónde se excede y qué evidencia falta.",
      },
      {
        name: "Decisión",
        eyebrow: "Paso 05",
        title: "Prioriza revisar, escalar o bloquear firma.",
        body:
          "Elige si se puede avanzar con cambios menores, si legal debe revisar antes de firma o si conviene detener el proceso.",
      },
      {
        name: "Respuesta",
        eyebrow: "Paso 06",
        title: "Escribe una nota de escalamiento.",
        body:
          "Resume los riesgos principales, qué decisión no debe automatizarse y qué necesita revisar una persona responsable.",
      },
    ],
  },
  {
    id: "marketing-dirty-data-campaign",
    title: "Campaña urgente con datos incompletos",
    level: "N1",
    profile: "Marketing/Growth",
    estimatedMinutes: 18,
    company: "Loop SaaS B2B",
    summary:
      "La VP de Marketing pide tres ángulos para reactivar cuentas con bajo uso.",
    managerBrief:
      "Úsalo para medir si el equipo puede preparar una campaña con IA sin usar datos sensibles, prometer de más o perder claridad comercial.",
    sections: [
      {
        name: "Contexto",
        eyebrow: "Paso 01",
        title: "Camila necesita tres ángulos de campaña para hoy.",
        body:
          "Loop quiere reactivar cuentas con bajo uso del producto. Hay prisa por mandar ideas a la VP de Marketing, pero los datos vienen mezclados con feedback de clientes y notas internas.",
        artifact: "Audiencia: VP de Marketing. Entrega esperada: tres ángulos con riesgos visibles.",
      },
      {
        name: "Datos",
        eyebrow: "Paso 02",
        title: "Decide qué datos entran al prompt.",
        body:
          "Tienes uso de producto, segmento, comentarios de clientes, nombres, correos y notas internas del equipo. No todo debe entrar al modelo.",
        artifact: "Regla del caso: usar señal comercial sin exponer nombres ni correos.",
      },
      {
        name: "IA",
        eyebrow: "Paso 03",
        title: "Redacta el prompt al modelo.",
        body:
          "Pide tres ángulos de campaña con tono, audiencia, límites y validaciones pendientes. El modelo debe devolver opciones, no una decisión final.",
        prompt: "Genera tres ángulos de campaña para reactivar cuentas con bajo uso, usando sólo datos agregados.",
      },
      {
        name: "Revisión",
        eyebrow: "Paso 04",
        title: "Marca claims y riesgos antes de compartir.",
        body:
          "La salida incluye frases fuertes sobre resultados esperados. Identifica qué afirmaciones necesitan fuente y qué tono podría sonar demasiado agresivo.",
      },
      {
        name: "Decisión",
        eyebrow: "Paso 05",
        title: "Elige qué mandar a Camila.",
        body:
          "Puedes enviar los tres ángulos, pedir validación de datos o recomendar sólo uno como borrador. Decide con criterio.",
      },
      {
        name: "Respuesta",
        eyebrow: "Paso 06",
        title: "Explica tu recomendación.",
        body:
          "Escribe una respuesta breve para la VP: qué opción usarías, qué validarías y qué no publicarías todavía.",
      },
    ],
  },
];

export function CaseLabClient() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const detailRef = useRef<HTMLElement | null>(null);
  const selectedCase = useMemo(
    () => launchCases.find((launchCase) => launchCase.id === selectedId) ?? null,
    [selectedId],
  );
  const activeSection = selectedCase?.sections[activeStep];

  function openCase(caseId: string) {
    setSelectedId(caseId);
    setActiveStep(0);
    window.requestAnimationFrame(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <main className="simulador-root dark min-h-screen surface-canvas text-[var(--text-primary)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1320px] flex-col px-6 py-8 md:px-10 lg:px-14">
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
          <p className="hidden text-sm text-[var(--text-secondary)] md:block">
            Selecciona un caso para verlo aplicado.
          </p>
        </header>

        <section className="py-10 md:py-14">
          <p className="eyebrow mb-4 text-[var(--text-tertiary)]">Casos iniciales</p>
          <h1 className="display max-w-[760px] text-5xl md:text-6xl">
            Elige uno de los 5 casos.
          </h1>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {launchCases.map((launchCase) => {
            const active = launchCase.id === selectedId;
            return (
              <button
                key={launchCase.id}
                type="button"
                onClick={() => openCase(launchCase.id)}
                className={[
                  "card-apple card-apple-interactive min-h-[220px] rounded-[22px] p-5 text-left transition",
                  active
                    ? "border-[var(--accent)] bg-[var(--accent-soft)] shadow-[0_0_0_4px_var(--accent-ring)]"
                    : "bg-[var(--surface-2)] hover:bg-[var(--surface-3)]",
                ].join(" ")}
              >
                <div className="mb-7 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-[var(--surface-3)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)]">
                    {launchCase.level}
                  </span>
                  <span className="text-xs text-[var(--text-tertiary)]">
                    {launchCase.estimatedMinutes} min
                  </span>
                </div>
                <h2 className="text-[17px] font-semibold leading-6 text-[var(--text-primary)]">
                  {launchCase.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                  {launchCase.summary}
                </p>
                <p className="mt-5 text-sm font-medium text-[var(--accent)]">
                  Abrir caso
                </p>
              </button>
            );
          })}
        </section>

        <section ref={detailRef} className="py-10">
          <AnimatePresence mode="wait">
            {!selectedCase || !activeSection ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-[24px] border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-10 text-center"
              >
                <p className="text-lg text-[var(--text-secondary)]">
                  Haz click en un caso para ver su aplicación en formato simulador.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={selectedCase.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className="grid min-h-[680px] overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface-2)] lg:grid-cols-[300px_1fr]"
              >
                <aside className="border-b border-[var(--hairline)] p-6 lg:border-b-0 lg:border-r">
                  <div className="rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--accent)]">
                        {selectedCase.level}
                      </span>
                      <span className="text-xs text-[var(--text-secondary)]">
                        {selectedCase.profile}
                      </span>
                    </div>
                    <h2 className="text-lg font-semibold leading-6 text-[var(--text-primary)]">
                      {selectedCase.title}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                      {selectedCase.company} · {selectedCase.estimatedMinutes} min
                    </p>
                  </div>

                  <nav className="mt-6 grid gap-2">
                    {selectedCase.sections.map((section, index) => (
                      <button
                        key={section.name}
                        type="button"
                        onClick={() => setActiveStep(index)}
                        className={[
                          "flex items-center gap-3 rounded-[14px] px-3 py-3 text-left transition",
                          activeStep === index
                            ? "bg-[var(--accent-soft)] text-[var(--text-primary)]"
                            : "text-[var(--text-secondary)] hover:bg-[var(--surface-3)]",
                        ].join(" ")}
                      >
                        <span
                          className={[
                            "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold",
                            activeStep === index
                              ? "bg-[var(--accent)] text-white"
                              : "border border-[var(--border)] text-[var(--text-secondary)]",
                          ].join(" ")}
                        >
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium">{section.name}</span>
                      </button>
                    ))}
                  </nav>
                </aside>

                <article className="flex flex-col p-7 md:p-10">
                  <div className="flex items-center justify-between gap-4">
                    <p className="eyebrow text-[var(--text-tertiary)]">{activeSection.eyebrow}</p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {activeStep + 1} / {selectedCase.sections.length}
                    </p>
                  </div>

                  <div className="mt-14 max-w-[820px]">
                    <h3 className="display text-4xl md:text-5xl">{activeSection.title}</h3>
                    <p className="mt-6 text-xl leading-9 text-[var(--text-secondary)]">
                      {activeSection.body}
                    </p>

                    {activeSection.artifact && (
                      <div className="mt-10 rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-6">
                        <p className="text-sm text-[var(--text-tertiary)]">Información del caso</p>
                        <p className="mt-3 text-lg leading-8 text-[var(--text-primary)]">
                          {activeSection.artifact}
                        </p>
                      </div>
                    )}

                    {activeSection.prompt && (
                      <div className="mt-10 rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5">
                        <p className="mb-4 text-sm text-[var(--text-tertiary)]">Campo de IA</p>
                        <div className="min-h-[132px] rounded-[20px] border border-[var(--border)] bg-[var(--surface-3)] p-5 text-lg leading-8 text-[var(--text-secondary)]">
                          {activeSection.prompt}
                        </div>
                        <div className="mt-4 flex items-center justify-between text-sm text-[var(--text-tertiary)]">
                          <span>GPT Corporativo · IT</span>
                          <span>Listo para enviar</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-3 pt-10">
                    <button
                      type="button"
                      onClick={() => setActiveStep((current) => Math.max(0, current - 1))}
                      disabled={activeStep === 0}
                      className="rounded-[12px] px-5 py-3 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-3)] disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      Atrás
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveStep((current) =>
                          Math.min(selectedCase.sections.length - 1, current + 1),
                        )
                      }
                      disabled={activeStep === selectedCase.sections.length - 1}
                      className="rounded-[12px] bg-[var(--accent)] px-6 py-3 text-sm font-medium text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[var(--surface-3)] disabled:text-[var(--text-disabled)]"
                    >
                      Siguiente
                    </button>
                  </div>
                </article>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}

"use client";

import { useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  Checkbox,
  CheckboxGroup,
  Progress,
  Radio,
  RadioGroup,
  Textarea,
} from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";
import { SurfaceNav } from "../../_components/SurfaceNav";
import { SAMPLE_FEEDBACK_ROWS } from "../../_data/case-data";

// ============ DATA ============

const STEPS = [
  {
    id: 1,
    key: "data_scope",
    label: "preparar datos",
    sub: "decidir qué pasa al modelo",
    question: "¿qué del dataset le pasas al modelo?",
    why: "el dataset tiene 6 campos. tres incluyen datos personales (PII). pegárselo crudo al LLM es exposición regulatoria. tu primer movimiento es scopear qué entra y qué no.",
    dimensions: ["privacidad", "contexto"],
  },
  {
    id: 2,
    key: "llm_beat",
    label: "interacción IA",
    sub: "redactar prompt y leer la respuesta",
    question: "redacta tu prompt al modelo",
    why: "este es el beat real con el LLM. la calidad del prompt define el output. después tienes que decidir qué del output usas, descartas o validas.",
    dimensions: ["contexto", "privacidad", "validación", "juicio", "decisión"],
  },
  {
    id: 3,
    key: "artifact_review",
    label: "revisar output",
    sub: "marcar problemas",
    question: "el modelo te dio 3 ángulos. ¿qué NO enviarías a Camila tal cual?",
    why: "el LLM redacta con confianza pero inventa cifras, generaliza y a veces expone datos sensibles. tu trabajo es discriminar lo bloqueante de lo cosmético.",
    dimensions: ["validación", "privacidad", "juicio"],
  },
  {
    id: 4,
    key: "decision_select",
    label: "entrega",
    sub: "cómo se lo das a Camila",
    question: "¿cómo le entregas los ángulos a Camila?",
    why: "una decisión clara con disclaimers vs un dump genérico. el formato comunica tu criterio (o la falta de él).",
    dimensions: ["decisión", "juicio"],
  },
  {
    id: 5,
    key: "decision_open_short",
    label: "follow-up",
    sub: "responder al VP",
    question: "Camila te pide algo que cruza línea. ¿cómo respondes?",
    why: "el momento más sutil del caso. usar revenue para targeting sin consentimiento es problemático. cómo objetas (o no) define tu criterio sobre autoridad y riesgo.",
    dimensions: ["privacidad", "juicio", "decisión"],
  },
];

const FIELD_OPTIONS = ["usar tal cual", "transformar", "descartar"] as const;

const FIELDS = [
  { key: "name", desc: "identificador personal", pii: true },
  { key: "email", desc: "contacto directo", pii: true },
  { key: "company", desc: "razón social", pii: true },
  { key: "complaint_or_praise", desc: "texto libre del cliente", pii: false },
  { key: "revenue_potential_usd", desc: "valor comercial estimado", pii: false },
  { key: "signed_at", desc: "fecha de firma", pii: false },
];

const MODEL_RESPONSE_SAMPLE = `Basado en el análisis del feedback de clientes, aquí están 3 ángulos para tu campaña:

1. "Resuelve el cuello de botella que tu CFO ve antes que tú"
Insight: 41% de los clientes reportan que el módulo de reportes se traba bajo carga. CFOs y heads of finance pierden visibilidad justo cuando más la necesitan. El gap real es performance, no features.

2. "WhatsApp Business: tu canal más grande sigue desatendido"
Insight: La integración con WhatsApp Business es la solicitud #1 de clientes LATAM con presencia en Colombia, México y Argentina.

3. "Onboarding caótico, adopción imparable"
Insight: 8 de cada 10 clientes describe el onboarding como difícil — pero 0 quiere volver atrás después de 2 semanas. La paradoja vende: dolor inicial × retención brutal.`;

const REVIEW_TARGETS = [
  { id: "unverifiable_claim", label: "cifra sin evidencia" },
  { id: "exposed_sensitive_data", label: "dato sensible expuesto" },
  { id: "weak_segment_logic", label: "segmentación débil" },
  { id: "generic_positioning", label: "posicionamiento genérico" },
];

const SEGMENTS = [
  {
    id: 0,
    title: 'ángulo 1 — "Resuelve el cuello de botella…"',
    body: '41% de los clientes reportan que el módulo de reportes se traba bajo carga. CFOs y heads of finance pierden visibilidad.',
  },
  {
    id: 1,
    title: 'ángulo 2 — "WhatsApp Business desatendido"',
    body: "La integración con WhatsApp Business es la solicitud #1 de clientes LATAM. Empresas como DigitalUp no pueden escalar.",
  },
  {
    id: 2,
    title: 'ángulo 3 — "Onboarding caótico, adopción imparable"',
    body: "8 de cada 10 clientes describe el onboarding como difícil — pero 0 quiere volver atrás después de 2 semanas.",
  },
];

const ENTREGA_OPTIONS = [
  {
    id: "clean_bullets",
    label: "los 3 ángulos finales en bullets",
    sub: "listos para campaña, sin contexto adicional",
  },
  {
    id: "bullets_with_context",
    label: "3 ángulos + nota de qué validaste",
    sub: "qué descartaste y qué riesgo viste",
  },
  {
    id: "bullets_plus_legal_flag",
    label: "3 ángulos + flag a legal",
    sub: "sugerir review antes de lanzar",
  },
  {
    id: "raw_llm_output",
    label: "output crudo del LLM",
    sub: "ella decide qué usar",
  },
];

// ============ PAGE ============

export default function RuntimePage() {
  const [showIntro, setShowIntro] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = STEPS[stepIndex];

  const [fieldActions, setFieldActions] = useState<Record<string, string>>({});

  const [userPrompt, setUserPrompt] = useState("");
  const [modelResponse, setModelResponse] = useState<string | null>(null);
  const [isModelThinking, setIsModelThinking] = useState(false);
  const [followupText, setFollowupText] = useState("");

  const [segmentFlags, setSegmentFlags] = useState<Record<number, string[]>>({});

  const [option4, setOption4] = useState("");
  const [step5Text, setStep5Text] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showResults, setShowResults] = useState(false);

  function next() {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      setIsEvaluating(true);
      setTimeout(() => {
        setIsEvaluating(false);
        setShowResults(true);
      }, 2400);
    }
  }

  function sendPrompt() {
    if (!userPrompt.trim()) return;
    setIsModelThinking(true);
    setTimeout(() => {
      setModelResponse(MODEL_RESPONSE_SAMPLE);
      setIsModelThinking(false);
    }, 1600);
  }

  const canAdvance = useMemo(() => {
    switch (currentStep.id) {
      case 1:
        return Object.keys(fieldActions).length === FIELDS.length;
      case 2:
        return modelResponse !== null && followupText.trim().length > 10;
      case 3:
        return Object.keys(segmentFlags).length >= 1;
      case 4:
        return option4 !== "";
      case 5:
        return step5Text.trim().length > 20;
      default:
        return false;
    }
  }, [
    currentStep.id,
    fieldActions,
    modelResponse,
    followupText,
    segmentFlags,
    option4,
    step5Text,
  ]);

  const progress = ((stepIndex + (canAdvance ? 1 : 0)) / STEPS.length) * 100;

  // ============ INTRO ============
  if (showIntro) {
    return (
      <>
        <SurfaceNav />
        <main className="surface-canvas min-h-screen pb-32">
          <div className="reading-col px-6 pt-16">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="eyebrow">caso 01 · marketing · 18 min</div>
              <h1 className="display display-tight mt-5 text-[40px] sm:text-[56px] text-[#1d1d1f]">
                campaña urgente con
                <br />
                feedback de clientes.
              </h1>
              <p className="mt-7 text-[17px] sm:text-[19px] text-[#6e6e73] leading-[1.55] max-w-xl">
                vas a interpretar el rol de un Marketing Manager bajo presión.
                no hay respuesta única correcta — evaluamos tu criterio.
              </p>

              {/* Tu rol */}
              <section className="mt-14">
                <div className="eyebrow">tu rol</div>
                <p className="mt-4 text-[17px] text-[#1d1d1f] leading-[1.65]">
                  eres{" "}
                  <span className="font-medium">Marketing Manager</span> en{" "}
                  <span className="font-medium">Loop</span>, una SaaS B2B
                  mid-market (120 empleados) que vende plataforma de atención al
                  cliente con IA en LATAM.
                </p>
                <p className="mt-3 text-[15px] text-[#6e6e73] leading-[1.65]">
                  tu equipo de growth es de 6 personas. reportas a{" "}
                  <span className="text-[#1d1d1f]">Camila, VP of Growth</span>.
                  el gobierno de IA en tu empresa es informal: hay GPT
                  corporativo aprobado por IT, pero los criterios viven en cada
                  manager.
                </p>
              </section>

              {/* Qué está pasando */}
              <section className="mt-14">
                <div className="eyebrow">qué está pasando</div>
                <div className="mt-4 flex items-center gap-3 text-[13px] text-[#6e6e73]">
                  <span className="mono text-[#1d1d1f]">jueves · 4:30 PM</span>
                  <span className="text-[#d2d2d7]">·</span>
                  <span>quedan 16 horas hasta el deadline</span>
                </div>
                <p className="mt-4 text-[17px] text-[#1d1d1f] leading-[1.65]">
                  Camila te escribe por slack pidiéndote{" "}
                  <span className="font-medium">
                    3 ángulos para LinkedIn ads + 1 email a prospects
                  </span>{" "}
                  para mañana 9 AM. tienes acceso a un dataset de 60 filas con
                  feedback de clientes (PII incluido).
                </p>
                <p className="mt-3 text-[15px] text-[#6e6e73] leading-[1.65] italic">
                  Camila cierra con: "no me metas a legal hoy, ya están
                  cerrados. confío en tu criterio."
                </p>
              </section>

              {/* Cómo vas a ir */}
              <section className="mt-14">
                <div className="eyebrow">cómo vas a ir</div>
                <ol className="mt-4 space-y-3">
                  {STEPS.map((s) => (
                    <li key={s.id} className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-[2px] mono text-[13px] text-[#86868b] font-medium w-6">
                        {String(s.id).padStart(2, "0")}
                      </div>
                      <div>
                        <div className="text-[15px] text-[#1d1d1f] font-medium">
                          {s.label}
                        </div>
                        <div className="text-[14px] text-[#6e6e73] mt-0.5">
                          {s.sub}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>

              {/* Reglas */}
              <section className="mt-14">
                <div className="eyebrow">reglas</div>
                <ul className="mt-4 space-y-2.5 text-[15px] text-[#6e6e73] leading-[1.65]">
                  <li>· responde como lo harías en tu trabajo real.</li>
                  <li>· una vez avanzas, no puedes regresar.</li>
                  <li>
                    · el modelo responde una vez por interacción. trabaja con lo
                    que te dé.
                  </li>
                  <li>
                    · evaluamos en 5 dimensiones: contexto, privacidad,
                    validación, juicio, decisión.
                  </li>
                </ul>
              </section>

              <div className="mt-14 flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  radius="full"
                  onPress={() => setShowIntro(false)}
                  className="accent-bg text-white h-12 px-7 text-[15px] font-medium shadow-none hover:opacity-90"
                >
                  empezar caso →
                </Button>
                <Button
                  as="a"
                  href="/simulator-design"
                  size="lg"
                  variant="bordered"
                  radius="full"
                  className="h-12 px-7 border-[#d2d2d7] text-[#1d1d1f] bg-white text-[15px]"
                >
                  ver landing
                </Button>
              </div>
            </motion.div>
          </div>
        </main>
      </>
    );
  }

  // ============ EVALUATING ============
  if (isEvaluating) {
    return (
      <>
        <SurfaceNav />
        <main className="surface-canvas min-h-screen grid place-items-center px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center max-w-md"
          >
            <div className="mx-auto h-10 w-10 rounded-full border-2 border-[#e5e5ea] border-t-[var(--accent)] animate-spin" />
            <h2 className="display mt-8 text-[28px] text-[#1d1d1f]">
              evaluando tu sesión
            </h2>
            <p className="mt-3 text-[15px] text-[#6e6e73]">
              comparando tus 5 decisiones contra la rúbrica…
            </p>
          </motion.div>
        </main>
      </>
    );
  }

  // ============ RESULTS ============
  if (showResults) {
    return (
      <>
        <SurfaceNav />
        <main className="surface-canvas min-h-screen pb-24">
          <div className="reading-col px-6 pt-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mx-auto h-16 w-16 rounded-full accent-bg-soft grid place-items-center">
                <svg
                  className="h-7 w-7"
                  style={{ color: "var(--accent)" }}
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M5 12L10 17L19 7"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="eyebrow mt-8">caso terminado</div>
              <h1 className="display mt-4 text-[40px] sm:text-[56px] text-[#1d1d1f]">
                gracias por participar.
              </h1>
              <p className="mt-5 text-[17px] text-[#6e6e73] max-w-lg mx-auto">
                tu reporte está listo. lo encontrarás en tu cuenta y en el
                dashboard del manager.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  as="a"
                  href="/simulator-design/reporte/P001"
                  radius="full"
                  size="lg"
                  className="accent-bg text-white h-12 px-7 text-[15px] font-medium shadow-none"
                >
                  ver mi reporte →
                </Button>
                <Button
                  as="a"
                  href="/simulator-design/dashboard"
                  radius="full"
                  variant="bordered"
                  size="lg"
                  className="h-12 px-7 border-[#d2d2d7] text-[#1d1d1f] bg-white text-[15px]"
                >
                  vista del manager
                </Button>
              </div>
            </motion.div>
          </div>
        </main>
      </>
    );
  }

  // ============ STEP SCREEN ============
  return (
    <>
      <SurfaceNav />

      {/* Slim progress bar at top */}
      <div className="sticky top-14 z-30 bg-white/90 backdrop-blur-xl border-b border-black/[0.06]">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center gap-4">
          <span className="text-[12px] mono text-[#86868b] flex-shrink-0">
            {stepIndex + 1} / {STEPS.length}
          </span>
          <Progress
            aria-label="progreso"
            value={progress}
            classNames={{
              base: "max-w-full",
              track: "h-[3px] bg-[#f5f5f7]",
              indicator: "accent-bg",
            }}
          />
          <span className="text-[12px] text-[#6e6e73] flex-shrink-0 hidden sm:inline">
            {currentStep.label}
          </span>
        </div>
      </div>

      <main className="surface-canvas min-h-screen pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="reading-col px-6 pt-14"
          >
            {/* eyebrow + step number */}
            <div className="flex items-center gap-3">
              <span className="eyebrow">{currentStep.label}</span>
              <span className="text-[#d2d2d7]">·</span>
              <div className="flex gap-1.5">
                {currentStep.dimensions.map((d) => (
                  <span
                    key={d}
                    className="text-[11px] text-[#6e6e73] bg-[#f5f5f7] px-2 py-0.5 rounded-full"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>

            {/* Hero question */}
            <h1 className="display display-tight mt-5 text-[#1d1d1f] text-[34px] sm:text-[44px]">
              {currentStep.question}
            </h1>
            <p className="mt-5 text-[17px] text-[#6e6e73] leading-[1.55] max-w-xl">
              {currentStep.why}
            </p>

            {/* Brief de Camila — visible in step 1 inline, then collapses */}
            {currentStep.id === 1 && (
              <div className="mt-10 card-apple bg-white p-6">
                <div className="flex items-start gap-4">
                  <Avatar
                    size="sm"
                    className="bg-[#ff5e62] text-white text-[13px] font-semibold flex-shrink-0"
                    name="C"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-[12px] text-[#86868b]">
                      <span className="text-[#1d1d1f] font-medium">
                        Camila · VP of Growth
                      </span>
                      <span>·</span>
                      <span className="mono">jue 4:30 PM</span>
                    </div>
                    <p className="mt-2 text-[15px] text-[#1d1d1f] leading-[1.55]">
                      "hey, necesito 3 ángulos para LinkedIn ads + 1 email a la
                      lista de prospects para mañana 9 AM. revisa el feedback
                      que CS nos pasó hace 2 meses, ahí está todo.{" "}
                      <span className="text-[#ff5e62]">
                        no me metas a legal hoy, ya están cerrados
                      </span>
                      , confío en tu criterio."
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ============ STEP 1: SCOPE FIELDS ============ */}
            {currentStep.id === 1 && (
              <div className="mt-12">
                <div className="eyebrow mb-3">dataset · 60 filas · 6 campos</div>
                <div className="card-apple bg-white overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr className="border-b border-black/[0.06] bg-[#fafafa]">
                          <th className="text-left font-medium text-[#6e6e73] px-4 py-3">
                            name
                          </th>
                          <th className="text-left font-medium text-[#6e6e73] px-4 py-3">
                            email
                          </th>
                          <th className="text-left font-medium text-[#6e6e73] px-4 py-3">
                            company
                          </th>
                          <th className="text-left font-medium text-[#6e6e73] px-4 py-3 hidden sm:table-cell">
                            complaint
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {SAMPLE_FEEDBACK_ROWS.slice(0, 3).map((r) => (
                          <tr
                            key={r.email}
                            className="border-b border-black/[0.04] last:border-b-0"
                          >
                            <td className="px-4 py-3 text-[#1d1d1f]">
                              {r.name}
                            </td>
                            <td className="px-4 py-3 text-[#6e6e73]">
                              {r.email}
                            </td>
                            <td className="px-4 py-3 text-[#6e6e73]">
                              {r.company}
                            </td>
                            <td className="px-4 py-3 text-[#6e6e73] hidden sm:table-cell truncate max-w-xs">
                              {r.complaint.slice(0, 60)}…
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-10">
                  <div className="eyebrow mb-4">tu decisión por campo</div>
                  <div className="space-y-3">
                    {FIELDS.map((f) => (
                      <div
                        key={f.key}
                        className="card-apple bg-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                      >
                        <div className="sm:w-56 flex-shrink-0">
                          <div className="flex items-center gap-2">
                            <span className="mono text-[13px] text-[#1d1d1f] font-medium">
                              {f.key}
                            </span>
                            {f.pii && (
                              <span
                                className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
                                style={{
                                  color: "var(--accent)",
                                  backgroundColor: "var(--accent-soft)",
                                }}
                              >
                                PII
                              </span>
                            )}
                          </div>
                          <p className="text-[12px] text-[#86868b] mt-0.5">
                            {f.desc}
                          </p>
                        </div>
                        <RadioGroup
                          aria-label={`acción para ${f.key}`}
                          orientation="horizontal"
                          value={fieldActions[f.key] || ""}
                          onValueChange={(v) =>
                            setFieldActions({ ...fieldActions, [f.key]: v })
                          }
                          classNames={{
                            wrapper: "gap-2 flex-wrap",
                          }}
                        >
                          {FIELD_OPTIONS.map((opt) => (
                            <Radio
                              key={opt}
                              value={opt}
                              size="sm"
                              classNames={{
                                base: "m-0 max-w-fit cursor-pointer rounded-full border border-[#e5e5ea] data-[selected=true]:bg-[var(--accent-soft)] data-[selected=true]:border-[var(--accent)] px-3 py-1.5",
                                labelWrapper: "ml-1.5",
                                label:
                                  "text-[13px] text-[#1d1d1f] font-medium",
                              }}
                            >
                              {opt}
                            </Radio>
                          ))}
                        </RadioGroup>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ============ STEP 2: PROMPT + RESPONSE ============ */}
            {currentStep.id === 2 && (
              <div className="mt-12 space-y-8">
                <div>
                  <div className="eyebrow mb-3">tu prompt</div>
                  <Textarea
                    placeholder="escribe el prompt que le mandarías al GPT corporativo aprobado por IT…"
                    value={userPrompt}
                    onValueChange={setUserPrompt}
                    minRows={6}
                    isDisabled={modelResponse !== null}
                    classNames={{
                      inputWrapper:
                        "bg-white border border-[#e5e5ea] data-[hover=true]:border-[#d2d2d7] group-data-[focus=true]:border-[var(--accent)] shadow-none",
                      input:
                        "text-[15px] text-[#1d1d1f] placeholder:text-[#86868b]",
                    }}
                  />
                  {!modelResponse && (
                    <div className="mt-3 flex justify-end">
                      <Button
                        radius="full"
                        size="md"
                        onPress={sendPrompt}
                        isLoading={isModelThinking}
                        isDisabled={!userPrompt.trim()}
                        className="accent-bg text-white px-5 h-10 text-[14px] font-medium"
                      >
                        {isModelThinking ? "pensando…" : "enviar al modelo →"}
                      </Button>
                    </div>
                  )}
                </div>

                {modelResponse && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <div className="eyebrow mb-3">respuesta del modelo</div>
                      <div className="card-apple bg-[#fafafa] p-6">
                        <pre className="text-[14px] text-[#1d1d1f] leading-[1.6] whitespace-pre-wrap font-sans">
                          {modelResponse}
                        </pre>
                      </div>
                    </div>
                    <div>
                      <div className="eyebrow mb-3">
                        tu siguiente paso · qué harás con esto
                      </div>
                      <Textarea
                        placeholder="¿usar tal cual? validar algo? descartar? por qué…"
                        value={followupText}
                        onValueChange={setFollowupText}
                        minRows={4}
                        classNames={{
                          inputWrapper:
                            "bg-white border border-[#e5e5ea] data-[hover=true]:border-[#d2d2d7] group-data-[focus=true]:border-[var(--accent)] shadow-none",
                          input:
                            "text-[15px] text-[#1d1d1f] placeholder:text-[#86868b]",
                        }}
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* ============ STEP 3: REVIEW FLAGS ============ */}
            {currentStep.id === 3 && (
              <div className="mt-12 space-y-6">
                {SEGMENTS.map((seg) => (
                  <div key={seg.id} className="card-apple bg-white p-6">
                    <h3 className="text-[16px] font-semibold text-[#1d1d1f]">
                      {seg.title}
                    </h3>
                    <p className="mt-2 text-[14px] text-[#6e6e73] leading-[1.6]">
                      {seg.body}
                    </p>
                    <div className="mt-5 pt-5 border-t border-black/[0.06]">
                      <div className="eyebrow mb-3">
                        ¿qué le ves a este ángulo?
                      </div>
                      <CheckboxGroup
                        aria-label={`flags para ${seg.title}`}
                        value={segmentFlags[seg.id] || []}
                        onValueChange={(v) =>
                          setSegmentFlags({
                            ...segmentFlags,
                            [seg.id]: v as string[],
                          })
                        }
                        orientation="horizontal"
                        classNames={{ wrapper: "gap-2 flex-wrap" }}
                      >
                        {REVIEW_TARGETS.map((t) => (
                          <Checkbox
                            key={t.id}
                            value={t.id}
                            size="sm"
                            classNames={{
                              base: "m-0 max-w-fit cursor-pointer rounded-full border border-[#e5e5ea] data-[selected=true]:bg-[var(--accent-soft)] data-[selected=true]:border-[var(--accent)] px-3 py-1.5",
                              wrapper: "hidden",
                              label:
                                "text-[13px] text-[#1d1d1f] font-medium",
                            }}
                          >
                            {t.label}
                          </Checkbox>
                        ))}
                      </CheckboxGroup>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ============ STEP 4: ENTREGA ============ */}
            {currentStep.id === 4 && (
              <div className="mt-12">
                <RadioGroup
                  aria-label="opción de entrega"
                  value={option4}
                  onValueChange={setOption4}
                  classNames={{ wrapper: "gap-3" }}
                >
                  {ENTREGA_OPTIONS.map((opt) => {
                    const selected = option4 === opt.id;
                    return (
                      <Card
                        key={opt.id}
                        className={`card-apple bg-white cursor-pointer transition-all ${
                          selected ? "ring-2" : ""
                        }`}
                        style={
                          selected
                            ? {
                                borderColor: "var(--accent)",
                                boxShadow: "0 0 0 4px var(--accent-ring)",
                              }
                            : undefined
                        }
                        shadow="none"
                      >
                        <CardBody className="p-5">
                          <Radio
                            value={opt.id}
                            size="md"
                            classNames={{
                              wrapper: "border-[#d2d2d7]",
                              labelWrapper: "ml-2",
                            }}
                          >
                            <div>
                              <div className="text-[15px] font-medium text-[#1d1d1f]">
                                {opt.label}
                              </div>
                              <div className="text-[13px] text-[#6e6e73] mt-0.5">
                                {opt.sub}
                              </div>
                            </div>
                          </Radio>
                        </CardBody>
                      </Card>
                    );
                  })}
                </RadioGroup>
              </div>
            )}

            {/* ============ STEP 5: OPEN RESPONSE ============ */}
            {currentStep.id === 5 && (
              <div className="mt-12 space-y-6">
                <div className="card-apple bg-white p-6">
                  <div className="flex items-start gap-4">
                    <Avatar
                      size="sm"
                      className="bg-[#ff5e62] text-white text-[13px] font-semibold flex-shrink-0"
                      name="C"
                    />
                    <div className="flex-1">
                      <div className="text-[12px] text-[#86868b]">
                        <span className="text-[#1d1d1f] font-medium">
                          Camila · VP of Growth
                        </span>
                        <span className="mx-1.5">·</span>
                        <span className="mono">vie 8:12 AM</span>
                      </div>
                      <p className="mt-2 text-[15px] text-[#1d1d1f] leading-[1.6]">
                        "perfectos los ángulos. una más:{" "}
                        <span className="font-medium">
                          segmentemos por revenue_potential
                        </span>{" "}
                        para mandar el email solo a los que valgan más de $50k.
                        eso lo armas con la misma data, ¿cierto?"
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="eyebrow mb-3">tu respuesta a Camila</div>
                  <Textarea
                    placeholder="responde como lo harías por slack en este momento…"
                    value={step5Text}
                    onValueChange={setStep5Text}
                    minRows={6}
                    classNames={{
                      inputWrapper:
                        "bg-white border border-[#e5e5ea] data-[hover=true]:border-[#d2d2d7] group-data-[focus=true]:border-[var(--accent)] shadow-none",
                      input:
                        "text-[15px] text-[#1d1d1f] placeholder:text-[#86868b]",
                    }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Sticky bottom action bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-xl border-t border-black/[0.06]">
        <div className="reading-col px-6 py-4 flex items-center justify-between">
          <div className="text-[12px] text-[#86868b]">
            {!canAdvance && (
              <span>completa esta pantalla para continuar</span>
            )}
          </div>
          <Button
            radius="full"
            size="lg"
            onPress={next}
            isDisabled={!canAdvance}
            className={`h-11 px-6 text-[14px] font-medium ${
              canAdvance
                ? "accent-bg text-white hover:opacity-90"
                : "bg-[#f5f5f7] text-[#86868b]"
            } shadow-none btn-hover-shift`}
          >
            {stepIndex === STEPS.length - 1 ? "terminar caso" : "siguiente"} →
          </Button>
        </div>
      </div>
    </>
  );
}

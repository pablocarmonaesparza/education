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
    label: "Preparar datos",
    sub: "Decide qué pasa al modelo.",
    question: "¿Qué del dataset le pasas al modelo?",
    why: "El dataset tiene 6 campos. Tres incluyen datos personales (PII). Pegárselo crudo al LLM es exposición regulatoria. Tu primer movimiento es scopear qué entra y qué no.",
    dimensions: ["Privacidad", "Contexto"],
  },
  {
    id: 2,
    key: "llm_beat",
    label: "Interacción con la IA",
    sub: "Redacta el prompt y lee la respuesta.",
    question: "Redacta tu prompt al modelo.",
    why: "Este es el beat real con el LLM. La calidad del prompt define el output. Después tienes que decidir qué del output usas, descartas o validas.",
    dimensions: ["Contexto", "Privacidad", "Validación", "Juicio", "Decisión"],
  },
  {
    id: 3,
    key: "artifact_review",
    label: "Revisar el output",
    sub: "Marca los problemas del modelo.",
    question: "El modelo te dio 3 ángulos. ¿Qué NO enviarías tal cual?",
    why: "El LLM redacta con confianza pero inventa cifras, generaliza y a veces expone datos sensibles. Tu trabajo es discriminar lo bloqueante de lo cosmético.",
    dimensions: ["Validación", "Privacidad", "Juicio"],
  },
  {
    id: 4,
    key: "decision_select",
    label: "Entrega",
    sub: "Define cómo se lo das a Camila.",
    question: "¿Cómo le entregas los ángulos a Camila?",
    why: "Una decisión clara con disclaimers vs. un dump genérico. El formato comunica tu criterio (o la falta de él).",
    dimensions: ["Decisión", "Juicio"],
  },
  {
    id: 5,
    key: "decision_open_short",
    label: "Follow-up",
    sub: "Responde al VP.",
    question: "Camila te pide algo que cruza línea. ¿Cómo respondes?",
    why: "El momento más sutil del caso. Usar revenue para targeting sin consentimiento es problemático. Cómo objetas (o no) define tu criterio sobre autoridad y riesgo.",
    dimensions: ["Privacidad", "Juicio", "Decisión"],
  },
];

const FIELD_OPTIONS = ["Usar tal cual", "Transformar", "Descartar"] as const;

const FIELDS = [
  { key: "name", desc: "Identificador personal.", pii: true },
  { key: "email", desc: "Contacto directo.", pii: true },
  { key: "company", desc: "Razón social.", pii: true },
  { key: "complaint_or_praise", desc: "Texto libre del cliente.", pii: false },
  { key: "revenue_potential_usd", desc: "Valor comercial estimado.", pii: false },
  { key: "signed_at", desc: "Fecha de firma.", pii: false },
];

const MODEL_RESPONSE_SAMPLE = `Basado en el análisis del feedback de clientes, aquí están 3 ángulos para tu campaña:

1. "Resuelve el cuello de botella que tu CFO ve antes que tú"
Insight: 41% de los clientes reportan que el módulo de reportes se traba bajo carga. CFOs y heads of finance pierden visibilidad justo cuando más la necesitan. El gap real es performance, no features.

2. "WhatsApp Business: tu canal más grande sigue desatendido"
Insight: La integración con WhatsApp Business es la solicitud #1 de clientes LATAM con presencia en Colombia, México y Argentina.

3. "Onboarding caótico, adopción imparable"
Insight: 8 de cada 10 clientes describe el onboarding como difícil — pero 0 quiere volver atrás después de 2 semanas. La paradoja vende: dolor inicial × retención brutal.`;

const REVIEW_TARGETS = [
  { id: "unverifiable_claim", label: "Cifra sin evidencia" },
  { id: "exposed_sensitive_data", label: "Dato sensible expuesto" },
  { id: "weak_segment_logic", label: "Segmentación débil" },
  { id: "generic_positioning", label: "Posicionamiento genérico" },
];

const SEGMENTS = [
  {
    id: 0,
    title: 'Ángulo 1 — "Resuelve el cuello de botella…"',
    body: "41% de los clientes reportan que el módulo de reportes se traba bajo carga. CFOs y heads of finance pierden visibilidad.",
  },
  {
    id: 1,
    title: 'Ángulo 2 — "WhatsApp Business desatendido"',
    body: "La integración con WhatsApp Business es la solicitud #1 de clientes LATAM. Empresas como DigitalUp no pueden escalar.",
  },
  {
    id: 2,
    title: 'Ángulo 3 — "Onboarding caótico, adopción imparable"',
    body: "8 de cada 10 clientes describe el onboarding como difícil — pero 0 quiere volver atrás después de 2 semanas.",
  },
];

const ENTREGA_OPTIONS = [
  {
    id: "clean_bullets",
    label: "Los 3 ángulos finales en bullets.",
    sub: "Listos para campaña, sin contexto adicional.",
  },
  {
    id: "bullets_with_context",
    label: "3 ángulos + nota de qué validaste.",
    sub: "Qué descartaste y qué riesgo viste.",
  },
  {
    id: "bullets_plus_legal_flag",
    label: "3 ángulos + flag a Legal.",
    sub: "Sugerir review antes de lanzar.",
  },
  {
    id: "raw_llm_output",
    label: "Output crudo del LLM.",
    sub: "Ella decide qué usar.",
  },
];

// ============ SECTIONS + INTRO SLIDES ============

type SectionId = "intro" | "step1" | "step2" | "step3" | "step4" | "step5";

const SECTIONS: { id: SectionId; label: string }[] = [
  { id: "intro", label: "Introducción" },
  { id: "step1", label: STEPS[0].label },
  { id: "step2", label: STEPS[1].label },
  { id: "step3", label: STEPS[2].label },
  { id: "step4", label: STEPS[3].label },
  { id: "step5", label: STEPS[4].label },
];

const INTRO_SLIDES = [
  { id: 1, key: "presentacion" },
  { id: 2, key: "rol" },
  { id: 3, key: "situacion" },
  { id: 4, key: "pasos" },
  { id: 5, key: "reglas" },
];

// ============ PAGE ============

export default function RuntimePage() {
  // Section + intro slide state
  const [sectionIdx, setSectionIdx] = useState(0); // 0 = intro
  const [introSlide, setIntroSlide] = useState(1); // 1..5
  const [maxReached, setMaxReached] = useState(0); // furthest section visited

  // Step data state
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

  const currentSection = SECTIONS[sectionIdx];
  const currentStep =
    sectionIdx === 0 ? null : STEPS[sectionIdx - 1];

  function goToSection(idx: number) {
    if (idx <= maxReached) {
      setSectionIdx(idx);
      if (idx === 0) setIntroSlide(1);
    }
  }

  function advanceSection() {
    const nextIdx = sectionIdx + 1;
    if (nextIdx <= SECTIONS.length - 1) {
      setSectionIdx(nextIdx);
      setMaxReached((m) => Math.max(m, nextIdx));
    } else {
      // finished step5 -> evaluating
      setIsEvaluating(true);
      setTimeout(() => {
        setIsEvaluating(false);
        setShowResults(true);
      }, 2400);
    }
  }

  function nextIntroSlide() {
    if (introSlide < INTRO_SLIDES.length) {
      setIntroSlide((s) => s + 1);
    } else {
      advanceSection(); // moves to step1
    }
  }

  function prevIntroSlide() {
    if (introSlide > 1) setIntroSlide((s) => s - 1);
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
    if (!currentStep) return introSlide === INTRO_SLIDES.length;
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
    currentStep,
    introSlide,
    fieldActions,
    modelResponse,
    followupText,
    segmentFlags,
    option4,
    step5Text,
  ]);

  // Top progress: combine intro slides + steps progress.
  const totalUnits = INTRO_SLIDES.length + STEPS.length; // 10
  const completedUnits =
    sectionIdx === 0
      ? introSlide - 1
      : INTRO_SLIDES.length +
        (sectionIdx - 1) +
        (canAdvance ? 1 : 0);
  const progressPct = (completedUnits / totalUnits) * 100;

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
              Evaluando tu sesión.
            </h2>
            <p className="mt-3 text-[15px] text-[#6e6e73]">
              Comparando tus 5 decisiones contra la rúbrica…
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
              <div className="eyebrow mt-8">Caso terminado</div>
              <h1 className="display mt-4 text-[40px] sm:text-[56px] text-[#1d1d1f]">
                Gracias por participar.
              </h1>
              <p className="mt-5 text-[17px] text-[#6e6e73] max-w-lg mx-auto">
                Tu reporte está listo. Lo encontrarás en tu cuenta y en el
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
                  Ver mi reporte →
                </Button>
                <Button
                  as="a"
                  href="/simulator-design/dashboard"
                  radius="full"
                  variant="bordered"
                  size="lg"
                  className="h-12 px-7 border-[#d2d2d7] text-[#1d1d1f] bg-white text-[15px]"
                >
                  Vista del manager
                </Button>
              </div>
            </motion.div>
          </div>
        </main>
      </>
    );
  }

  // ============ MAIN RUNTIME (intro + steps) ============
  return (
    <>
      <SurfaceNav />

      {/* Full-width slim top progress */}
      <div className="sticky top-14 z-30 bg-white/90 backdrop-blur-xl border-b border-black/[0.06]">
        <Progress
          aria-label="Progreso del caso"
          value={progressPct}
          classNames={{
            base: "max-w-full",
            track: "h-[3px] bg-transparent rounded-none",
            indicator: "accent-bg rounded-none",
          }}
        />
        <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center justify-between gap-4 text-[12px]">
          <span className="mono text-[#86868b]">
            {sectionIdx === 0
              ? `Instrucciones · ${introSlide} / ${INTRO_SLIDES.length}`
              : `Paso ${sectionIdx} / ${STEPS.length}`}
          </span>
          <span className="text-[#6e6e73] hidden sm:inline">
            {sectionIdx === 0 ? "Introducción" : currentStep?.label}
          </span>
        </div>
      </div>

      {/* Layout: sidebar + content */}
      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar */}
        <aside className="hidden md:block flex-shrink-0 w-60 border-r border-black/[0.06]">
          <div className="sticky top-[100px] py-10 px-6">
            <div className="eyebrow mb-4">Secciones</div>
            <nav className="space-y-1">
              {SECTIONS.map((s, i) => {
                const reached = i <= maxReached;
                const isCurrent = i === sectionIdx;
                const isCompleted = i < maxReached;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => goToSection(i)}
                    disabled={!reached}
                    className={`group w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-[13px] transition-colors ${
                      isCurrent
                        ? "bg-[var(--accent-soft)] text-[#1d1d1f] font-medium"
                        : reached
                          ? "text-[#1d1d1f] hover:bg-[#f5f5f7]"
                          : "text-[#c7c7cc] cursor-not-allowed"
                    }`}
                  >
                    <span
                      className={`flex-shrink-0 h-5 w-5 rounded-full grid place-items-center text-[10px] mono font-semibold ${
                        isCurrent
                          ? "accent-bg text-white"
                          : isCompleted
                            ? "bg-[#0a7e3a] text-white"
                            : reached
                              ? "bg-[#f5f5f7] text-[#1d1d1f]"
                              : "bg-[#fafafa] text-[#c7c7cc]"
                      }`}
                    >
                      {isCompleted ? (
                        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
                          <path
                            d="M2.5 6.5L4.8 8.7L9.5 3.5"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : i === 0 ? (
                        "·"
                      ) : (
                        i
                      )}
                    </span>
                    <span className="truncate">{s.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-10 pt-6 border-t border-black/[0.06]">
              <div className="eyebrow mb-2">Evaluamos</div>
              <ul className="space-y-1 text-[12px] text-[#6e6e73]">
                <li>· Contexto</li>
                <li>· Privacidad</li>
                <li>· Validación</li>
                <li>· Juicio</li>
                <li>· Decisión</li>
              </ul>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 surface-canvas pb-32">
          <AnimatePresence mode="wait">
            {/* ============ INTRO SLIDES ============ */}
            {sectionIdx === 0 && (
              <motion.div
                key={`intro-${introSlide}`}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-2xl mx-auto px-6 pt-16"
              >
                {introSlide === 1 && (
                  <>
                    <div className="eyebrow">
                      Caso 01 · Marketing · 18 min
                    </div>
                    <h1 className="display display-tight mt-5 text-[40px] sm:text-[56px] text-[#1d1d1f]">
                      Campaña urgente con
                      <br />
                      feedback de clientes.
                    </h1>
                    <p className="mt-8 text-[19px] text-[#6e6e73] leading-[1.55] max-w-xl">
                      Vas a interpretar el rol de un Marketing Manager bajo
                      presión. No hay respuesta única correcta: evaluamos tu
                      criterio.
                    </p>
                  </>
                )}

                {introSlide === 2 && (
                  <>
                    <div className="eyebrow">Tu rol</div>
                    <h2 className="display display-tight mt-5 text-[32px] sm:text-[40px] text-[#1d1d1f]">
                      Marketing Manager en Loop.
                    </h2>
                    <p className="mt-8 text-[17px] text-[#1d1d1f] leading-[1.7]">
                      Eres{" "}
                      <span className="font-medium">Marketing Manager</span> en{" "}
                      <span className="font-medium">Loop</span>, una SaaS B2B
                      mid-market (120 empleados) que vende plataforma de
                      atención al cliente con IA en LATAM.
                    </p>
                    <p className="mt-5 text-[16px] text-[#6e6e73] leading-[1.7]">
                      Tu equipo de growth es de 6 personas. Reportas a{" "}
                      <span className="text-[#1d1d1f]">
                        Camila, VP of Growth
                      </span>
                      . El gobierno de IA en tu empresa es informal: hay GPT
                      corporativo aprobado por IT, pero los criterios viven en
                      cada manager.
                    </p>
                  </>
                )}

                {introSlide === 3 && (
                  <>
                    <div className="eyebrow">Qué está pasando</div>
                    <h2 className="display display-tight mt-5 text-[32px] sm:text-[40px] text-[#1d1d1f]">
                      Jueves · 4:30 PM.
                      <br />
                      <span className="text-[#6e6e73]">
                        Quedan 16 horas hasta el deadline.
                      </span>
                    </h2>
                    <p className="mt-8 text-[17px] text-[#1d1d1f] leading-[1.7]">
                      Camila te escribe por Slack pidiéndote{" "}
                      <span className="font-medium">
                        3 ángulos para LinkedIn Ads + 1 email a prospects
                      </span>{" "}
                      para mañana 9 AM. Tienes acceso a un dataset de 60 filas
                      con feedback de clientes (PII incluido).
                    </p>
                    <div className="mt-8 card-apple bg-white p-5">
                      <div className="flex items-start gap-4">
                        <Avatar
                          size="sm"
                          className="bg-[#ff5e62] text-white text-[13px] font-semibold flex-shrink-0"
                          name="C"
                        />
                        <p className="text-[15px] text-[#1d1d1f] leading-[1.6] italic">
                          «No me metas a Legal hoy, ya están cerrados. Confío
                          en tu criterio.»
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {introSlide === 4 && (
                  <>
                    <div className="eyebrow">Cómo vas a avanzar</div>
                    <h2 className="display display-tight mt-5 text-[32px] sm:text-[40px] text-[#1d1d1f]">
                      Cinco pasos.
                    </h2>
                    <ol className="mt-10 space-y-5">
                      {STEPS.map((s) => (
                        <li
                          key={s.id}
                          className="flex items-start gap-5 pb-5 border-b border-black/[0.06] last:border-0 last:pb-0"
                        >
                          <div className="flex-shrink-0 mt-1 mono text-[15px] text-[#86868b] font-medium w-8">
                            {String(s.id).padStart(2, "0")}
                          </div>
                          <div>
                            <div className="text-[17px] text-[#1d1d1f] font-medium">
                              {s.label}
                            </div>
                            <div className="text-[15px] text-[#6e6e73] mt-1">
                              {s.sub}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </>
                )}

                {introSlide === 5 && (
                  <>
                    <div className="eyebrow">Reglas</div>
                    <h2 className="display display-tight mt-5 text-[32px] sm:text-[40px] text-[#1d1d1f]">
                      Antes de empezar.
                    </h2>
                    <ul className="mt-10 space-y-5 text-[17px] text-[#1d1d1f] leading-[1.65]">
                      <li className="flex items-start gap-4">
                        <span
                          className="flex-shrink-0 mt-2 h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: "var(--accent)" }}
                        />
                        <span>Responde como lo harías en tu trabajo real.</span>
                      </li>
                      <li className="flex items-start gap-4">
                        <span
                          className="flex-shrink-0 mt-2 h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: "var(--accent)" }}
                        />
                        <span>
                          Puedes volver a una sección anterior desde el menú
                          lateral, pero solo a las que ya has visitado.
                        </span>
                      </li>
                      <li className="flex items-start gap-4">
                        <span
                          className="flex-shrink-0 mt-2 h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: "var(--accent)" }}
                        />
                        <span>
                          El modelo responde una vez por interacción. Trabaja
                          con lo que te dé.
                        </span>
                      </li>
                      <li className="flex items-start gap-4">
                        <span
                          className="flex-shrink-0 mt-2 h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: "var(--accent)" }}
                        />
                        <span>
                          Evaluamos en 5 dimensiones: contexto, privacidad,
                          validación, juicio y decisión.
                        </span>
                      </li>
                    </ul>
                  </>
                )}
              </motion.div>
            )}

            {/* ============ STEP CONTENT ============ */}
            {sectionIdx > 0 && currentStep && (
              <motion.div
                key={`step-${currentStep.id}`}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-2xl mx-auto px-6 pt-14"
              >
                {/* eyebrow + dimensions */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="eyebrow">{currentStep.label}</span>
                  <span className="text-[#d2d2d7]">·</span>
                  <div className="flex gap-1.5 flex-wrap">
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

                <h1 className="display display-tight mt-5 text-[#1d1d1f] text-[32px] sm:text-[40px]">
                  {currentStep.question}
                </h1>
                <p className="mt-5 text-[17px] text-[#6e6e73] leading-[1.55] max-w-xl">
                  {currentStep.why}
                </p>

                {/* Brief de Camila en step 1 */}
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
                          <span className="mono">Jue 4:30 PM</span>
                        </div>
                        <p className="mt-2 text-[15px] text-[#1d1d1f] leading-[1.55]">
                          «Hey, necesito 3 ángulos para LinkedIn Ads + 1 email
                          a la lista de prospects para mañana 9 AM. Revisa el
                          feedback que CS nos pasó hace 2 meses, ahí está
                          todo.{" "}
                          <span className="text-[#ff5e62]">
                            No me metas a Legal hoy, ya están cerrados
                          </span>
                          . Confío en tu criterio.»
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ============ STEP 1: SCOPE FIELDS ============ */}
                {currentStep.id === 1 && (
                  <div className="mt-12">
                    <div className="eyebrow mb-3">
                      Dataset · 60 filas · 6 campos
                    </div>
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
                      <div className="eyebrow mb-4">Tu decisión por campo</div>
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
                              aria-label={`Acción para ${f.key}`}
                              orientation="horizontal"
                              value={fieldActions[f.key] || ""}
                              onValueChange={(v) =>
                                setFieldActions({
                                  ...fieldActions,
                                  [f.key]: v,
                                })
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
                      <div className="eyebrow mb-3">Tu prompt</div>
                      <Textarea
                        placeholder="Escribe el prompt que le mandarías al GPT corporativo aprobado por IT…"
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
                            {isModelThinking
                              ? "Pensando…"
                              : "Enviar al modelo →"}
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
                          <div className="eyebrow mb-3">
                            Respuesta del modelo
                          </div>
                          <div className="card-apple bg-[#fafafa] p-6">
                            <pre className="text-[14px] text-[#1d1d1f] leading-[1.6] whitespace-pre-wrap font-sans">
                              {modelResponse}
                            </pre>
                          </div>
                        </div>
                        <div>
                          <div className="eyebrow mb-3">
                            Tu siguiente paso · qué harás con esto
                          </div>
                          <Textarea
                            placeholder="¿Usar tal cual? ¿Validar algo? ¿Descartar? ¿Por qué?"
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
                            ¿Qué le ves a este ángulo?
                          </div>
                          <CheckboxGroup
                            aria-label={`Flags para ${seg.title}`}
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
                      aria-label="Opción de entrega"
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
                            <span className="mono">Vie 8:12 AM</span>
                          </div>
                          <p className="mt-2 text-[15px] text-[#1d1d1f] leading-[1.6]">
                            «Perfectos los ángulos. Una más:{" "}
                            <span className="font-medium">
                              segmentemos por revenue_potential
                            </span>{" "}
                            para mandar el email solo a los que valgan más de
                            $50k. Eso lo armas con la misma data, ¿cierto?»
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="eyebrow mb-3">Tu respuesta a Camila</div>
                      <Textarea
                        placeholder="Responde como lo harías por Slack en este momento…"
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
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Sticky bottom action bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-xl border-t border-black/[0.06]">
        <div className="max-w-7xl mx-auto md:pl-60 px-6 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
            {/* Anterior */}
            {sectionIdx === 0 && introSlide > 1 ? (
              <Button
                radius="full"
                size="lg"
                variant="bordered"
                onPress={prevIntroSlide}
                className="h-11 px-5 text-[14px] font-medium border-[#d2d2d7] text-[#1d1d1f] bg-white"
              >
                ← Anterior
              </Button>
            ) : sectionIdx > 0 ? (
              <Button
                radius="full"
                size="lg"
                variant="bordered"
                onPress={() => goToSection(sectionIdx - 1)}
                className="h-11 px-5 text-[14px] font-medium border-[#d2d2d7] text-[#1d1d1f] bg-white"
              >
                ← Anterior
              </Button>
            ) : (
              <span className="text-[12px] text-[#86868b]">
                {!canAdvance && sectionIdx > 0 && "Completa para avanzar."}
              </span>
            )}

            {/* Siguiente / Empezar caso / Terminar */}
            {sectionIdx === 0 ? (
              <Button
                radius="full"
                size="lg"
                onPress={nextIntroSlide}
                className="accent-bg text-white h-11 px-6 text-[14px] font-medium shadow-none btn-hover-shift"
              >
                {introSlide === INTRO_SLIDES.length
                  ? "Empezar caso"
                  : "Siguiente"}{" "}
                →
              </Button>
            ) : (
              <Button
                radius="full"
                size="lg"
                onPress={advanceSection}
                isDisabled={!canAdvance}
                className={`h-11 px-6 text-[14px] font-medium ${
                  canAdvance
                    ? "accent-bg text-white hover:opacity-90"
                    : "bg-[#f5f5f7] text-[#86868b]"
                } shadow-none btn-hover-shift`}
              >
                {sectionIdx === SECTIONS.length - 1
                  ? "Terminar caso"
                  : "Siguiente"}{" "}
                →
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

"use client";

import { useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  Checkbox,
  CheckboxGroup,
  Radio,
  RadioGroup,
  Textarea,
} from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";
import { SurfaceNav } from "../../_components/SurfaceNav";

// ============ DATA ============

const FIELD_OPTIONS = ["Usar tal cual", "Transformar", "Descartar"] as const;

const FIELDS = [
  {
    key: "name",
    label: "name",
    desc: "Identificador personal del cliente.",
    pii: true,
  },
  {
    key: "email",
    label: "email",
    desc: "Contacto directo del cliente.",
    pii: true,
  },
  {
    key: "company",
    label: "company",
    desc: "Razón social de la empresa.",
    pii: true,
  },
  {
    key: "complaint_or_praise",
    label: "complaint_or_praise",
    desc: "Texto libre del cliente sobre el producto.",
    pii: false,
  },
  {
    key: "revenue_potential_usd",
    label: "revenue_potential_usd",
    desc: "Valor comercial estimado del cliente.",
    pii: false,
  },
  {
    key: "signed_at",
    label: "signed_at",
    desc: "Fecha en que el cliente firmó el contrato.",
    pii: false,
  },
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
    body: "41% de los clientes reportan que el módulo de reportes se traba bajo carga. CFOs y heads of finance pierden visibilidad justo cuando más la necesitan.",
  },
  {
    id: 1,
    title: 'Ángulo 2 — "WhatsApp Business desatendido"',
    body: "La integración con WhatsApp Business es la solicitud #1 de clientes LATAM. Empresas como DigitalUp no pueden escalar al canal donde están sus clientes.",
  },
  {
    id: 2,
    title: 'Ángulo 3 — "Onboarding caótico, adopción imparable"',
    body: "8 de cada 10 clientes describe el onboarding como difícil — pero 0 quiere volver atrás después de 2 semanas. La paradoja vende.",
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

// ============ SECTIONS ============

type SectionId = "intro" | "step1" | "step2" | "step3" | "step4" | "step5";

// Each section declares how many slides it has.
// Slide content is rendered by switch inside the page.
const SECTIONS: { id: SectionId; label: string; slides: number }[] = [
  { id: "intro", label: "Contexto", slides: 5 },
  { id: "step1", label: "Datos", slides: 2 + FIELDS.length }, // intro + dataset preview + 6 fields = 8
  { id: "step2", label: "IA", slides: 3 },
  { id: "step3", label: "Revisión", slides: SEGMENTS.length }, // 3
  { id: "step4", label: "Decisión", slides: 1 },
  { id: "step5", label: "Respuesta", slides: 2 },
];

// ============ PAGE ============

export default function RuntimePage() {
  const [sectionIdx, setSectionIdx] = useState(0);
  const [slideIdx, setSlideIdx] = useState(0);
  const [maxReached, setMaxReached] = useState(0);

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

  function goToSection(idx: number) {
    if (idx <= maxReached) {
      setSectionIdx(idx);
      setSlideIdx(0);
    }
  }

  function advanceSection() {
    const nextIdx = sectionIdx + 1;
    if (nextIdx <= SECTIONS.length - 1) {
      setSectionIdx(nextIdx);
      setSlideIdx(0);
      setMaxReached((m) => Math.max(m, nextIdx));
    } else {
      setIsEvaluating(true);
      setTimeout(() => {
        setIsEvaluating(false);
        setShowResults(true);
      }, 2400);
    }
  }

  function nextSlide() {
    if (slideIdx < currentSection.slides - 1) {
      setSlideIdx((s) => s + 1);
    } else {
      advanceSection();
    }
  }

  function prevSlide() {
    if (slideIdx > 0) {
      setSlideIdx((s) => s - 1);
    } else if (sectionIdx > 0) {
      const prevSectionIdx = sectionIdx - 1;
      setSectionIdx(prevSectionIdx);
      setSlideIdx(SECTIONS[prevSectionIdx].slides - 1);
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

  // ============ CAN ADVANCE PER SLIDE ============
  const canAdvance = useMemo(() => {
    if (currentSection.id === "intro") return true; // reading slides
    if (currentSection.id === "step1") {
      if (slideIdx === 0) return true; // brief
      if (slideIdx === 1) return true; // dataset preview
      const field = FIELDS[slideIdx - 2];
      return field ? !!fieldActions[field.key] : false;
    }
    if (currentSection.id === "step2") {
      if (slideIdx === 0)
        return userPrompt.trim().length > 5 && modelResponse !== null;
      if (slideIdx === 1) return modelResponse !== null;
      if (slideIdx === 2) return followupText.trim().length > 10;
    }
    if (currentSection.id === "step3") {
      const flags = segmentFlags[slideIdx];
      return Array.isArray(flags) && flags.length > 0;
    }
    if (currentSection.id === "step4") {
      return option4 !== "";
    }
    if (currentSection.id === "step5") {
      if (slideIdx === 0) return true; // reading Camila's msg
      if (slideIdx === 1) return step5Text.trim().length > 20;
    }
    return false;
  }, [
    currentSection,
    slideIdx,
    fieldActions,
    userPrompt,
    modelResponse,
    followupText,
    segmentFlags,
    option4,
    step5Text,
  ]);

  // ============ EVALUATING ============
  if (isEvaluating) {
    return (
      <>
        <SurfaceNav />
        <main className="surface-canvas min-h-screen grid place-items-center px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-md"
          >
            <div className="mx-auto h-10 w-10 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin" />
            <h2 className="display mt-8 text-[28px] text-[var(--text-primary)] text-center">
              Evaluando tu sesión.
            </h2>
            <p className="mt-3 text-[15px] text-[var(--text-secondary)] text-center">
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
          <div className="max-w-2xl mx-auto px-6 pt-16">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="h-16 w-16 rounded-full accent-bg-soft grid place-items-center">
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
              <h1 className="display mt-4 text-[40px] sm:text-[56px] text-[var(--text-primary)]">
                Gracias por participar.
              </h1>
              <p className="mt-5 text-[17px] text-[var(--text-secondary)] max-w-lg">
                Tu reporte está listo. Lo encontrarás en tu cuenta y en el
                dashboard del manager.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-3">
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
                  className="h-12 px-7 border-[var(--border-strong)] text-[var(--text-primary)] bg-[var(--surface)] text-[15px]"
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

  // ============ CAPSULES (one per slide of current section) ============
  const capsuleCount = currentSection.slides;

  return (
    <>
      <SurfaceNav />

      <div className="max-w-7xl mx-auto flex min-h-[calc(100vh-3.5rem)]">
        {/* Sidebar (no eyebrow, no borders) */}
        <aside className="hidden md:block flex-shrink-0 w-60">
          <div className="sticky top-[80px] py-10 px-6">
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
                        ? "bg-[var(--accent-soft)] text-[var(--text-primary)] font-medium"
                        : reached
                          ? "text-[var(--text-primary)] hover:bg-[var(--surface-3)]"
                          : "text-[var(--text-tertiary)] cursor-not-allowed"
                    }`}
                  >
                    <span
                      className={`flex-shrink-0 h-5 w-5 rounded-full grid place-items-center text-[10px] mono font-semibold transition-colors ${
                        isCurrent
                          ? "accent-bg text-white"
                          : isCompleted
                            ? "accent-bg text-white"
                            : reached
                              ? "border border-[var(--border-strong)] text-[var(--text-primary)] bg-transparent"
                              : "border border-[var(--border)] text-[var(--text-tertiary)] bg-transparent"
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
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 surface-canvas pb-32 flex flex-col">
          {/* Capsule progress */}
          <div className="pt-8 px-6">
            <div className="max-w-2xl mx-auto flex gap-1.5">
              {Array.from({ length: capsuleCount }).map((_, i) => {
                const filled = i < slideIdx || (i === slideIdx && canAdvance);
                const active = i === slideIdx;
                return (
                  <div
                    key={i}
                    className="flex-1 h-[5px] rounded-full overflow-hidden bg-[var(--surface-3)]"
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor:
                          filled || active ? "var(--accent)" : "transparent",
                      }}
                      initial={false}
                      animate={{ width: filled || active ? "100%" : "0%" }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Content: block centered v+h, text left-aligned inside */}
          <div className="flex-1 flex items-center justify-center px-6 py-12">
            <div className="max-w-2xl w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${currentSection.id}-${slideIdx}`}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  {renderSlide({
                    sectionId: currentSection.id,
                    slideIdx,
                    state: {
                      fieldActions,
                      userPrompt,
                      modelResponse,
                      isModelThinking,
                      followupText,
                      segmentFlags,
                      option4,
                      step5Text,
                    },
                    setters: {
                      setFieldActions,
                      setUserPrompt,
                      setModelResponse,
                      setFollowupText,
                      setSegmentFlags,
                      setOption4,
                      setStep5Text,
                    },
                    sendPrompt,
                  })}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>

      {/* Sticky bottom action bar (no border) */}
      <div className="fixed bottom-0 inset-x-0 z-40 surface-backdrop">
        <div className="max-w-7xl mx-auto md:pl-60 px-6 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
            {slideIdx > 0 || sectionIdx > 0 ? (
              <Button
                radius="full"
                size="lg"
                variant="bordered"
                onPress={prevSlide}
                className="h-11 px-5 text-[14px] font-medium border-[var(--border-strong)] text-[var(--text-primary)] bg-[var(--surface)]"
              >
                ← Anterior
              </Button>
            ) : (
              <span />
            )}

            <Button
              radius="full"
              size="lg"
              onPress={nextSlide}
              isDisabled={!canAdvance}
              className={`h-11 px-6 text-[14px] font-medium ${
                canAdvance
                  ? "accent-bg text-white hover:opacity-90"
                  : "bg-[var(--surface-3)] text-[var(--text-tertiary)]"
              } shadow-none btn-hover-shift`}
            >
              {nextButtonLabel(sectionIdx, slideIdx, currentSection.slides)} →
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

// ============ NEXT BUTTON LABEL ============
function nextButtonLabel(
  sectionIdx: number,
  slideIdx: number,
  slidesInSection: number,
): string {
  const lastSlideInSection = slideIdx === slidesInSection - 1;
  const lastSection = sectionIdx === SECTIONS.length - 1;
  if (lastSlideInSection && lastSection) return "Terminar caso";
  if (lastSlideInSection && sectionIdx === 0) return "Empezar caso";
  return "Siguiente";
}

// ============ SLIDE RENDERER ============

type RuntimeState = {
  fieldActions: Record<string, string>;
  userPrompt: string;
  modelResponse: string | null;
  isModelThinking: boolean;
  followupText: string;
  segmentFlags: Record<number, string[]>;
  option4: string;
  step5Text: string;
};

type RuntimeSetters = {
  setFieldActions: (v: Record<string, string>) => void;
  setUserPrompt: (v: string) => void;
  setModelResponse: (v: string | null) => void;
  setFollowupText: (v: string) => void;
  setSegmentFlags: (v: Record<number, string[]>) => void;
  setOption4: (v: string) => void;
  setStep5Text: (v: string) => void;
};

function renderSlide({
  sectionId,
  slideIdx,
  state,
  setters,
  sendPrompt,
}: {
  sectionId: SectionId;
  slideIdx: number;
  state: RuntimeState;
  setters: RuntimeSetters;
  sendPrompt: () => void;
}) {
  // ============ INTRO ============
  if (sectionId === "intro") {
    return <IntroSlide slideIdx={slideIdx} />;
  }

  // ============ STEP 1 ============
  if (sectionId === "step1") {
    if (slideIdx === 0) return <Step1Brief />;
    if (slideIdx === 1) return <Step1DatasetPreview />;
    const field = FIELDS[slideIdx - 2];
    if (field) {
      return (
        <Step1FieldDecision
          field={field}
          fieldIdx={slideIdx - 1}
          value={state.fieldActions[field.key] || ""}
          onChange={(v) =>
            setters.setFieldActions({ ...state.fieldActions, [field.key]: v })
          }
        />
      );
    }
  }

  // ============ STEP 2 ============
  if (sectionId === "step2") {
    if (slideIdx === 0) {
      return (
        <Step2Prompt
          value={state.userPrompt}
          onChange={setters.setUserPrompt}
          modelResponse={state.modelResponse}
          isModelThinking={state.isModelThinking}
          onSend={sendPrompt}
        />
      );
    }
    if (slideIdx === 1) {
      return <Step2Response modelResponse={state.modelResponse} />;
    }
    if (slideIdx === 2) {
      return (
        <Step2Followup
          value={state.followupText}
          onChange={setters.setFollowupText}
        />
      );
    }
  }

  // ============ STEP 3 ============
  if (sectionId === "step3") {
    const seg = SEGMENTS[slideIdx];
    if (seg) {
      return (
        <Step3SegmentReview
          segment={seg}
          flags={state.segmentFlags[seg.id] || []}
          onChange={(v) =>
            setters.setSegmentFlags({ ...state.segmentFlags, [seg.id]: v })
          }
        />
      );
    }
  }

  // ============ STEP 4 ============
  if (sectionId === "step4") {
    return (
      <Step4Decision
        value={state.option4}
        onChange={setters.setOption4}
      />
    );
  }

  // ============ STEP 5 ============
  if (sectionId === "step5") {
    if (slideIdx === 0) return <Step5CamilaMessage />;
    if (slideIdx === 1) {
      return (
        <Step5Response
          value={state.step5Text}
          onChange={setters.setStep5Text}
        />
      );
    }
  }

  return null;
}

// ============ INTRO ============

function IntroSlide({ slideIdx }: { slideIdx: number }) {
  if (slideIdx === 0) {
    return (
      <>
        <div className="eyebrow">Caso 01 · Marketing · 18 min</div>
        <h1 className="display display-tight mt-6 text-[44px] sm:text-[60px] text-[var(--text-primary)]">
          Campaña urgente con
          <br />
          feedback de clientes.
        </h1>
        <p className="mt-8 text-[19px] text-[var(--text-secondary)] leading-[1.55]">
          Vas a interpretar el rol de un Marketing Manager bajo presión. No hay
          respuesta única correcta: evaluamos tu criterio.
        </p>
      </>
    );
  }
  if (slideIdx === 1) {
    return (
      <>
        <div className="eyebrow">Tu rol</div>
        <h2 className="display display-tight mt-6 text-[36px] sm:text-[48px] text-[var(--text-primary)]">
          Marketing Manager en Loop.
        </h2>
        <p className="mt-8 text-[18px] text-[var(--text-primary)] leading-[1.65]">
          Eres <span className="font-medium">Marketing Manager</span> en{" "}
          <span className="font-medium">Loop</span>, una SaaS B2B mid-market
          (120 empleados) que vende plataforma de atención al cliente con IA en
          LATAM.
        </p>
        <p className="mt-5 text-[16px] text-[var(--text-secondary)] leading-[1.7]">
          Tu equipo de growth es de 6 personas. Reportas a{" "}
          <span className="text-[var(--text-primary)]">Camila, VP of Growth</span>. El
          gobierno de IA en tu empresa es informal: hay GPT corporativo
          aprobado por IT, pero los criterios viven en cada manager.
        </p>
      </>
    );
  }
  if (slideIdx === 2) {
    return (
      <>
        <div className="eyebrow">Qué está pasando</div>
        <h2 className="display display-tight mt-6 text-[36px] sm:text-[48px] text-[var(--text-primary)]">
          Jueves · 4:30 PM.
        </h2>
        <p className="mt-3 text-[18px] text-[var(--text-secondary)] leading-[1.55]">
          Quedan 16 horas hasta el deadline.
        </p>
        <p className="mt-8 text-[17px] text-[var(--text-primary)] leading-[1.7]">
          Camila te escribe por Slack pidiéndote{" "}
          <span className="font-medium">
            3 ángulos para LinkedIn Ads + 1 email a prospects
          </span>{" "}
          para mañana 9 AM. Tienes acceso a un dataset de 60 filas con feedback
          de clientes (PII incluido).
        </p>
        <div className="mt-8 card-apple bg-[var(--surface)] p-5">
          <div className="flex items-start gap-4">
            <Avatar
              size="sm"
              className="bg-[#ff5e62] text-white text-[13px] font-semibold flex-shrink-0"
              name="C"
            />
            <p className="text-[15px] text-[var(--text-primary)] leading-[1.6] italic">
              «No me metas a Legal hoy, ya están cerrados. Confío en tu
              criterio.»
            </p>
          </div>
        </div>
      </>
    );
  }
  if (slideIdx === 3) {
    const steps = [
      { id: 1, label: "Datos", sub: "Decide qué pasa al modelo." },
      {
        id: 2,
        label: "IA",
        sub: "Redacta el prompt y lee la respuesta.",
      },
      {
        id: 3,
        label: "Revisión",
        sub: "Marca los problemas del modelo.",
      },
      { id: 4, label: "Decisión", sub: "Define cómo se lo das a Camila." },
      { id: 5, label: "Respuesta", sub: "Responde al VP." },
    ];
    return (
      <>
        <div className="eyebrow">Cómo vas a avanzar</div>
        <h2 className="display display-tight mt-6 text-[36px] sm:text-[48px] text-[var(--text-primary)]">
          Cinco pasos.
        </h2>
        <ol className="mt-10 space-y-5">
          {steps.map((s) => (
            <li key={s.id} className="flex items-start gap-5">
              <div className="flex-shrink-0 mt-1 mono text-[15px] text-[var(--text-tertiary)] font-medium w-8">
                {String(s.id).padStart(2, "0")}
              </div>
              <div>
                <div className="text-[17px] text-[var(--text-primary)] font-medium">
                  {s.label}
                </div>
                <div className="text-[15px] text-[var(--text-secondary)] mt-0.5">{s.sub}</div>
              </div>
            </li>
          ))}
        </ol>
      </>
    );
  }
  if (slideIdx === 4) {
    return (
      <>
        <div className="eyebrow">Reglas</div>
        <h2 className="display display-tight mt-6 text-[36px] sm:text-[48px] text-[var(--text-primary)]">
          Antes de empezar.
        </h2>
        <ul className="mt-10 space-y-5 text-[17px] text-[var(--text-primary)] leading-[1.65]">
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
              Puedes volver a una sección ya visitada desde el menú lateral.
            </span>
          </li>
          <li className="flex items-start gap-4">
            <span
              className="flex-shrink-0 mt-2 h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: "var(--accent)" }}
            />
            <span>
              El modelo responde una vez por interacción. Trabaja con lo que te
              dé.
            </span>
          </li>
          <li className="flex items-start gap-4">
            <span
              className="flex-shrink-0 mt-2 h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: "var(--accent)" }}
            />
            <span>
              Evaluamos en 5 dimensiones: contexto, privacidad, validación,
              juicio y decisión.
            </span>
          </li>
        </ul>
      </>
    );
  }
  return null;
}

// ============ STEP 1 ============

function Step1Brief() {
  return (
    <>
      <div className="eyebrow">Paso 01 · Datos</div>
      <h2 className="display display-tight mt-6 text-[36px] sm:text-[44px] text-[var(--text-primary)]">
        Lee el brief de Camila.
      </h2>
      <p className="mt-5 text-[17px] text-[var(--text-secondary)] leading-[1.55]">
        Antes de tocar el dataset, releélo. Lo que aceptes pasar al modelo
        define tu exposición regulatoria.
      </p>
      <div className="mt-10 card-apple bg-[var(--surface)] p-6">
        <div className="flex items-start gap-4">
          <Avatar
            size="sm"
            className="bg-[#ff5e62] text-white text-[13px] font-semibold flex-shrink-0"
            name="C"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-[12px] text-[var(--text-tertiary)]">
              <span className="text-[var(--text-primary)] font-medium">
                Camila · VP of Growth
              </span>
              <span>·</span>
              <span className="mono">Jue 4:30 PM</span>
            </div>
            <p className="mt-2 text-[15px] text-[var(--text-primary)] leading-[1.55]">
              «Hey, necesito 3 ángulos para LinkedIn Ads + 1 email a la lista
              de prospects para mañana 9 AM. Revisa el feedback que CS nos pasó
              hace 2 meses, ahí está todo.{" "}
              <span className="text-[#ff5e62]">
                No me metas a Legal hoy, ya están cerrados
              </span>
              . Confío en tu criterio.»
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function Step1DatasetPreview() {
  const sample = [
    {
      name: "Mariana López",
      email: "mariana.lopez@aurorares.mx",
      company: "Aurora Recursos",
      complaint:
        "El módulo de reportes se traba cuando paso de 200 clientes activos…",
    },
    {
      name: "Carlos Mendoza",
      email: "cmendoza@grpotec.cl",
      company: "Grupo Tec",
      complaint:
        "Me encanta el auto-tag, pero el SLA tracker se rompió 3 veces este mes…",
    },
    {
      name: "Sofía Ramírez",
      email: "sofia@digitalup.co",
      company: "DigitalUp",
      complaint:
        "Queremos integración con WhatsApp Business, sin eso no podemos escalar…",
    },
  ];
  return (
    <>
      <div className="eyebrow">Paso 01 · Dataset</div>
      <h2 className="display display-tight mt-6 text-[36px] sm:text-[44px] text-[var(--text-primary)]">
        60 filas, 6 campos.
      </h2>
      <p className="mt-5 text-[17px] text-[var(--text-secondary)] leading-[1.55]">
        Esto es lo que CS dejó hace 2 meses. Tres campos son datos personales
        (PII).
      </p>
      <div className="mt-8 card-apple bg-[var(--surface)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="bg-[var(--surface-2)]">
                <th className="text-left font-medium text-[var(--text-secondary)] px-3 py-2.5">
                  name
                </th>
                <th className="text-left font-medium text-[var(--text-secondary)] px-3 py-2.5">
                  email
                </th>
                <th className="text-left font-medium text-[var(--text-secondary)] px-3 py-2.5">
                  company
                </th>
              </tr>
            </thead>
            <tbody>
              {sample.map((r) => (
                <tr key={r.email}>
                  <td className="px-3 py-2.5 text-[var(--text-primary)]">{r.name}</td>
                  <td className="px-3 py-2.5 text-[var(--text-secondary)]">{r.email}</td>
                  <td className="px-3 py-2.5 text-[var(--text-secondary)]">{r.company}</td>
                </tr>
              ))}
              <tr>
                <td
                  colSpan={3}
                  className="px-3 py-2 text-[12px] text-[var(--text-tertiary)] italic"
                >
                  …57 filas más.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function Step1FieldDecision({
  field,
  fieldIdx,
  value,
  onChange,
}: {
  field: (typeof FIELDS)[number];
  fieldIdx: number;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <>
      <div className="eyebrow">
        Paso 01 · Campo {fieldIdx} de {FIELDS.length}
      </div>
      <h2 className="display display-tight mt-6 text-[var(--text-primary)] text-[32px] sm:text-[40px]">
        ¿Qué hacer con{" "}
        <span className="mono text-[var(--text-primary)]">{field.label}</span>?
      </h2>
      <div className="mt-5 flex items-center gap-3">
        <p className="text-[17px] text-[var(--text-secondary)]">{field.desc}</p>
        {field.pii && (
          <span
            className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
            style={{
              color: "var(--accent)",
              backgroundColor: "var(--accent-soft)",
            }}
          >
            PII
          </span>
        )}
      </div>
      <RadioGroup
        aria-label={`Acción para ${field.key}`}
        value={value}
        onValueChange={onChange}
        classNames={{ wrapper: "gap-3 mt-10" }}
      >
        {FIELD_OPTIONS.map((opt) => {
          const selected = value === opt;
          return (
            <Card
              key={opt}
              className="card-apple bg-[var(--surface)] cursor-pointer transition-all"
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
              <CardBody className="p-4">
                <Radio
                  value={opt}
                  size="md"
                  classNames={{
                    wrapper: "border-[var(--border-strong)]",
                    labelWrapper: "ml-2",
                    label: "text-[15px] font-medium text-[var(--text-primary)]",
                  }}
                >
                  {opt}
                </Radio>
              </CardBody>
            </Card>
          );
        })}
      </RadioGroup>
    </>
  );
}

// ============ STEP 2 ============

function Step2Prompt({
  value,
  onChange,
  modelResponse,
  isModelThinking,
  onSend,
}: {
  value: string;
  onChange: (v: string) => void;
  modelResponse: string | null;
  isModelThinking: boolean;
  onSend: () => void;
}) {
  return (
    <>
      <div className="eyebrow">Paso 02 · Tu prompt</div>
      <h2 className="display display-tight mt-6 text-[var(--text-primary)] text-[32px] sm:text-[40px]">
        Redacta tu prompt al modelo.
      </h2>
      <p className="mt-5 text-[17px] text-[var(--text-secondary)] leading-[1.55]">
        La calidad del prompt define el output. Sé explícito en audiencia,
        tono, longitud y restricciones.
      </p>
      <div className="mt-8">
        <Textarea
          placeholder="Escribe el prompt que le mandarías al GPT corporativo aprobado por IT…"
          value={value}
          onValueChange={onChange}
          minRows={6}
          isDisabled={modelResponse !== null}
          classNames={{
            inputWrapper:
              "bg-[var(--surface)] border border-[var(--border)] data-[hover=true]:border-[var(--border-strong)] group-data-[focus=true]:border-[var(--accent)] shadow-none",
            input: "text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]",
          }}
        />
        {!modelResponse && (
          <div className="mt-4 flex justify-end">
            <Button
              radius="full"
              size="md"
              onPress={onSend}
              isLoading={isModelThinking}
              isDisabled={!value.trim()}
              className="accent-bg text-white px-5 h-10 text-[14px] font-medium"
            >
              {isModelThinking ? "Pensando…" : "Enviar al modelo →"}
            </Button>
          </div>
        )}
        {modelResponse && (
          <p className="mt-4 text-[13px] text-[#0a7e3a]">
            El modelo respondió. Pulsa «Siguiente» para leer su respuesta.
          </p>
        )}
      </div>
    </>
  );
}

function Step2Response({ modelResponse }: { modelResponse: string | null }) {
  return (
    <>
      <div className="eyebrow">Paso 02 · Respuesta del modelo</div>
      <h2 className="display display-tight mt-6 text-[var(--text-primary)] text-[32px] sm:text-[40px]">
        Esto te devolvió.
      </h2>
      <p className="mt-5 text-[17px] text-[var(--text-secondary)] leading-[1.55]">
        Léelo entero antes de decidir qué harás con esta respuesta.
      </p>
      <div className="mt-8 card-apple bg-[var(--surface-2)] p-6 max-h-[42vh] overflow-y-auto">
        <pre className="text-[13.5px] text-[var(--text-primary)] leading-[1.6] whitespace-pre-wrap font-sans">
          {modelResponse}
        </pre>
      </div>
    </>
  );
}

function Step2Followup({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <>
      <div className="eyebrow">Paso 02 · Tu siguiente paso</div>
      <h2 className="display display-tight mt-6 text-[var(--text-primary)] text-[32px] sm:text-[40px]">
        ¿Qué harás con esto?
      </h2>
      <p className="mt-5 text-[17px] text-[var(--text-secondary)] leading-[1.55]">
        ¿Lo usas tal cual? ¿Validas algo primero? ¿Descartas? Explica por qué.
      </p>
      <div className="mt-8">
        <Textarea
          placeholder="Escribe tu decisión y el razonamiento…"
          value={value}
          onValueChange={onChange}
          minRows={5}
          classNames={{
            inputWrapper:
              "bg-[var(--surface)] border border-[var(--border)] data-[hover=true]:border-[var(--border-strong)] group-data-[focus=true]:border-[var(--accent)] shadow-none",
            input: "text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]",
          }}
        />
      </div>
    </>
  );
}

// ============ STEP 3 ============

function Step3SegmentReview({
  segment,
  flags,
  onChange,
}: {
  segment: (typeof SEGMENTS)[number];
  flags: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <>
      <div className="eyebrow">Paso 03 · Ángulo {segment.id + 1} de 3</div>
      <h2 className="display display-tight mt-6 text-[var(--text-primary)] text-[28px] sm:text-[34px]">
        {segment.title}
      </h2>
      <p className="mt-5 text-[17px] text-[var(--text-primary)] leading-[1.65]">
        {segment.body}
      </p>
      <div className="mt-10">
        <div className="eyebrow mb-4">
          ¿Qué problemas le ves a este ángulo?
        </div>
        <CheckboxGroup
          aria-label={`Flags para ${segment.title}`}
          value={flags}
          onValueChange={(v) => onChange(v as string[])}
          orientation="horizontal"
          classNames={{ wrapper: "gap-2 flex-wrap" }}
        >
          {REVIEW_TARGETS.map((t) => (
            <Checkbox
              key={t.id}
              value={t.id}
              size="sm"
              classNames={{
                base: "m-0 max-w-fit cursor-pointer rounded-full border border-[var(--border)] data-[selected=true]:bg-[var(--accent-soft)] data-[selected=true]:border-[var(--accent)] px-3 py-1.5",
                wrapper: "hidden",
                label: "text-[13px] text-[var(--text-primary)] font-medium",
              }}
            >
              {t.label}
            </Checkbox>
          ))}
        </CheckboxGroup>
      </div>
    </>
  );
}

// ============ STEP 4 ============

function Step4Decision({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <>
      <div className="eyebrow">Paso 04 · Decisión</div>
      <h2 className="display display-tight mt-6 text-[var(--text-primary)] text-[32px] sm:text-[40px]">
        ¿Cómo le entregas los ángulos a Camila?
      </h2>
      <p className="mt-5 text-[17px] text-[var(--text-secondary)] leading-[1.55]">
        El formato comunica tu criterio (o la falta de él).
      </p>
      <RadioGroup
        aria-label="Opción de entrega"
        value={value}
        onValueChange={onChange}
        classNames={{ wrapper: "gap-3 mt-10" }}
      >
        {ENTREGA_OPTIONS.map((opt) => {
          const selected = value === opt.id;
          return (
            <Card
              key={opt.id}
              className="card-apple bg-[var(--surface)] cursor-pointer transition-all"
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
              <CardBody className="p-4">
                <Radio
                  value={opt.id}
                  size="md"
                  classNames={{
                    wrapper: "border-[var(--border-strong)]",
                    labelWrapper: "ml-2",
                  }}
                >
                  <div>
                    <div className="text-[15px] font-medium text-[var(--text-primary)]">
                      {opt.label}
                    </div>
                    <div className="text-[13px] text-[var(--text-secondary)] mt-0.5">
                      {opt.sub}
                    </div>
                  </div>
                </Radio>
              </CardBody>
            </Card>
          );
        })}
      </RadioGroup>
    </>
  );
}

// ============ STEP 5 ============

function Step5CamilaMessage() {
  return (
    <>
      <div className="eyebrow">Paso 05 · Camila te escribe</div>
      <h2 className="display display-tight mt-6 text-[var(--text-primary)] text-[32px] sm:text-[40px]">
        Una más para mañana.
      </h2>
      <p className="mt-5 text-[17px] text-[var(--text-secondary)] leading-[1.55]">
        Al día siguiente, antes del lanzamiento, te llega esto.
      </p>
      <div className="mt-8 card-apple bg-[var(--surface)] p-6">
        <div className="flex items-start gap-4">
          <Avatar
            size="sm"
            className="bg-[#ff5e62] text-white text-[13px] font-semibold flex-shrink-0"
            name="C"
          />
          <div className="flex-1">
            <div className="text-[12px] text-[var(--text-tertiary)]">
              <span className="text-[var(--text-primary)] font-medium">
                Camila · VP of Growth
              </span>
              <span className="mx-1.5">·</span>
              <span className="mono">Vie 8:12 AM</span>
            </div>
            <p className="mt-2 text-[15px] text-[var(--text-primary)] leading-[1.6]">
              «Perfectos los ángulos. Una más:{" "}
              <span className="font-medium">
                segmentemos por revenue_potential
              </span>{" "}
              para mandar el email solo a los que valgan más de $50k. Eso lo
              armas con la misma data, ¿cierto?»
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function Step5Response({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <>
      <div className="eyebrow">Paso 05 · Tu respuesta</div>
      <h2 className="display display-tight mt-6 text-[var(--text-primary)] text-[32px] sm:text-[40px]">
        ¿Cómo respondes?
      </h2>
      <p className="mt-5 text-[17px] text-[var(--text-secondary)] leading-[1.55]">
        Usar revenue para targeting sin consentimiento es problemático.
        Responde como lo harías por Slack ahora mismo.
      </p>
      <div className="mt-8">
        <Textarea
          placeholder="Tu respuesta a Camila…"
          value={value}
          onValueChange={onChange}
          minRows={5}
          classNames={{
            inputWrapper:
              "bg-[var(--surface)] border border-[var(--border)] data-[hover=true]:border-[var(--border-strong)] group-data-[focus=true]:border-[var(--accent)] shadow-none",
            input: "text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]",
          }}
        />
      </div>
    </>
  );
}

"use client";

import { useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  CheckboxGroup,
  Chip,
  CircularProgress,
  Divider,
  Progress,
  Radio,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
} from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";
import { SurfaceNav } from "../../_components/SurfaceNav";
import { SAMPLE_FEEDBACK_ROWS } from "../../_data/case-data";

type StepStatus = "completed" | "current" | "upcoming";

const STEPS = [
  {
    id: 1,
    key: "data_scope",
    label: "preparar datos",
    sub: "decidir qué pasa al modelo",
    headline: "antes de tocar el dataset, decide qué se le pasa al modelo",
    why: "el dataset tiene PII (nombre, email, empresa). pegárselo crudo al LLM es exposición regulatoria. tu primer movimiento es scopear qué entra y qué no.",
    dimensions: ["privacidad", "contexto"],
  },
  {
    id: 2,
    key: "llm_beat",
    label: "interacción IA",
    sub: "redactar prompt y leer la respuesta",
    headline: "redacta tu prompt, recibe los 3 ángulos del modelo, decide qué hacer con el output",
    why: "este es el beat real con el LLM. la calidad del prompt define el output. después tienes que decidir qué del output usas, descartas o validas.",
    dimensions: ["contexto", "privacidad", "validación", "juicio", "decisión"],
  },
  {
    id: 3,
    key: "artifact_review",
    label: "revisar output",
    sub: "marcar problemas del LLM",
    headline: "el modelo te dio 3 ángulos. marca qué partes NO enviarías a Camila tal cual",
    why: "el LLM redacta con confianza pero inventa cifras, generaliza y a veces expone datos sensibles. tu trabajo es discriminar lo bloqueante de lo cosmético.",
    dimensions: ["validación", "privacidad", "juicio"],
  },
  {
    id: 4,
    key: "decision_select",
    label: "entrega",
    sub: "cómo se lo das a Camila",
    headline: "Camila te pide los ángulos por slack. elige cómo se los entregas",
    why: "una decisión clara con disclaimers vs un dump genérico. el formato comunica tu criterio (o la falta de él).",
    dimensions: ["decisión", "juicio"],
  },
  {
    id: 5,
    key: "decision_open_short",
    label: "follow-up",
    sub: "responder al VP",
    headline: "Camila te pide algo que cruza línea ética. ¿cómo respondes?",
    why: "el momento más sutil del caso. usar revenue para targeting sin consentimiento es problemático. cómo objetas (o no) define tu criterio sobre autoridad y riesgo.",
    dimensions: ["privacidad", "juicio", "decisión"],
  },
];

const FIELD_OPTIONS = ["usar tal cual", "transformar", "descartar"];

const FIELDS = [
  { key: "name", desc: "identificador personal" },
  { key: "email", desc: "contacto directo" },
  { key: "company", desc: "razón social" },
  { key: "complaint_or_praise", desc: "texto libre del cliente" },
  { key: "revenue_potential_usd", desc: "valor comercial estimado" },
  { key: "signed_at", desc: "fecha de firma" },
];

const MODEL_RESPONSE_SAMPLE = `Basado en el análisis del feedback de clientes, aquí están 3 ángulos para tu campaña:

1. "Resuelve el cuello de botella que tu CFO ve antes que tú"
Insight: 41% de los clientes reportan que el módulo de reportes se traba bajo carga. CFOs y heads of finance pierden visibilidad justo cuando más la necesitan. El gap real es performance, no features.

2. "WhatsApp Business: tu canal más grande sigue desatendido"
Insight: La integración con WhatsApp Business es la solicitud #1 de clientes LATAM con presencia en Colombia, México y Argentina. Empresas como DigitalUp y similares no pueden escalar sin esto.

3. "Onboarding caótico, adopción imparable"
Insight: 8 de cada 10 clientes describe el onboarding como difícil — pero 0 quiere volver atrás después de 2 semanas. La paradoja vende: dolor inicial × retención brutal.

Stack recomendado: LinkedIn carousel para ángulo 1, email a list para ángulo 2, video testimonial para ángulo 3.`;

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
    body: 'Insight: 41% de los clientes reportan que el módulo de reportes se traba bajo carga. CFOs y heads of finance pierden visibilidad justo cuando más la necesitan.',
  },
  {
    id: 1,
    title: 'ángulo 2 — "WhatsApp Business desatendido"',
    body: 'La integración con WhatsApp Business es la solicitud #1 de clientes LATAM. Empresas como DigitalUp y similares no pueden escalar sin esto.',
  },
  {
    id: 2,
    title: 'ángulo 3 — "Onboarding caótico, adopción imparable"',
    body: '8 de cada 10 clientes describe el onboarding como difícil — pero 0 quiere volver atrás después de 2 semanas.',
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

function getStepStatus(stepIdx: number, currentIdx: number): StepStatus {
  if (stepIdx < currentIdx) return "completed";
  if (stepIdx === currentIdx) return "current";
  return "upcoming";
}

export default function RuntimePage() {
  const [showIntro, setShowIntro] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = STEPS[stepIndex];

  const [fieldActions, setFieldActions] = useState<Record<string, string>>({});
  const [step1Reasoning, setStep1Reasoning] = useState("");

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

  // ============ INTRO ============
  if (showIntro) {
    return (
      <div className="min-h-screen bg-[#08080a] text-white">
        <SurfaceNav />
        <div className="relative">
          <div className="absolute inset-0 aurora opacity-50" aria-hidden />
          <div className="grain" aria-hidden />

          <div className="relative mx-auto max-w-3xl px-6 pt-14 pb-24">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-medium">
                caso 01 — marketing · ~18 min · 5 pasos
              </div>
              <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-[-0.025em] leading-[1.05]">
                campaña urgente con feedback de clientes
              </h1>
              <p className="mt-5 text-white/65 text-[16px] leading-[1.7] max-w-2xl">
                vas a interpretar el rol de un Marketing Manager bajo presión.
                no hay respuesta única correcta — evaluamos tu criterio para
                operar con IA en situaciones reales.
              </p>

              {/* Tu rol */}
              <Card
                className="mt-10 bg-white/[0.025] border border-white/[0.06]"
                shadow="none"
              >
                <CardHeader className="px-6 py-4 border-b border-white/[0.06]">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-medium">
                    tu rol
                  </div>
                </CardHeader>
                <CardBody className="p-6 space-y-3 text-[14px] text-white/80 leading-[1.7]">
                  <p>
                    eres{" "}
                    <span className="text-white font-medium">
                      Marketing Manager
                    </span>{" "}
                    en <span className="text-white font-medium">Loop</span>, una
                    SaaS B2B mid-market (120 empleados) que vende plataforma de
                    atención al cliente con IA en LATAM.
                  </p>
                  <p className="text-white/65">
                    tu equipo de growth es de 6 personas. reportas a{" "}
                    <span className="text-white">Camila, VP of Growth</span>. el
                    gobierno de IA en tu empresa es informal: hay GPT
                    corporativo aprobado por IT, pero los criterios viven en
                    cada manager.
                  </p>
                </CardBody>
              </Card>

              {/* Qué está pasando */}
              <Card
                className="mt-3 bg-white/[0.025] border border-white/[0.06]"
                shadow="none"
              >
                <CardHeader className="px-6 py-4 border-b border-white/[0.06]">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-medium">
                    qué está pasando
                  </div>
                </CardHeader>
                <CardBody className="p-6 space-y-4 text-[14px] text-white/80 leading-[1.7]">
                  <div className="flex items-center gap-3 text-[12px] text-white/55">
                    <span className="mono text-amber-300/80">
                      jueves · 4:30 PM
                    </span>
                    <span className="text-white/25">·</span>
                    <span>quedan 16 horas hasta el deadline</span>
                  </div>
                  <p>
                    Camila te escribe por slack pidiéndote{" "}
                    <span className="text-white font-medium">
                      3 ángulos para LinkedIn ads + 1 email a prospects
                    </span>{" "}
                    para mañana 9 AM. tienes acceso a un dataset de 60 filas con
                    feedback de clientes (PII incluido: nombre, email, empresa,
                    revenue) que CS recopiló hace 2 meses.
                  </p>
                  <p className="text-white/65">
                    Camila cierra con:{" "}
                    <span className="text-amber-300/90 italic">
                      "no me metas a legal hoy, ya están cerrados. confío en tu
                      criterio."
                    </span>
                  </p>
                </CardBody>
              </Card>

              {/* Cómo vas a ir */}
              <Card
                className="mt-3 bg-white/[0.025] border border-white/[0.06]"
                shadow="none"
              >
                <CardHeader className="px-6 py-4 border-b border-white/[0.06]">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-medium">
                    cómo vas a ir — 5 pasos
                  </div>
                </CardHeader>
                <CardBody className="p-0">
                  <ol className="divide-y divide-white/[0.05]">
                    {STEPS.map((s) => (
                      <li
                        key={s.id}
                        className="px-6 py-4 flex items-start gap-4"
                      >
                        <div className="flex-shrink-0 mt-0.5 h-6 w-6 rounded-full bg-white/[0.05] border border-white/[0.08] grid place-items-center text-[11px] mono text-white/60 font-medium">
                          {s.id}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[14px] font-medium text-white">
                            {s.label}
                          </div>
                          <div className="text-[12px] text-white/55 mt-0.5 leading-snug">
                            {s.sub}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </CardBody>
              </Card>

              {/* Reglas */}
              <Card
                className="mt-3 bg-white/[0.025] border border-white/[0.06]"
                shadow="none"
              >
                <CardHeader className="px-6 py-4 border-b border-white/[0.06]">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-medium">
                    reglas
                  </div>
                </CardHeader>
                <CardBody className="p-6 space-y-2.5 text-[13px] text-white/70 leading-[1.65]">
                  <p>
                    <span className="text-white/45 mr-2">·</span>responde como
                    lo harías en tu trabajo real, no como crees que esperamos.
                  </p>
                  <p>
                    <span className="text-white/45 mr-2">·</span>una vez avanzas
                    de paso, no puedes regresar.
                  </p>
                  <p>
                    <span className="text-white/45 mr-2">·</span>el modelo
                    responde una vez por interacción. trabaja con lo que te dé.
                  </p>
                  <p>
                    <span className="text-white/45 mr-2">·</span>al cierre
                    evaluamos en 5 dimensiones: contexto, privacidad, validación,
                    juicio, decisión.
                  </p>
                </CardBody>
              </Card>

              <div className="mt-10 flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  radius="full"
                  onPress={() => setShowIntro(false)}
                  className="h-12 px-6 font-medium bg-white text-black hover:bg-white/90 shadow-[0_8px_32px_-8px_rgba(255,255,255,0.4)]"
                >
                  empezar caso →
                </Button>
                <Button
                  as="a"
                  href="/simulator-design"
                  size="lg"
                  variant="flat"
                  radius="full"
                  className="h-12 px-6 bg-white/[0.04] border border-white/10 text-white hover:bg-white/[0.08]"
                >
                  ← volver
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // ============ EVALUATING ============
  if (isEvaluating) {
    return (
      <div className="min-h-screen bg-[#08080a] text-white">
        <SurfaceNav />
        <div className="relative grid place-items-center min-h-[80vh]">
          <div className="absolute inset-0 aurora opacity-50" aria-hidden />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative text-center"
          >
            <div className="relative inline-block">
              <CircularProgress
                size="lg"
                color="secondary"
                aria-label="evaluando sesión"
                classNames={{
                  indicator: "stroke-violet-400",
                  track: "stroke-white/10",
                  svg: "w-20 h-20",
                }}
              />
              <div className="absolute inset-0 grid place-items-center text-white/40 text-[10px] mono tracking-wider">
                JUDGE
              </div>
            </div>
            <div className="mt-8 text-2xl font-semibold tracking-tight">
              evaluando tu sesión
            </div>
            <div className="text-white/50 mt-2 text-[14px]">
              rúbrica humana + LLM judge · ~12s
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ============ RESULTS ============
  if (showResults) {
    return (
      <div className="min-h-screen bg-[#08080a] text-white">
        <SurfaceNav />
        <div className="relative">
          <div className="absolute inset-0 aurora-soft opacity-50" aria-hidden />
          <div className="relative mx-auto max-w-3xl px-6 py-20">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Chip
                variant="flat"
                classNames={{
                  base: "h-7 bg-emerald-500/15 border border-emerald-500/25 mb-6 px-3",
                  content:
                    "text-[12px] tracking-wider text-emerald-300 uppercase font-medium",
                }}
              >
                ✓ caso terminado
              </Chip>
              <h1 className="text-4xl md:text-5xl font-semibold tracking-[-0.025em] leading-[1.05]">
                <span className="text-white">tu sesión queda</span>
                <br />
                <span className="text-white/55">guardada y evaluándose.</span>
              </h1>
              <p className="mt-6 text-white/70 text-[16px] leading-relaxed max-w-xl">
                tu reporte personalizado estará disponible en ~24 horas con
                bandas A/M/B por dimensión + 2-3 sugerencias específicas.
              </p>
              <p className="mt-3 text-white/45 text-[14px] max-w-xl">
                tu manager ve agregados del equipo, no transcripts individuales.
              </p>
              <div className="mt-12 flex flex-col sm:flex-row gap-3">
                <Button
                  as="a"
                  href="/simulator-design/reporte/P001"
                  size="lg"
                  className="h-12 px-6 font-medium bg-white text-black hover:bg-white/90"
                  radius="full"
                >
                  ver mi reporte de ejemplo →
                </Button>
                <Button
                  size="lg"
                  variant="flat"
                  radius="full"
                  className="h-12 px-6 bg-white/[0.04] border border-white/10 text-white hover:bg-white/[0.08]"
                  onPress={() => {
                    setStepIndex(0);
                    setShowResults(false);
                    setShowIntro(true);
                    setFieldActions({});
                    setModelResponse(null);
                    setUserPrompt("");
                    setFollowupText("");
                    setSegmentFlags({});
                    setOption4("");
                    setStep5Text("");
                  }}
                >
                  reiniciar caso
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // ============ MAIN RUNTIME ============
  return (
    <div className="min-h-screen bg-[#08080a] text-white">
      <SurfaceNav />

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid lg:grid-cols-[260px_1fr] gap-8">
          {/* ============ STICKY VERTICAL STEPPER ============ */}
          <aside className="lg:sticky lg:top-20 lg:self-start h-fit">
            <div className="mb-6">
              <span className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-medium">
                caso 01 — marketing
              </span>
              <h2 className="mt-2 text-[17px] font-semibold tracking-tight text-white leading-tight">
                campaña urgente con feedback de clientes
              </h2>
            </div>

            <ol className="space-y-1">
              {STEPS.map((s, idx) => {
                const status = getStepStatus(idx, stepIndex);
                return (
                  <li key={s.id}>
                    <div
                      className={`relative flex items-start gap-3 px-3 py-2.5 rounded-xl transition-all ${
                        status === "current"
                          ? "bg-white/[0.05] border border-white/[0.08]"
                          : "border border-transparent"
                      }`}
                    >
                      {idx < STEPS.length - 1 && (
                        <div
                          className={`absolute left-[22px] top-9 bottom-[-4px] w-px ${
                            status === "completed"
                              ? "bg-gradient-to-b from-violet-400/60 to-white/10"
                              : "bg-white/[0.06]"
                          }`}
                        />
                      )}
                      <div
                        className={`relative flex-shrink-0 h-6 w-6 rounded-full grid place-items-center text-[10px] mono font-medium ${
                          status === "completed"
                            ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white"
                            : status === "current"
                            ? "bg-white text-black ring-4 ring-violet-500/20"
                            : "bg-white/[0.05] text-white/40 border border-white/[0.08]"
                        }`}
                      >
                        {status === "completed" ? (
                          <svg
                            className="h-3 w-3"
                            viewBox="0 0 12 12"
                            fill="none"
                          >
                            <path
                              d="M2.5 6.5L5 9L9.5 3.5"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : (
                          s.id
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-[13px] font-medium leading-tight ${
                            status === "current"
                              ? "text-white"
                              : status === "completed"
                              ? "text-white/70"
                              : "text-white/45"
                          }`}
                        >
                          {s.label}
                        </div>
                        <div
                          className={`text-[11px] mt-0.5 leading-snug ${
                            status === "current"
                              ? "text-white/55"
                              : "text-white/35"
                          }`}
                        >
                          {s.sub}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>

            <Divider className="bg-white/[0.06] my-5" />

            <div className="px-3">
              <div className="flex items-center justify-between text-[11px] mono text-white/35">
                <span>progreso</span>
                <span>
                  {stepIndex + 1}/{STEPS.length}
                </span>
              </div>
              <Progress
                aria-label="progreso del caso"
                value={((stepIndex + 1) / STEPS.length) * 100}
                size="sm"
                className="mt-2"
                classNames={{
                  indicator: "bg-gradient-to-r from-indigo-500 to-fuchsia-500",
                  track: "bg-white/5",
                }}
              />
            </div>
          </aside>

          {/* ============ MAIN CONTENT ============ */}
          <main>
            {/* Context: Camila message (recordatorio del brief) */}
            <Card
              className="bg-white/[0.025] border border-white/[0.06] mb-8 overflow-visible"
              shadow="none"
            >
              <CardHeader className="px-5 py-3 border-b border-white/[0.06] flex-row justify-between">
                <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-medium">
                  brief de Camila · slack
                </div>
                <div className="text-[11px] mono text-white/40">
                  jueves 4:30 PM · queda 16h
                </div>
              </CardHeader>
              <CardBody className="p-5">
                <div className="flex items-start gap-4">
                  <Avatar
                    size="md"
                    className="bg-gradient-to-br from-pink-500 via-rose-400 to-orange-400 text-white flex-shrink-0 font-semibold"
                    name="C"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] text-white/55 mb-1.5">
                      <span className="font-semibold text-white text-[14px]">
                        Camila
                      </span>{" "}
                      · VP of Growth
                    </div>
                    <p className="text-white/85 text-[15px] leading-[1.6]">
                      "hey, necesito{" "}
                      <span className="text-white">
                        3 ángulos para LinkedIn ads + 1 email
                      </span>{" "}
                      a la lista de prospects para mañana 9 AM. revisa el
                      feedback que CS nos pasó hace 2 meses, ahí está todo.{" "}
                      <span className="text-amber-300/90">
                        no me metas a legal hoy
                      </span>
                      , ya están cerrados. confío en tu criterio."
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Step content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="pb-32"
              >
                {/* Step header — más explícito */}
                <div className="mb-7">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <span className="text-[11px] mono text-white/35 tracking-wider uppercase">
                      paso {currentStep.id} de {STEPS.length} ·{" "}
                      {currentStep.label}
                    </span>
                    <div className="flex gap-1.5 flex-wrap">
                      {currentStep.dimensions.map((d) => (
                        <Chip
                          key={d}
                          size="sm"
                          variant="flat"
                          classNames={{
                            base: "h-5 bg-white/[0.04] border border-white/[0.08]",
                            content: "text-[10px] text-white/55",
                          }}
                        >
                          {d}
                        </Chip>
                      ))}
                    </div>
                  </div>
                  <h2 className="text-2xl md:text-[28px] font-semibold tracking-[-0.02em] leading-tight">
                    {currentStep.headline}
                  </h2>
                  <p className="mt-3 text-white/60 text-[14px] leading-[1.65] max-w-2xl">
                    {currentStep.why}
                  </p>
                </div>

                {/* ============ STEP 1: DATA SCOPE ============ */}
                {currentStep.id === 1 && (
                  <div className="space-y-6">
                    <Card
                      className="bg-white/[0.025] border border-white/[0.06]"
                      shadow="none"
                    >
                      <CardHeader className="border-b border-white/[0.06] px-5 py-3 flex-row justify-between">
                        <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-medium">
                          customer_feedback.csv · sample 3 de 60 filas
                        </div>
                        <div className="text-[10px] mono text-white/30">
                          6 campos · 60 registros
                        </div>
                      </CardHeader>
                      <CardBody className="p-0">
                        <Table
                          aria-label="muestra del dataset de feedback de clientes"
                          removeWrapper
                          classNames={{
                            th: "bg-white/[0.02] text-white/45 text-[10px] font-medium uppercase tracking-wider",
                            td: "text-white/80 text-[13px] py-3",
                            tr: "border-t border-white/[0.05]",
                          }}
                        >
                          <TableHeader>
                            <TableColumn>name</TableColumn>
                            <TableColumn>email</TableColumn>
                            <TableColumn>company</TableColumn>
                            <TableColumn>complaint</TableColumn>
                            <TableColumn>revenue</TableColumn>
                          </TableHeader>
                          <TableBody>
                            {SAMPLE_FEEDBACK_ROWS.slice(0, 3).map((r, i) => (
                              <TableRow key={i}>
                                <TableCell>{r.name}</TableCell>
                                <TableCell className="text-white/55 mono text-[12px]">
                                  {r.email}
                                </TableCell>
                                <TableCell>{r.company}</TableCell>
                                <TableCell className="text-white/65 text-[12px] max-w-[280px] truncate">
                                  {r.complaint}
                                </TableCell>
                                <TableCell className="text-right mono text-[12px]">
                                  ${r.revenue.toLocaleString()}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardBody>
                    </Card>

                    {/* Pregunta explícita */}
                    <div className="bg-white/[0.025] border border-white/[0.06] rounded-2xl p-5">
                      <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-medium mb-2">
                        tu decisión
                      </div>
                      <p className="text-[15px] text-white leading-[1.6]">
                        para cada uno de los 6 campos, elige qué harás{" "}
                        <span className="text-white/55">
                          antes de pasarlo al modelo
                        </span>
                        :{" "}
                        <span className="text-white/85 mono text-[13px]">
                          usar tal cual
                        </span>
                        ,{" "}
                        <span className="text-white/85 mono text-[13px]">
                          transformar
                        </span>{" "}
                        (anonimizar, bucketizar, etc.), o{" "}
                        <span className="text-white/85 mono text-[13px]">
                          descartar
                        </span>
                        .
                      </p>
                    </div>

                    <div className="space-y-2">
                      {FIELDS.map((field) => {
                        const selected = fieldActions[field.key];
                        return (
                          <Card
                            key={field.key}
                            className={`bg-white/[0.025] border transition-colors ${
                              selected
                                ? "border-white/15"
                                : "border-white/[0.06]"
                            }`}
                            shadow="none"
                          >
                            <CardBody className="p-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                              <div className="md:min-w-[220px]">
                                <div className="mono text-[13px] text-white font-medium">
                                  {field.key}
                                </div>
                                <div className="text-[11px] text-white/45 mt-0.5">
                                  {field.desc}
                                </div>
                              </div>
                              <RadioGroup
                                aria-label={`acción para el campo ${field.key}`}
                                orientation="horizontal"
                                value={selected ?? ""}
                                onValueChange={(v) =>
                                  setFieldActions({
                                    ...fieldActions,
                                    [field.key]: v,
                                  })
                                }
                                classNames={{ wrapper: "flex-wrap gap-3" }}
                              >
                                {FIELD_OPTIONS.map((opt) => (
                                  <Radio key={opt} value={opt} size="sm">
                                    <span className="text-[13px] text-white/85">
                                      {opt}
                                    </span>
                                  </Radio>
                                ))}
                              </RadioGroup>
                            </CardBody>
                          </Card>
                        );
                      })}
                    </div>

                    <Textarea
                      label="explica tu razonamiento — máx 60 palabras"
                      placeholder="por qué decidiste así con cada campo..."
                      value={step1Reasoning}
                      onValueChange={setStep1Reasoning}
                      variant="flat"
                      maxLength={400}
                      minRows={3}
                      classNames={{
                        base: "max-w-full",
                        inputWrapper:
                          "bg-white/[0.025] border border-white/[0.08] data-[hover=true]:bg-white/[0.04] data-[focus=true]:bg-white/[0.05] data-[focus=true]:border-white/20",
                        input: "text-white placeholder:text-white/30",
                        label:
                          "text-white/55 text-[12px] uppercase tracking-wider font-medium",
                      }}
                    />
                  </div>
                )}

                {/* ============ STEP 2: LLM BEAT ============ */}
                {currentStep.id === 2 && (
                  <div className="space-y-6">
                    {/* Resumen mini de step 1 */}
                    <div className="flex items-center gap-2 text-[12px] text-white/45">
                      <svg
                        className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0"
                        viewBox="0 0 14 14"
                        fill="none"
                      >
                        <path
                          d="M3 7L6 10L11 4"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>
                        ya scopeaste los 6 campos · ahora le pides al modelo los
                        3 ángulos
                      </span>
                    </div>

                    <Card
                      className="bg-white/[0.025] border border-white/[0.06]"
                      shadow="none"
                    >
                      <CardHeader className="border-b border-white/[0.06] px-5 py-3 flex-row justify-between">
                        <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-medium">
                          tu prompt al modelo
                        </div>
                        <div className="flex items-center gap-2 text-[10px] mono text-white/35">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          deepseek-v4-flash · temp 0
                        </div>
                      </CardHeader>
                      <CardBody className="p-0">
                        <Textarea
                          aria-label="prompt al modelo"
                          placeholder="actúa como copywriter de Loop (SaaS B2B). tono: cálido consultor. ejemplos: '...' audiencia: ops managers LATAM. genera 3 ángulos para LinkedIn ads basados en estos datos..."
                          value={userPrompt}
                          onValueChange={setUserPrompt}
                          variant="flat"
                          minRows={8}
                          classNames={{
                            inputWrapper:
                              "bg-transparent border-0 shadow-none rounded-none",
                            input:
                              "text-white text-[14px] placeholder:text-white/30 leading-relaxed font-normal mono",
                          }}
                        />
                        <Divider className="bg-white/[0.06]" />
                        <div className="px-4 py-3 flex justify-between items-center">
                          <span className="text-[11px] text-white/35 mono">
                            {userPrompt.length} chars · 1 sola respuesta
                          </span>
                          <Button
                            size="md"
                            radius="full"
                            onPress={sendPrompt}
                            isLoading={isModelThinking}
                            isDisabled={
                              !userPrompt.trim() || modelResponse !== null
                            }
                            className="h-9 px-5 font-medium bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow-[0_4px_20px_-4px_rgba(99,102,241,0.5)] disabled:opacity-30 disabled:shadow-none"
                          >
                            {modelResponse ? "respuesta recibida" : "enviar →"}
                          </Button>
                        </div>
                      </CardBody>
                    </Card>

                    {modelResponse && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-5"
                      >
                        <Card
                          className="bg-gradient-to-br from-indigo-500/[0.08] to-fuchsia-500/[0.06] border border-indigo-500/20"
                          shadow="none"
                        >
                          <CardHeader className="px-5 py-3 border-b border-indigo-500/10 flex-row gap-2 items-center">
                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgb(129,140,248)]" />
                            <span className="text-[11px] uppercase tracking-[0.2em] text-indigo-200 font-medium">
                              respuesta del modelo
                            </span>
                          </CardHeader>
                          <CardBody className="p-5">
                            <pre className="whitespace-pre-wrap text-[14px] text-white/85 font-sans leading-[1.7]">
                              {modelResponse}
                            </pre>
                          </CardBody>
                        </Card>

                        <div className="bg-white/[0.025] border border-white/[0.06] rounded-2xl p-5">
                          <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-medium mb-2">
                            tu decisión
                          </div>
                          <p className="text-[15px] text-white leading-[1.6]">
                            en menos de 80 palabras:{" "}
                            <span className="text-white/65">
                              ¿qué del output vas a usar, qué descartas, qué
                              necesitas validar antes de mandar a Camila?
                            </span>
                          </p>
                        </div>

                        <div>
                          <Textarea
                            label="tu respuesta — máx 320 caracteres"
                            placeholder="del ángulo 1 valido la cifra 41%. del 2 uso la insight. del 3 reescribo el closing..."
                            value={followupText}
                            onValueChange={setFollowupText}
                            variant="flat"
                            maxLength={320}
                            minRows={3}
                            classNames={{
                              inputWrapper:
                                "bg-white/[0.025] border border-white/[0.08] data-[hover=true]:bg-white/[0.04] data-[focus=true]:bg-white/[0.05] data-[focus=true]:border-white/20",
                              input:
                                "text-white placeholder:text-white/30 text-[14px]",
                              label:
                                "text-white/55 text-[12px] uppercase tracking-wider font-medium",
                            }}
                          />
                          <div className="text-right mt-1 text-[11px] text-white/35 mono">
                            {followupText.length}/320
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* ============ STEP 3: ARTIFACT REVIEW ============ */}
                {currentStep.id === 3 && (
                  <div className="space-y-5">
                    {/* Resumen mini */}
                    <div className="flex items-center gap-2 text-[12px] text-white/45">
                      <svg
                        className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0"
                        viewBox="0 0 14 14"
                        fill="none"
                      >
                        <path
                          d="M3 7L6 10L11 4"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>
                        ya recibiste los 3 ángulos · ahora revisas cada uno
                      </span>
                    </div>

                    <div className="bg-white/[0.025] border border-white/[0.06] rounded-2xl p-5">
                      <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-medium mb-2">
                        tu decisión
                      </div>
                      <p className="text-[15px] text-white leading-[1.6]">
                        para cada ángulo, marca los problemas que detectes.{" "}
                        <span className="text-white/65">
                          puedes marcar varios por ángulo, o ninguno si crees
                          que está bien.
                        </span>
                      </p>
                    </div>

                    {SEGMENTS.map((seg, i) => {
                      const flags = segmentFlags[seg.id] ?? [];
                      const hasFlags = flags.length > 0;
                      return (
                        <Card
                          key={seg.id}
                          className={`bg-white/[0.025] border transition-colors ${
                            hasFlags
                              ? "border-amber-500/30"
                              : "border-white/[0.06]"
                          }`}
                          shadow="none"
                        >
                          <CardBody className="p-5">
                            <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-medium mb-2">
                              segmento {i + 1}
                            </div>
                            <div className="text-white font-medium text-[15px] mb-1.5">
                              {seg.title}
                            </div>
                            <p className="text-white/65 text-[14px] leading-relaxed mb-5">
                              {seg.body}
                            </p>
                            <Divider className="bg-white/[0.06] my-1" />
                            <CheckboxGroup
                              label="problemas en este segmento (marca los que apliquen)"
                              value={flags}
                              onValueChange={(values) =>
                                setSegmentFlags({
                                  ...segmentFlags,
                                  [seg.id]: values,
                                })
                              }
                              orientation="horizontal"
                              classNames={{
                                base: "gap-2 mt-3",
                                label:
                                  "text-[11px] text-white/45 uppercase tracking-wider mb-3 font-medium",
                                wrapper: "flex-wrap gap-3",
                              }}
                            >
                              {REVIEW_TARGETS.map((t) => (
                                <Checkbox
                                  key={t.id}
                                  value={t.id}
                                  size="sm"
                                  classNames={{
                                    label: "text-[13px] text-white/85",
                                  }}
                                >
                                  {t.label}
                                </Checkbox>
                              ))}
                            </CheckboxGroup>
                          </CardBody>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {/* ============ STEP 4: DECISION SELECT ============ */}
                {currentStep.id === 4 && (
                  <div className="space-y-5">
                    {/* Resumen mini */}
                    <div className="flex items-center gap-2 text-[12px] text-white/45">
                      <svg
                        className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0"
                        viewBox="0 0 14 14"
                        fill="none"
                      >
                        <path
                          d="M3 7L6 10L11 4"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>
                        revisaste los ángulos · ahora se los entregas a Camila
                      </span>
                    </div>

                    <div className="bg-white/[0.025] border border-white/[0.06] rounded-2xl p-5">
                      <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-medium mb-2">
                        tu decisión
                      </div>
                      <p className="text-[15px] text-white leading-[1.6]">
                        Camila te pide los ángulos por slack.{" "}
                        <span className="text-white/65">
                          elige UNA opción. una vez elijas no podrás cambiar.
                        </span>
                      </p>
                    </div>

                    <RadioGroup
                      aria-label="opción de entrega a Camila"
                      value={option4}
                      onValueChange={setOption4}
                      classNames={{ wrapper: "gap-2" }}
                    >
                      {ENTREGA_OPTIONS.map((opt) => {
                        const selected = option4 === opt.id;
                        return (
                          <Card
                            key={opt.id}
                            className={`bg-white/[0.025] border transition-all cursor-pointer ${
                              selected
                                ? "border-indigo-500/40 bg-indigo-500/[0.04]"
                                : "border-white/[0.06] hover:border-white/15"
                            }`}
                            shadow="none"
                          >
                            <CardBody className="p-4">
                              <Radio value={opt.id} size="md">
                                <div className="ml-1">
                                  <div className="text-white text-[15px] font-medium leading-tight">
                                    {opt.label}
                                  </div>
                                  <div className="text-white/55 text-[13px] mt-0.5 leading-snug">
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

                {/* ============ STEP 5: DECISION OPEN SHORT ============ */}
                {currentStep.id === 5 && (
                  <div className="space-y-5">
                    {/* Resumen mini */}
                    <div className="flex items-center gap-2 text-[12px] text-white/45">
                      <svg
                        className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0"
                        viewBox="0 0 14 14"
                        fill="none"
                      >
                        <path
                          d="M3 7L6 10L11 4"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>
                        ya entregaste los ángulos · Camila te contesta
                      </span>
                    </div>

                    <Card
                      className="bg-white/[0.025] border border-white/[0.06]"
                      shadow="none"
                    >
                      <CardBody className="p-5">
                        <div className="flex items-start gap-4">
                          <Avatar
                            size="md"
                            className="bg-gradient-to-br from-pink-500 via-rose-400 to-orange-400 text-white font-semibold flex-shrink-0"
                            name="C"
                          />
                          <div className="flex-1">
                            <div className="text-[12px] text-white/45 mb-1.5">
                              Camila · hace 2 min
                            </div>
                            <p className="text-white/85 text-[15px] leading-[1.6]">
                              "gracias. oye, ¿podemos usar también el{" "}
                              <span className="text-amber-300/90">
                                revenue_potential
                              </span>{" "}
                              para priorizar a quién mandamos el email?
                              rankeamos top 20% y a ellos primero."
                            </p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    <div className="bg-white/[0.025] border border-white/[0.06] rounded-2xl p-5">
                      <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-medium mb-2">
                        tu decisión
                      </div>
                      <p className="text-[15px] text-white leading-[1.6]">
                        responde a Camila por slack.{" "}
                        <span className="text-white/65">
                          máximo 280 caracteres. responde como lo harías en tu
                          trabajo real.
                        </span>
                      </p>
                    </div>

                    <Textarea
                      label="tu respuesta a Camila — máx 280 caracteres"
                      placeholder="escribe directamente..."
                      value={step5Text}
                      onValueChange={setStep5Text}
                      variant="flat"
                      maxLength={280}
                      minRows={4}
                      classNames={{
                        inputWrapper:
                          "bg-white/[0.025] border border-white/[0.08] data-[hover=true]:bg-white/[0.04] data-[focus=true]:bg-white/[0.05] data-[focus=true]:border-white/20",
                        input:
                          "text-white placeholder:text-white/30 text-[14px]",
                        label:
                          "text-white/55 text-[12px] uppercase tracking-wider font-medium",
                      }}
                    />
                    <div className="text-right text-[11px] text-white/35 mono">
                      {step5Text.length}/280
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Fixed footer with next button */}
      <div className="fixed bottom-0 inset-x-0 bg-black/85 backdrop-blur-2xl border-t border-white/[0.06] z-20">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-[12px] text-white/45 min-w-0">
            <span className="mono">
              paso {currentStep.id}/{STEPS.length}
            </span>
            <span className="text-white/25 hidden sm:inline">·</span>
            <span className="hidden sm:inline truncate">
              {currentStep.label}
            </span>
            {!canAdvance && (
              <>
                <span className="text-white/25 hidden md:inline">·</span>
                <span className="hidden md:inline text-white/35 italic">
                  completa para avanzar
                </span>
              </>
            )}
          </div>
          <Button
            size="lg"
            radius="full"
            isDisabled={!canAdvance}
            onPress={next}
            className="h-11 px-6 font-medium bg-white text-black hover:bg-white/90 disabled:bg-white/[0.06] disabled:text-white/30 shadow-[0_4px_20px_-4px_rgba(255,255,255,0.4)] disabled:shadow-none flex-shrink-0"
          >
            {stepIndex === STEPS.length - 1
              ? "terminar caso →"
              : "siguiente paso →"}
          </Button>
        </div>
      </div>
    </div>
  );
}

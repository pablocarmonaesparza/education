"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  Checkbox,
  CheckboxGroup,
  Radio,
  RadioGroup,
} from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";
import { RuntimeNav } from "@/components/simulador/RuntimeNav";
import { useSession } from "@/lib/simulador/use-session";
import { useStepPatch } from "@/lib/simulador/use-step-patch";
import type { RuntimeSessionMode } from "@/lib/simulador/use-session";
import type { RuntimeCaseMeta } from "@/lib/simulador/runtime-case-meta";

// step_key canónicos del caso (ver simulador.case_steps).
// El ordinal aquí coincide con el sectionIdx (1..5) — intro=0 no persiste.
const STEP_KEY_BY_SECTION: Record<string, string> = {
  step1: "data_scope",
  step2: "llm_beat",
  step3: "artifact_review",
  step4: "decision_select",
  step5: "decision_open_short",
};
const STEP_ORDER = [
  "data_scope",
  "llm_beat",
  "artifact_review",
  "decision_select",
  "decision_open_short",
] as const;

type ReportPayload = {
  preliminary?: boolean;
  participant_note?: string;
  dimensions: Array<{
    id: "contexto" | "privacidad" | "validacion" | "juicio" | "decision";
    band: "A" | "M" | "B";
    rationale: string;
    confidence: number;
  }>;
  risk_events: Array<{
    type: string;
    severity: "low" | "medium" | "high";
    step_ordinal: number;
    evidence_text: string;
  }>;
  gaps: Array<{
    id: string;
    severity: "low" | "medium" | "high";
    observed: string;
    why_matters: string;
  }>;
  strengths: string[];
  recommendation: {
    action: "pilotar" | "entrenar" | "pausar" | "escalar";
    reason: string;
    next_week_actions: string[];
  };
};

// ============ DATA ============

const TRANSCRIBE_ENABLED = process.env.NEXT_PUBLIC_ENABLE_TRANSCRIBE === "true";
const FIELD_OPTIONS = ["Usar tal cual", "Transformar", "Descartar"] as const;

const FIELDS = [
  {
    key: "name",
    label: "name",
    desc: "Columna disponible en el CSV.",
  },
  {
    key: "email",
    label: "email",
    desc: "Columna disponible en el CSV.",
  },
  {
    key: "company",
    label: "company",
    desc: "Columna disponible en el CSV.",
  },
  {
    key: "complaint_or_praise",
    label: "complaint_or_praise",
    desc: "Texto libre del cliente sobre el producto.",
  },
  {
    key: "revenue_potential_usd",
    label: "revenue_potential_usd",
    desc: "Valor comercial estimado asociado al cliente.",
  },
  {
    key: "signed_at",
    label: "signed_at",
    desc: "Fecha de firma del contrato.",
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
  { id: "no_issue", label: "Lo usaría" },
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

// 4 opciones legítimas (no jerarquía obvia). El judge evalúa la decisión
// en contexto del resto de la sesión, no por la opción aislada.
const ENTREGA_OPTIONS = [
  {
    id: "option_a",
    label: "Tres ángulos pulidos, listos para que Camila decida rápido.",
    sub: "Priorizas velocidad y claridad ejecutiva.",
  },
  {
    id: "option_b",
    label: "Tres ángulos + una nota breve de supuestos y pendientes.",
    sub: "Das contexto sin frenar el deadline.",
  },
  {
    id: "option_c",
    label: "Tres ángulos + recomendación de una revisión corta antes de lanzar.",
    sub: "Agregas una pausa de control al flujo.",
  },
  {
    id: "option_d",
    label: "Un borrador completo con ajustes mínimos para ahorrar tiempo.",
    sub: "Le das material amplio para que ella edite.",
  },
];

// ============ SECTIONS ============

type SectionId = "intro" | "step1" | "step2" | "step3" | "step4" | "step5";

// Each section declares how many screens it has.
// Screen content is rendered by switch inside the page.
const SECTIONS: { id: SectionId; label: string; screens: number }[] = [
  { id: "intro", label: "Contexto", screens: 5 },
  { id: "step1", label: "Datos", screens: 2 + FIELDS.length }, // intro + dataset preview + 6 fields = 8
  { id: "step2", label: "IA", screens: 3 },
  { id: "step3", label: "Revisión", screens: SEGMENTS.length }, // 3
  { id: "step4", label: "Decisión", screens: 1 },
  { id: "step5", label: "Respuesta", screens: 2 },
];

// ============ RUNTIME ============

export function RuntimeExperience({
  mode = "authenticated",
  caseSlug,
}: {
  mode?: RuntimeSessionMode;
  caseSlug: string | null | undefined;
}) {
  const router = useRouter();

  const session = useSession(caseSlug, { mode });
  const { patch, flush } = useStepPatch(session.sessionId, { mode });

  const [sectionIdx, setSectionIdx] = useState(0);
  const [screenIdx, setScreenIdx] = useState(0);
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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldTestReport, setFieldTestReport] = useState<ReportPayload | null>(
    null,
  );

  // Tracking del último payload enviado por step_key. Si la próxima emisión
  // serializa al mismo string, el efecto NO dispara PATCH (evita ruido en
  // audit_log + ahorra round-trips). Se prefilla durante hydration.
  const lastSentRef = useRef<Record<string, string>>({});
  const hydratedRef = useRef(false);
  const fieldTestClosedRef = useRef(false);

  const currentSection = SECTIONS[sectionIdx];
  const isFieldTest = mode === "field_test";

  // ============ HYDRATION (resume) ============
  useEffect(() => {
    if (session.status !== "ready" || hydratedRef.current) return;
    const r = session.responses;
    if (!r || typeof r !== "object") {
      hydratedRef.current = true;
      return;
    }

    type DataScopePayload = { field_actions?: Record<string, string> };
    type LlmBeatPayload = {
      user_prompt?: string;
      model_response?: string | null;
      followup?: string;
    };
    type ArtifactReviewPayload = { segment_flags?: Record<number, string[]> };
    type DecisionSelectPayload = { option?: string };
    type DecisionOpenShortPayload = { text?: string };

    const ds = r.data_scope as DataScopePayload | undefined;
    const lb = r.llm_beat as LlmBeatPayload | undefined;
    const ar = r.artifact_review as ArtifactReviewPayload | undefined;
    const dsel = r.decision_select as DecisionSelectPayload | undefined;
    const dos = r.decision_open_short as DecisionOpenShortPayload | undefined;

    if (ds?.field_actions) setFieldActions(ds.field_actions);
    if (lb) {
      if (typeof lb.user_prompt === "string") setUserPrompt(lb.user_prompt);
      if (lb.model_response !== undefined)
        setModelResponse(lb.model_response ?? null);
      if (typeof lb.followup === "string") setFollowupText(lb.followup);
    }
    if (ar?.segment_flags) {
      // claves vienen como strings desde JSON; recovertimos a number.
      const flags: Record<number, string[]> = {};
      for (const [k, v] of Object.entries(ar.segment_flags)) {
        flags[Number(k)] = v as string[];
      }
      setSegmentFlags(flags);
    }
    if (typeof dsel?.option === "string") setOption4(dsel.option);
    if (typeof dos?.text === "string") setStep5Text(dos.text);

    // Pre-fill lastSentRef con los valores resumidos, evita re-emit.
    if (ds) lastSentRef.current.data_scope = JSON.stringify(ds);
    if (lb) lastSentRef.current.llm_beat = JSON.stringify(lb);
    if (ar) lastSentRef.current.artifact_review = JSON.stringify(ar);
    if (dsel) lastSentRef.current.decision_select = JSON.stringify(dsel);
    if (dos) lastSentRef.current.decision_open_short = JSON.stringify(dos);

    // Saltar al último step contestado + 1 (o quedarse en el último si todos).
    let lastIdx = 0;
    STEP_ORDER.forEach((sk, i) => {
      if (r[sk]) lastIdx = i + 1; // section indexes: 0=intro, 1..5=step1..step5
    });
    const targetSection = Math.min(lastIdx, SECTIONS.length - 1);
    setSectionIdx(targetSection);
    setMaxReached(targetSection);

    hydratedRef.current = true;
  }, [session.status, session.responses]);

  // ============ AUTO-PATCH por step_key ============
  // Cada efecto se dispara cuando cambia el bucket de estado correspondiente.
  // El hook useStepPatch hace debounce 800ms + dedup contra lastSentRef.

  const emitIfChanged = useCallback(
    (stepKey: string, payload: unknown) => {
      if (!session.sessionId) return;
      const serialized = JSON.stringify(payload);
      if (lastSentRef.current[stepKey] === serialized) return;
      lastSentRef.current[stepKey] = serialized;
      patch(stepKey, payload);
    },
    [session.sessionId, patch],
  );

  useEffect(() => {
    if (!hydratedRef.current || session.status !== "ready") return;
    emitIfChanged("data_scope", { field_actions: fieldActions });
  }, [fieldActions, session.status, emitIfChanged]);

  useEffect(() => {
    if (!hydratedRef.current || session.status !== "ready") return;
    emitIfChanged("llm_beat", {
      user_prompt: userPrompt,
      model_response: modelResponse,
      followup: followupText,
    });
  }, [userPrompt, modelResponse, followupText, session.status, emitIfChanged]);

  useEffect(() => {
    if (!hydratedRef.current || session.status !== "ready") return;
    emitIfChanged("artifact_review", { segment_flags: segmentFlags });
  }, [segmentFlags, session.status, emitIfChanged]);

  useEffect(() => {
    if (!hydratedRef.current || session.status !== "ready") return;
    const selected = ENTREGA_OPTIONS.find((option) => option.id === option4);
    emitIfChanged("decision_select", {
      option: option4,
      option_label: selected?.label ?? null,
      option_sub: selected?.sub ?? null,
    });
  }, [option4, session.status, emitIfChanged]);

  useEffect(() => {
    if (!hydratedRef.current || session.status !== "ready") return;
    emitIfChanged("decision_open_short", { text: step5Text });
  }, [step5Text, session.status, emitIfChanged]);

  function goToSection(idx: number) {
    if (idx <= maxReached) {
      setSectionIdx(idx);
      setScreenIdx(0);
    }
  }

  const trackFieldTestEvent = useCallback(async (
    eventName:
      | "section_completed"
      | "abandoned"
      | "report_viewed",
    payload: Record<string, unknown> = {},
  ) => {
    if (!isFieldTest || !session.sessionId) return;
    try {
      await fetch(`/api/field-test/sessions/${session.sessionId}/events`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          event_name: eventName,
          step_key: currentSection.id,
          payload,
        }),
      });
    } catch (err) {
      console.warn("[runtime] field-test analytics failed", err);
    }
  }, [currentSection.id, isFieldTest, session.sessionId]);

  useEffect(() => {
    if (!isFieldTest) return;
    if (
      session.simulationStatus &&
      ["submitted", "evaluating", "published", "failed"].includes(
        session.simulationStatus,
      )
    ) {
      fieldTestClosedRef.current = true;
    }
  }, [isFieldTest, session.simulationStatus]);

  useEffect(() => {
    if (!isFieldTest || !session.sessionId) return;

    function markAbandoned() {
      if (fieldTestClosedRef.current || !session.sessionId) return;
      fieldTestClosedRef.current = true;
      void fetch(`/api/field-test/sessions/${session.sessionId}/events`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          event_name: "abandoned",
          step_key: currentSection.id,
          payload: {
            section: currentSection.label,
            section_idx: sectionIdx,
            screen_idx: screenIdx,
          },
        }),
        keepalive: true,
      }).catch((err) =>
        console.warn("[runtime] field-test abandonment analytics failed", err),
      );
    }

    function onVisibilityChange() {
      if (document.visibilityState === "hidden") markAbandoned();
    }

    window.addEventListener("pagehide", markAbandoned);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("pagehide", markAbandoned);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [
    currentSection.id,
    currentSection.label,
    isFieldTest,
    sectionIdx,
    session.sessionId,
    screenIdx,
  ]);

  const pollFieldTestReport = useCallback(async (
    sessionId: string,
  ): Promise<ReportPayload> => {
    for (let i = 0; i < 30; i += 1) {
      const res = await fetch(`/api/field-test/sessions/${sessionId}/report`, {
        cache: "no-store",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error ?? "No se pudo leer el reporte.");
      }
      if (data?.payload) {
        return data.payload as ReportPayload;
      }
      if (data?.session_status === "failed") {
        throw new Error(data?.message ?? "No se pudo generar el reporte.");
      }
      await new Promise((resolve) => setTimeout(resolve, 2500));
    }
    throw new Error("El reporte está tardando más de lo esperado.");
  }, []);

  const advanceSection = useCallback(() => {
    const currentStepKey = STEP_KEY_BY_SECTION[currentSection.id];
    const nextIdx = sectionIdx + 1;

    if (nextIdx <= SECTIONS.length - 1) {
      // Flush en background, navegamos inmediato (UX > durabilidad estricta).
      // Si el browser cierra antes de que se envíe, se pierde sólo el último
      // patch debounced del step (≤800ms de edición). Aceptable para MVP.
      if (currentStepKey) {
        void flush(currentStepKey).catch((err) =>
          console.warn("[runtime] flush failed (non-fatal)", err),
        );
      }
      void trackFieldTestEvent("section_completed", {
        section: currentSection.label,
        section_idx: sectionIdx,
      });
      setSectionIdx(nextIdx);
      setScreenIdx(0);
      setMaxReached((m) => Math.max(m, nextIdx));
      return;
    }

    // Final submit: aquí SÍ esperamos a que todo flushe + complete responda.
    setSubmitError(null);
    setIsEvaluating(true);
    if (isFieldTest) fieldTestClosedRef.current = true;
    (async () => {
      try {
        await flush();
        if (!session.sessionId) {
          throw new Error("Sesión no inicializada.");
        }
        const basePath = isFieldTest ? "/api/field-test/sessions" : "/api/sessions";
        const res = await fetch(`${basePath}/${session.sessionId}/complete`, {
          method: "POST",
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(data?.error ?? "No se pudo enviar la sesión.");
        }
        if (isFieldTest) {
          const report = await pollFieldTestReport(session.sessionId);
          setFieldTestReport(report);
          setIsEvaluating(false);
          return;
        }
        router.push(`/report/${session.sessionId}`);
      } catch (err) {
        setIsEvaluating(false);
        setSubmitError(
          err instanceof Error ? err.message : "Error al enviar la sesión.",
        );
      }
    })();
  }, [
    currentSection.id,
    currentSection.label,
    sectionIdx,
    flush,
    session.sessionId,
    router,
    isFieldTest,
    trackFieldTestEvent,
    pollFieldTestReport,
  ]);

  function nextScreen() {
    if (screenIdx < currentSection.screens - 1) {
      setScreenIdx((s) => s + 1);
    } else {
      advanceSection();
    }
  }

  function prevScreen() {
    if (screenIdx > 0) {
      setScreenIdx((s) => s - 1);
    } else if (sectionIdx > 0) {
      const prevSectionIdx = sectionIdx - 1;
      setSectionIdx(prevSectionIdx);
      setScreenIdx(SECTIONS[prevSectionIdx].screens - 1);
    }
  }

  async function sendPrompt() {
    if (!userPrompt.trim()) return;
    setIsModelThinking(true);
    if (isFieldTest && session.sessionId) {
      try {
        const res = await fetch(
          `/api/field-test/sessions/${session.sessionId}/llm`,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ prompt: userPrompt }),
          },
        );
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(data?.error ?? "No se pudo consultar el modelo.");
        }
        setModelResponse(data.model_response);
      } catch (err) {
        setSubmitError(
          err instanceof Error
            ? err.message
            : "No se pudo consultar el modelo.",
        );
      } finally {
        setIsModelThinking(false);
      }
      return;
    }
    setTimeout(() => {
      setModelResponse(MODEL_RESPONSE_SAMPLE);
      setIsModelThinking(false);
    }, 1600);
  }

  // ============ CAN ADVANCE PER SLIDE ============
  const canAdvance = useMemo(() => {
    if (currentSection.id === "intro") return true; // reading screens
    if (currentSection.id === "step1") {
      if (screenIdx === 0) return true; // brief
      if (screenIdx === 1) return true; // dataset preview
      const field = FIELDS[screenIdx - 2];
      return field ? !!fieldActions[field.key] : false;
    }
    if (currentSection.id === "step2") {
      if (screenIdx === 0)
        return userPrompt.trim().length > 5 && modelResponse !== null;
      if (screenIdx === 1) return modelResponse !== null;
      if (screenIdx === 2) return followupText.trim().length > 10;
    }
    if (currentSection.id === "step3") {
      const flags = segmentFlags[screenIdx];
      return Array.isArray(flags) && flags.length > 0;
    }
    if (currentSection.id === "step4") {
      return option4 !== "";
    }
    if (currentSection.id === "step5") {
      if (screenIdx === 0) return true; // reading Camila's msg
      if (screenIdx === 1) return step5Text.trim().length > 20;
    }
    return false;
  }, [
    currentSection,
    screenIdx,
    fieldActions,
    userPrompt,
    modelResponse,
    followupText,
    segmentFlags,
    option4,
    step5Text,
  ]);

  useEffect(() => {
    if (!isFieldTest || session.status !== "ready" || !session.sessionId) return;
    if (fieldTestReport) return;
    if (
      session.reportStatus === "published" ||
      session.simulationStatus === "submitted" ||
      session.simulationStatus === "evaluating" ||
      session.simulationStatus === "published"
    ) {
      setIsEvaluating(true);
      pollFieldTestReport(session.sessionId)
        .then((report) => setFieldTestReport(report))
        .catch((err) =>
          setSubmitError(
            err instanceof Error ? err.message : "No se pudo leer el reporte.",
          ),
        )
        .finally(() => setIsEvaluating(false));
    }
  }, [
    fieldTestReport,
    isFieldTest,
    pollFieldTestReport,
    session.reportStatus,
    session.sessionId,
    session.simulationStatus,
    session.status,
  ]);

  // ============ SESSION LOADING ============
  if (session.status === "creating") {
    return (
      <>
        <RuntimeNav mode={mode} />
        <main className="surface-canvas min-h-screen grid place-items-center px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-md text-center"
          >
            <div className="mx-auto h-9 w-9 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin" />
            <p className="mt-6 text-[14px] text-[var(--text-secondary)]">
              Preparando tu sesión…
            </p>
          </motion.div>
        </main>
      </>
    );
  }

  // ============ SESSION ERROR ============
  if (session.status === "error") {
    return (
      <>
        <RuntimeNav mode={mode} />
        <main className="surface-canvas min-h-screen grid place-items-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md text-center"
          >
            <div className="eyebrow mb-4">No se pudo iniciar el caso</div>
            <p className="text-[15px] text-[var(--text-secondary)]">
              {session.error ?? "Error inesperado al cargar la sesión."}
            </p>
            <div className="mt-8">
              <Button
                onPress={() => router.push("/dashboard")}
                radius="full"
                size="lg"
                variant="bordered"
                className="h-12 px-6 border-[var(--border-strong)] text-[var(--text-primary)] bg-[var(--surface)]"
              >
                Volver al dashboard
              </Button>
            </div>
          </motion.div>
        </main>
      </>
    );
  }

  // ============ EVALUATING ============
  // Nota: submitError se muestra solo en el bottom action bar de la pantalla
  // de runtime; cuando hay error, isEvaluating ya se puso false y volvemos a
  // esa pantalla. No duplicamos el mensaje aquí.
  if (isEvaluating) {
    return (
      <>
        <RuntimeNav mode={mode} />
        <main className="surface-canvas min-h-screen grid place-items-center px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-md"
          >
            <div className="mx-auto h-10 w-10 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin" />
            <h2 className="display mt-8 text-[28px] text-[var(--text-primary)] text-center">
              Preparando tu reporte.
            </h2>
            <p className="mt-3 text-[15px] text-[var(--text-secondary)] text-center">
              Estamos revisando tus decisiones y armando una lectura preliminar.
            </p>
          </motion.div>
        </main>
      </>
    );
  }

  // Nota: la pantalla post-submit ("Caso terminado / Gracias por participar")
  // fue reemplazada por router.push(`/report/${session.sessionId}`) en
  // advanceSection. La página de reporte (W5/W6) maneja loading + judge polling.
  if (fieldTestReport && session.sessionId) {
    return (
      <>
        <RuntimeNav mode={mode} />
        <FieldTestReportInline
          payload={fieldTestReport}
          sessionId={session.sessionId}
        />
      </>
    );
  }

  // ============ CAPSULES (one per screen of current section) ============
  const capsuleCount = currentSection.screens;

  return (
    <>
      <RuntimeNav mode={mode} />

      <div className="max-w-7xl mx-auto flex min-h-[calc(100vh-3.5rem)]">
        {/* Sidebar (no eyebrow, no borders) */}
        <aside className="hidden md:block flex-shrink-0 w-60">
          <div className="sticky top-[80px] py-10 px-6">
            <RuntimeCaseMetaCard caseMeta={session.caseMeta} />
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
                        <span className="block h-1.5 w-1.5 rounded-full bg-current" />
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
                const filled = i < screenIdx || (i === screenIdx && canAdvance);
                const active = i === screenIdx;
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
                  key={`${currentSection.id}-${screenIdx}`}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  {renderScreen({
                    sectionId: currentSection.id,
                    screenIdx,
                    caseMeta: session.caseMeta,
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
          {submitError && (
            <div className="max-w-2xl mx-auto mb-3 text-center text-[13px] text-[var(--band-b-text)]">
              ⚠ {submitError}
            </div>
          )}
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
            {screenIdx > 0 || sectionIdx > 0 ? (
              <Button
                radius="full"
                size="lg"
                variant="bordered"
                onPress={prevScreen}
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
              onPress={nextScreen}
              isDisabled={!canAdvance}
              className={`h-11 px-6 text-[14px] font-medium ${
                canAdvance
                  ? "accent-bg text-white hover:opacity-90"
                  : "bg-[var(--surface-3)] text-[var(--text-tertiary)]"
              } shadow-none btn-hover-shift`}
            >
              {nextButtonLabel(sectionIdx, screenIdx, currentSection.screens)} →
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

function RuntimeCaseMetaCard({
  caseMeta,
}: {
  caseMeta: RuntimeCaseMeta | null;
}) {
  if (!caseMeta) return null;

  return (
    <div className="mb-7 rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-4">
      <div className="flex items-center gap-2">
        <span className="rounded-full accent-bg-soft accent-text px-2 py-0.5 text-[11px] font-semibold">
          {caseMeta.levelShortLabel}
        </span>
        <span className="text-[11px] text-[var(--text-tertiary)]">
          {caseMeta.careerLabel}
        </span>
      </div>
      <div className="mt-3 text-[13px] font-medium leading-snug text-[var(--text-primary)]">
        {caseMeta.title}
      </div>
      <div className="mt-2 text-[12px] leading-snug text-[var(--text-secondary)]">
        {caseMeta.levelLabel}
        {caseMeta.durationEstimateMin
          ? ` · ${caseMeta.durationEstimateMin} min`
          : ""}
      </div>
    </div>
  );
}

// ============ NEXT BUTTON LABEL ============
function nextButtonLabel(
  sectionIdx: number,
  screenIdx: number,
  screensInSection: number,
): string {
  const lastScreenInSection = screenIdx === screensInSection - 1;
  const lastSection = sectionIdx === SECTIONS.length - 1;
  if (lastScreenInSection && lastSection) return "Terminar caso";
  if (lastScreenInSection && sectionIdx === 0) return "Empezar caso";
  return "Siguiente";
}

function bandLabel(band: "A" | "M" | "B") {
  if (band === "A") return "Alto";
  if (band === "M") return "Medio";
  return "Bajo";
}

function severityLabel(severity: "low" | "medium" | "high") {
  if (severity === "high") return "Alta";
  if (severity === "medium") return "Media";
  return "Baja";
}

function humanizeKey(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function FieldTestReportInline({
  payload,
  sessionId,
}: {
  payload: ReportPayload;
  sessionId: string;
}) {
  const [lead, setLead] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    team_size: "",
  });
  const [leadStatus, setLeadStatus] = useState<
    "idle" | "submitting" | "sent" | "error"
  >("idle");
  const [survey, setSurvey] = useState<{
    nps: number | null;
    relevance_score: number | null;
    open_response: string;
  }>({
    nps: null,
    relevance_score: null,
    open_response: "",
  });
  const [surveyStatus, setSurveyStatus] = useState<
    "idle" | "submitting" | "sent" | "error"
  >("idle");

  async function submitLead(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLeadStatus("submitting");
    try {
      const res = await fetch(`/api/field-test/sessions/${sessionId}/lead`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...lead, consent_to_contact: true }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "No se pudo guardar el contacto.");
      }
      setLeadStatus("sent");
    } catch {
      setLeadStatus("error");
    }
  }

  async function submitSurvey(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (survey.nps === null || survey.relevance_score === null) return;

    setSurveyStatus("submitting");
    try {
      const res = await fetch(`/api/field-test/sessions/${sessionId}/survey`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(survey),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "No se pudo guardar la encuesta.");
      }
      setSurveyStatus("sent");
    } catch {
      setSurveyStatus("error");
    }
  }

  return (
    <main className="surface-canvas min-h-[calc(100vh-4rem)] px-6 py-14">
      <div className="max-w-5xl mx-auto">
        <div className="max-w-3xl">
          <div className="eyebrow">Reporte preliminar</div>
          <h1 className="display display-tight mt-5 text-[40px] sm:text-[56px] text-[var(--text-primary)]">
            Tu lectura del caso.
          </h1>
          <p className="mt-6 text-[17px] text-[var(--text-secondary)] leading-[1.6]">
            Esto no es un benchmark ni una certificación. Es una muestra de la
            evidencia que Itera genera para decidir si un equipo puede usar IA
            en flujos reales.
          </p>
          {payload.participant_note && (
            <div className="mt-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-4 text-[13.5px] text-[var(--text-secondary)] leading-[1.55]">
              {payload.participant_note}
            </div>
          )}
        </div>

        <section className="mt-12 grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 card-apple bg-[var(--surface)] p-6">
            <h2 className="text-[18px] font-semibold text-[var(--text-primary)]">
              Bandas por criterio observado
            </h2>
            <div className="mt-6 space-y-4">
              {payload.dimensions.map((dimension) => (
                <div key={dimension.id}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-[14px] font-medium text-[var(--text-primary)] capitalize">
                      {dimension.id}
                    </div>
                    <div className="text-[12px] text-[var(--text-secondary)]">
                      {bandLabel(dimension.band)}
                    </div>
                  </div>
                  <p className="mt-1 text-[13px] text-[var(--text-secondary)] leading-[1.45]">
                    {dimension.rationale}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 card-apple bg-[var(--surface)] p-6">
            <h2 className="text-[18px] font-semibold text-[var(--text-primary)]">
              Recomendación
            </h2>
            <div className="mt-5 inline-flex rounded-full accent-bg-soft accent-text px-3 py-1 text-[13px] font-medium capitalize">
              {payload.recommendation.action}
            </div>
            <p className="mt-5 text-[14px] text-[var(--text-primary)] leading-[1.55]">
              {payload.recommendation.reason}
            </p>
            <ul className="mt-5 space-y-3">
              {payload.recommendation.next_week_actions.map((action) => (
                <li
                  key={action}
                  className="text-[13.5px] text-[var(--text-secondary)] leading-[1.45]"
                >
                  {action}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="card-apple bg-[var(--surface)] p-6">
            <h2 className="text-[18px] font-semibold text-[var(--text-primary)]">
              Eventos de riesgo observados
            </h2>
            {payload.risk_events.length === 0 ? (
              <p className="mt-5 text-[14px] text-[var(--text-secondary)]">
                No se detectaron eventos materiales en esta corrida.
              </p>
            ) : (
              <div className="mt-5 space-y-4">
                {payload.risk_events.map((event, index) => (
                  <div key={`${event.type}-${index}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[14px] font-medium text-[var(--text-primary)]">
                        {humanizeKey(event.type)}
                      </div>
                      <span className="text-[12px] text-[var(--text-secondary)]">
                        {severityLabel(event.severity)}
                      </span>
                    </div>
                    <p className="mt-1 text-[13px] text-[var(--text-secondary)] leading-[1.45]">
                      {event.evidence_text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={submitSurvey}
            className="card-apple bg-[var(--surface)] p-6"
          >
            <h2 className="text-[18px] font-semibold text-[var(--text-primary)]">
              ¿Qué tan útil fue?
            </h2>
            <p className="mt-3 text-[14px] text-[var(--text-secondary)] leading-[1.55]">
              Tres respuestas rápidas nos ayudan a calibrar el diagnóstico sin
              alargar la experiencia.
            </p>

            <div className="mt-6">
              <div className="text-[13px] font-medium text-[var(--text-primary)]">
                ¿Lo recomendarías a otro líder de equipo?
              </div>
              <div className="mt-3 grid grid-cols-6 gap-2">
                {Array.from({ length: 11 }, (_, index) => index).map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() =>
                      setSurvey((current) => ({ ...current, nps: score }))
                    }
                    className={`h-8 rounded-full text-[12px] font-medium transition ${
                      survey.nps === score
                        ? "accent-bg text-white"
                        : "bg-[var(--surface-2)] text-[var(--text-secondary)]"
                    }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <div className="text-[13px] font-medium text-[var(--text-primary)]">
                ¿Qué tan cercano se sintió a tu trabajo?
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() =>
                      setSurvey((current) => ({
                        ...current,
                        relevance_score: score,
                      }))
                    }
                    className={`h-9 min-w-9 rounded-full px-3 text-[12px] font-medium transition ${
                      survey.relevance_score === score
                        ? "accent-bg text-white"
                        : "bg-[var(--surface-2)] text-[var(--text-secondary)]"
                    }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={survey.open_response}
              onChange={(event) =>
                setSurvey((current) => ({
                  ...current,
                  open_response: event.target.value,
                }))
              }
              maxLength={900}
              rows={4}
              placeholder="¿Qué ajustarías para que se sintiera más real?"
              className="mt-5 w-full resize-none rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] p-4 text-[14px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)]"
            />

            <Button
              type="submit"
              radius="full"
              isDisabled={
                surveyStatus === "submitting" ||
                surveyStatus === "sent" ||
                survey.nps === null ||
                survey.relevance_score === null
              }
              className="mt-4 h-11 accent-bg text-white text-[14px] font-medium shadow-none"
            >
              {surveyStatus === "sent"
                ? "Gracias"
                : surveyStatus === "submitting"
                  ? "Guardando…"
                  : "Enviar feedback"}
            </Button>
            {surveyStatus === "error" && (
              <p className="mt-3 text-[13px] text-[var(--band-b-text)]">
                No se pudo guardar. Intenta otra vez.
              </p>
            )}
          </form>

          <form
            onSubmit={submitLead}
            className="card-apple bg-[var(--surface)] p-6"
          >
            <h2 className="text-[18px] font-semibold text-[var(--text-primary)]">
              ¿Quieres verlo con tu equipo?
            </h2>
            <p className="mt-3 text-[14px] text-[var(--text-secondary)] leading-[1.55]">
              Déjanos tus datos y te mandamos el reporte completo del caso de
              muestra con la forma de correrlo en un equipo real.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-3">
              {[
                ["name", "Nombre"],
                ["email", "Email"],
                ["company", "Empresa"],
                ["role", "Rol"],
                ["team_size", "Tamaño del equipo"],
              ].map(([key, placeholder]) => (
                <input
                  key={key}
                  required={key === "name" || key === "email" || key === "company"}
                  type={key === "email" ? "email" : "text"}
                  placeholder={placeholder}
                  value={lead[key as keyof typeof lead]}
                  onChange={(event) =>
                    setLead((current) => ({
                      ...current,
                      [key]: event.target.value,
                    }))
                  }
                  className="h-11 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] px-4 text-[14px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                />
              ))}
            </div>
            <Button
              type="submit"
              radius="full"
              isDisabled={leadStatus === "submitting" || leadStatus === "sent"}
              className="mt-5 h-11 accent-bg text-white text-[14px] font-medium shadow-none"
            >
              {leadStatus === "sent"
                ? "Recibido"
                : leadStatus === "submitting"
                  ? "Enviando…"
                  : "Enviar reporte completo"}
            </Button>
            {leadStatus === "error" && (
              <p className="mt-3 text-[13px] text-[var(--band-b-text)]">
                No se pudo enviar. Intenta otra vez.
              </p>
            )}
          </form>
        </section>
      </div>
    </main>
  );
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

function renderScreen({
  sectionId,
  screenIdx,
  caseMeta,
  state,
  setters,
  sendPrompt,
}: {
  sectionId: SectionId;
  screenIdx: number;
  caseMeta: RuntimeCaseMeta | null;
  state: RuntimeState;
  setters: RuntimeSetters;
  sendPrompt: () => void;
}) {
  // ============ INTRO ============
  if (sectionId === "intro") {
    return <IntroScreen screenIdx={screenIdx} caseMeta={caseMeta} />;
  }

  // ============ STEP 1 ============
  if (sectionId === "step1") {
    if (screenIdx === 0) return <Step1Brief />;
    if (screenIdx === 1) return <Step1DatasetPreview />;
    const field = FIELDS[screenIdx - 2];
    if (field) {
      return (
        <Step1FieldDecision
          field={field}
          fieldIdx={screenIdx - 1}
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
    if (screenIdx === 0) {
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
    if (screenIdx === 1) {
      return <Step2Response modelResponse={state.modelResponse} />;
    }
    if (screenIdx === 2) {
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
    const seg = SEGMENTS[screenIdx];
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
    if (screenIdx === 0) return <Step5CamilaMessage />;
    if (screenIdx === 1) {
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

function IntroScreen({
  screenIdx,
  caseMeta,
}: {
  screenIdx: number;
  caseMeta: RuntimeCaseMeta | null;
}) {
  if (screenIdx === 0) {
    const title = caseMeta?.title ?? "Campaña urgente con feedback de clientes";
    const durationLabel = caseMeta?.durationEstimateMin
      ? `${caseMeta.durationEstimateMin} min`
      : "18 min";

    return (
      <>
        <div className="eyebrow">
          Diagnóstico · {caseMeta?.careerLabel ?? "Marketing/Growth"} ·{" "}
          {durationLabel}
        </div>
        {caseMeta && (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="rounded-full accent-bg-soft accent-text px-3 py-1 text-[12px] font-semibold">
              {caseMeta.levelShortLabel} · {caseMeta.levelLabel}
            </span>
            <span className="rounded-full bg-[var(--surface)] border border-[var(--border)] px-3 py-1 text-[12px] text-[var(--text-secondary)]">
              {humanizeKey(caseMeta.difficulty ?? "baseline")}
            </span>
          </div>
        )}
        <h1 className="display display-tight mt-6 text-[44px] sm:text-[60px] text-[var(--text-primary)]">
          {title}.
        </h1>
        <p className="mt-8 text-[19px] text-[var(--text-secondary)] leading-[1.55]">
          Vas a interpretar el rol de un Marketing Manager bajo presión. No hay
          respuesta única correcta: evaluamos tu criterio.
        </p>
        {caseMeta && (
          <p className="mt-4 text-[15px] text-[var(--text-tertiary)] leading-[1.55]">
            {caseMeta.levelDescription}
          </p>
        )}
      </>
    );
  }
  if (screenIdx === 1) {
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
  if (screenIdx === 2) {
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
          de clientes que CS dejó hace 2 meses.
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
  if (screenIdx === 3) {
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
  if (screenIdx === 4) {
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
              Al final recibirás una lectura preliminar de cómo resolviste el caso.
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
        define la calidad y el riesgo de la entrega.
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
        Esto es lo que CS dejó hace 2 meses. Revisa los campos antes de
        pasar el dataset al modelo.
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
      <div className="mt-5">
        <p className="text-[17px] text-[var(--text-secondary)]">{field.desc}</p>
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
        La calidad del prompt define el output. Sé claro con audiencia,
        tono, longitud y restricciones del trabajo.
      </p>
      <div className="mt-8">
        <AIPromptInput
          value={value}
          onChange={onChange}
          modelResponse={modelResponse}
          isModelThinking={isModelThinking}
          onSend={onSend}
        />
        {modelResponse && (
          <div className="mt-5 flex items-center gap-2 text-[13px] text-[var(--band-a-text)]">
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8.5L6.5 12L13 4.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>
              El modelo respondió. Pulsa{" "}
              <span className="font-medium">«Siguiente»</span> para leer.
            </span>
          </div>
        )}
      </div>
    </>
  );
}

// ============ MODELS ============

type BrandKey = "internal" | "openai" | "anthropic" | "google" | "qwen" | "deepseek";

type Level5 = 1 | 2 | 3 | 4 | 5;

type ModelOption = {
  id: string;
  label: string;
  badge?: string; // "Thinking", "IT", etc.
  brand: BrandKey;
  price: Level5; // 1 = más barato, 5 = premium
  intel: Level5; // 1 = básico, 5 = frontier
};

type ModelGroup = {
  title: string;
  families: ModelOption[][];
};

const MODEL_GROUPS: ModelGroup[] = [
  {
    title: "Modelos Internos",
    families: [
      [
        {
          id: "gpt-corporativo",
          label: "GPT Corporativo",
          badge: "IT",
          brand: "internal",
          price: 1,
          intel: 3,
        },
      ],
    ],
  },
  {
    title: "Modelos Convencionales",
    families: [
      [
        {
          id: "chatgpt-5.5",
          label: "ChatGPT 5.5",
          brand: "openai",
          price: 3,
          intel: 4,
        },
        {
          id: "chatgpt-5.5-thinking",
          label: "ChatGPT 5.5",
          badge: "Thinking",
          brand: "openai",
          price: 5,
          intel: 5,
        },
      ],
      [
        {
          id: "claude-haiku-4.5",
          label: "Claude Haiku 4.5",
          brand: "anthropic",
          price: 2,
          intel: 3,
        },
        {
          id: "claude-sonnet-4.6",
          label: "Claude Sonnet 4.6",
          brand: "anthropic",
          price: 3,
          intel: 4,
        },
        {
          id: "claude-opus-4.7",
          label: "Claude Opus 4.7",
          brand: "anthropic",
          price: 5,
          intel: 5,
        },
      ],
      [
        {
          id: "gemini-3-flash",
          label: "Gemini 3 Flash",
          brand: "google",
          price: 1,
          intel: 3,
        },
        {
          id: "gemini-3-pro",
          label: "Gemini 3 Pro",
          brand: "google",
          price: 3,
          intel: 5,
        },
      ],
    ],
  },
  {
    title: "Modelos Chinos",
    families: [
      [
        {
          id: "qwen-3.6",
          label: "Qwen 3.6",
          brand: "qwen",
          price: 1,
          intel: 3,
        },
      ],
      [
        {
          id: "deepseek-v4-pro",
          label: "Deepseek V4 Pro",
          brand: "deepseek",
          price: 2,
          intel: 4,
        },
      ],
    ],
  },
];

const DEFAULT_MODEL_ID = "gpt-corporativo";

function findModelById(id: string): ModelOption | null {
  for (const group of MODEL_GROUPS) {
    for (const family of group.families) {
      const found = family.find((m) => m.id === id);
      if (found) return found;
    }
  }
  return null;
}

// ============ Brand mark — uniform square w/ logo from /public/brands/ ============

// Logos por brand. Si un brand tiene `dark`, ese variant se usa cuando
// el body está en `.dark` (next-themes attribute="class").
type BrandLogo = { light: string; dark?: string };

const BRAND_LOGO: Record<BrandKey, BrandLogo | null> = {
  internal: null, // SVG inline (escudo IT)
  openai: {
    light: "/brands/openai.png",
    dark: "/brands/openai-dark.png",
  },
  anthropic: { light: "/brands/anthropic.png" },
  google: { light: "/brands/gemini.png" },
  qwen: { light: "/brands/qwen.png" },
  deepseek: { light: "/brands/deepseek.png" },
};

// Tamaño uniforme del contenedor cuadrado del brand mark.
const BRAND_SIZE = 22;

function BrandMark({ brand }: { brand: BrandKey }) {
  const logo = BRAND_LOGO[brand];

  // Internal — escudo IT inline (no hay archivo)
  if (!logo) {
    return (
      <span
        className="flex-shrink-0 rounded-md grid place-items-center"
        style={{
          width: BRAND_SIZE,
          height: BRAND_SIZE,
          backgroundColor: "var(--text-primary)",
        }}
      >
        <svg
          viewBox="0 0 16 16"
          fill="none"
          className="h-3.5 w-3.5"
          style={{ color: "var(--surface)" }}
        >
          <path
            d="M8 2L13 4v4.5C13 11 11 13 8 14C5 13 3 11 3 8.5V4L8 2Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }

  const imgStyle = {
    width: BRAND_SIZE,
    height: BRAND_SIZE,
    objectFit: "contain" as const,
  };

  return (
    <span
      className="flex-shrink-0 grid place-items-center"
      style={{ width: BRAND_SIZE, height: BRAND_SIZE }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logo.light}
        alt=""
        aria-hidden
        width={BRAND_SIZE}
        height={BRAND_SIZE}
        className={logo.dark ? "block dark:hidden" : "block"}
        style={imgStyle}
      />
      {logo.dark && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo.dark}
          alt=""
          aria-hidden
          width={BRAND_SIZE}
          height={BRAND_SIZE}
          className="hidden dark:block"
          style={imgStyle}
        />
      )}
    </span>
  );
}

// ============ Level meter (5 bars) ============
function LevelMeter({
  value,
  ariaLabel,
}: {
  value: Level5;
  ariaLabel: string;
}) {
  const MAX: Level5 = 5;
  return (
    <span
      className="inline-flex items-end gap-[2px]"
      aria-label={`${ariaLabel} ${value} de ${MAX}`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="block w-[2.5px] rounded-[1px] transition-colors"
          style={{
            height: `${3 + i * 1.6}px`,
            backgroundColor:
              i <= value ? "currentColor" : "var(--border-strong)",
            opacity: i <= value ? 1 : 0.5,
          }}
        />
      ))}
    </span>
  );
}

// ============ useVoiceTranscription · hook compartido ============
type VoiceRecState = "idle" | "recording" | "processing" | "error";

function useVoiceTranscription({
  onTranscript,
  language = "es",
  disabled = false,
}: {
  onTranscript: (text: string) => void;
  language?: string;
  disabled?: boolean;
}) {
  const [recState, setRecState] = useState<VoiceRecState>("idle");
  const [recError, setRecError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const disabledByFlag = disabled || !TRANSCRIBE_ENABLED;

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const flashError = (msg: string, ms = 5000) => {
    setRecError(msg);
    setRecState("error");
    setTimeout(() => {
      setRecState("idle");
      setRecError(null);
    }, ms);
  };

  async function startRecording() {
    setRecError(null);

    if (disabledByFlag) return;

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      return flashError(
        "Tu navegador no soporta grabación de audio. Prueba Chrome o Safari.",
        4000,
      );
    }
    if (!window.isSecureContext) {
      return flashError(
        "El micrófono solo funciona en HTTPS o localhost.",
        4000,
      );
    }

    try {
      const perm = await navigator.permissions?.query({
        name: "microphone" as PermissionName,
      });
      if (perm?.state === "denied") {
        return flashError(
          "El micrófono está bloqueado para este sitio. Resetéalo en la config del navegador (candado/aA en la barra de URL → Micrófono → Preguntar).",
          6000,
        );
      }
    } catch {
      /* Permissions API no soporta "microphone" — seguimos */
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      streamRef.current = stream;
      if (typeof MediaRecorder === "undefined") {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        return flashError(
          "Tu navegador no soporta grabación de audio. Prueba Chrome o Safari.",
          4000,
        );
      }

      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "";
      const recorder = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, {
          type: mime || "audio/webm",
        });
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        await uploadAndTranscribe(blob);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecState("recording");
    } catch (err) {
      console.error("getUserMedia failed:", err);
      let message = "No se pudo iniciar la grabación.";
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          message =
            "Permiso de micrófono denegado. Habilítalo en el candado/aA de la barra de URL → Micrófono → Permitir.";
        } else if (err.name === "NotFoundError") {
          message = "No se detectó ningún micrófono conectado.";
        } else if (err.name === "NotReadableError") {
          message =
            "El micrófono está ocupado por otra app. Ciérrala y vuelve a intentar.";
        }
      }
      flashError(message, 5000);
    }
  }

  function stopRecording() {
    const rec = mediaRecorderRef.current;
    if (rec && rec.state === "recording") {
      setRecState("processing");
      rec.stop();
    }
  }

  async function uploadAndTranscribe(blob: Blob) {
    try {
      const fd = new FormData();
      fd.append("audio", blob, "recording.webm");
      fd.append("language", language);
      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Transcription failed");
      const text = (data.text || "").trim();
      if (text) onTranscript(text);
      setRecState("idle");
    } catch (err) {
      console.error("[transcribe] upload error:", err);
      flashError(
        err instanceof Error ? err.message : "Error al transcribir.",
        3000,
      );
    }
  }

  function onMicClick() {
    if (disabledByFlag) return;
    if (recState === "idle" || recState === "error") {
      startRecording();
    } else if (recState === "recording") {
      stopRecording();
    }
  }

  return { recState, recError, onMicClick };
}

// ============ Banner overlay para estados de grabación ============
function RecordingBanner({
  recState,
  recError,
}: {
  recState: VoiceRecState;
  recError: string | null;
}) {
  return (
    <AnimatePresence>
      {(recState === "recording" ||
        recState === "processing" ||
        recState === "error") && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          className="px-5 pb-2 flex items-center gap-2.5 text-[13px]"
        >
          {recState === "recording" && (
            <>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-50 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
              <span className="text-[var(--text-secondary)] font-medium">
                Escuchando…
              </span>
              <WaveBars />
              <span className="ml-auto text-[12px] text-[var(--text-tertiary)]">
                Pulsa el micrófono para parar.
              </span>
            </>
          )}
          {recState === "processing" && (
            <>
              <svg
                className="h-3.5 w-3.5 animate-spin"
                style={{ color: "var(--accent)" }}
                viewBox="0 0 16 16"
                fill="none"
              >
                <circle
                  cx="8"
                  cy="8"
                  r="6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeOpacity="0.25"
                />
                <path
                  d="M14 8C14 4.69 11.31 2 8 2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-[var(--text-secondary)] font-medium">
                Transcribiendo…
              </span>
            </>
          )}
          {recState === "error" && recError && (
            <span className="text-[var(--band-b-text)]">⚠ {recError}</span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============ ChatStyleTextarea · variante simple (sin model/send) ============
function ChatStyleTextarea({
  value,
  onChange,
  placeholder,
  minHeight = 56,
  maxHeight = 220,
  disabled = false,
  rows = 2,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  disabled?: boolean;
  rows?: number;
}) {
  const { recState, recError, onMicClick } = useVoiceTranscription({
    disabled,
    onTranscript: (text) => {
      const sep = value.trim().length > 0 ? " " : "";
      onChange(value + sep + text);
    },
  });
  const isLocked =
    disabled || recState === "recording" || recState === "processing";

  return (
    <div
      className={`group relative rounded-3xl border bg-[var(--surface)] transition-all ${
        disabled
          ? "border-[var(--border)] opacity-70"
          : "border-[var(--border)] hover:border-[var(--border-strong)] focus-within:border-[var(--accent)]"
      }`}
      style={{
        boxShadow:
          "0 1px 2px var(--shadow), 0 6px 20px -16px var(--shadow)",
      }}
    >
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLocked}
        rows={rows}
        placeholder={placeholder}
        className="w-full bg-transparent resize-none outline-none px-5 pt-4 pb-2 text-[15px] leading-[1.55] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] rounded-3xl disabled:cursor-not-allowed"
        style={{ minHeight, maxHeight }}
      />
      {TRANSCRIBE_ENABLED && (
        <>
          <RecordingBanner recState={recState} recError={recError} />
          <div className="flex items-center justify-end gap-1.5 px-3 pb-3">
            <MicButton
              recState={recState}
              disabled={disabled}
              onClick={onMicClick}
            />
          </div>
        </>
      )}
    </div>
  );
}

function AIPromptInput({
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
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL_ID);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const disabled = modelResponse !== null;
  const canSend = !disabled && !isModelThinking && value.trim().length > 0;
  const currentModel = findModelById(selectedModel) ?? MODEL_GROUPS[0].families[0][0];

  const { recState, recError, onMicClick } = useVoiceTranscription({
    disabled,
    onTranscript: (text) => {
      const sep = value.trim().length > 0 ? " " : "";
      onChange(value + sep + text);
    },
  });

  // Click-outside to close dropdown
  useEffect(() => {
    if (!dropdownOpen) return;
    function onDocClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [dropdownOpen]);

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && canSend) {
      e.preventDefault();
      onSend();
    }
  }

  return (
    <div
      className={`group relative rounded-3xl border bg-[var(--surface)] transition-all ${
        disabled
          ? "border-[var(--border)] opacity-70"
          : "border-[var(--border)] hover:border-[var(--border-strong)] focus-within:border-[var(--accent)]"
      }`}
      style={{
        boxShadow:
          "0 1px 2px var(--shadow), 0 6px 20px -16px var(--shadow)",
      }}
    >
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={disabled || recState === "recording" || recState === "processing"}
        rows={2}
        placeholder="Escribe el prompt que le mandarías al modelo…"
        className="w-full bg-transparent resize-none outline-none px-5 pt-4 pb-2 text-[15px] leading-[1.55] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] rounded-3xl disabled:cursor-not-allowed"
        style={{ minHeight: 56, maxHeight: 220 }}
      />

      {TRANSCRIBE_ENABLED && (
        <RecordingBanner recState={recState} recError={recError} />
      )}

      {/* Bottom toolbar */}
      <div className="flex items-center justify-between gap-3 px-3 pb-3">
        {/* LEFT — model selector + IT badge */}
        <div ref={dropdownRef} className="flex items-center gap-1 relative">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 text-[12px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:hover:text-[var(--text-secondary)] pr-2 pl-1 py-1 rounded-full hover:bg-[var(--surface-3)] disabled:hover:bg-transparent transition-colors"
            aria-label="Selector de modelo"
            aria-expanded={dropdownOpen}
          >
            <BrandMark brand={currentModel.brand} />
            <span>
              {currentModel.label}
              {currentModel.badge && (
                <span className="ml-1 text-[var(--text-tertiary)]">
                  · {currentModel.badge}
                </span>
              )}
            </span>
            <svg
              className={`h-3 w-3 opacity-60 transition-transform ${
                dropdownOpen ? "rotate-180" : ""
              }`}
              viewBox="0 0 12 12"
              fill="none"
            >
              <path
                d="M3 4.5L6 7.5L9 4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>


          {/* Dropdown popover */}
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="absolute bottom-full left-0 mb-2 w-[280px] rounded-2xl bg-[var(--surface)] border border-[var(--border)] py-2 z-50 max-h-[60vh] overflow-y-auto scrollbar-thin"
                style={{
                  boxShadow:
                    "0 12px 32px -8px var(--shadow), 0 2px 6px var(--shadow)",
                }}
              >
                {MODEL_GROUPS.map((group, gi) => (
                  <div key={group.title}>
                    {gi > 0 && (
                      <div className="my-1.5 mx-3 h-px bg-[var(--hairline)]" />
                    )}
                    <div className="px-3 pt-1.5 pb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
                      {group.title}
                    </div>
                    {group.families.map((family, fi) => (
                      <div key={fi}>
                        {fi > 0 && (
                          <div className="my-1 mx-3 h-px bg-[var(--hairline)] opacity-60" />
                        )}
                        {family.map((m) => {
                          const isSelected = m.id === selectedModel;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => {
                                setSelectedModel(m.id);
                                setDropdownOpen(false);
                              }}
                              className={`group/item w-full flex items-center gap-2.5 px-3 py-1.5 text-left text-[13px] transition-colors ${
                                isSelected
                                  ? "bg-[var(--accent-soft)] text-[var(--text-primary)]"
                                  : "text-[var(--text-primary)] hover:bg-[var(--surface-3)]"
                              }`}
                            >
                              <BrandMark brand={m.brand} />
                              <span className="flex-1 flex items-baseline gap-1.5 min-w-0">
                                <span className="truncate">{m.label}</span>
                                {m.badge && (
                                  <span className="text-[11px] text-[var(--text-tertiary)] flex-shrink-0">
                                    · {m.badge}
                                  </span>
                                )}
                              </span>
                              <span className="flex items-center gap-2 text-[var(--text-tertiary)] flex-shrink-0">
                                <span className="flex items-center gap-1">
                                  <span className="text-[9px] font-semibold tracking-wider">
                                    $
                                  </span>
                                  <LevelMeter
                                    value={m.price}
                                    ariaLabel="Precio"
                                  />
                                </span>
                                <span
                                  aria-hidden
                                  className="h-2 w-px bg-[var(--hairline)]"
                                />
                                <span className="flex items-center gap-1">
                                  <svg
                                    className="h-2.5 w-2.5"
                                    viewBox="0 0 10 10"
                                    fill="currentColor"
                                  >
                                    <path d="M5 0L6 4L10 5L6 6L5 10L4 6L0 5L4 4L5 0Z" />
                                  </svg>
                                  <LevelMeter
                                    value={m.intel}
                                    ariaLabel="Inteligencia"
                                  />
                                </span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT — mic + send */}
        <div className="flex items-center gap-1.5">
          {TRANSCRIBE_ENABLED && (
            <MicButton
              recState={recState}
              disabled={disabled}
              onClick={onMicClick}
            />
          )}
          <button
            type="button"
            onClick={onSend}
            disabled={!canSend}
            aria-label="Enviar al modelo"
            className={`h-9 w-9 rounded-full grid place-items-center transition-all ${
              canSend
                ? "accent-bg text-white hover:opacity-90 active:scale-95"
                : "bg-[var(--surface-3)] text-[var(--text-disabled)] cursor-not-allowed"
            }`}
          >
            {isModelThinking ? (
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 16 16"
                fill="none"
              >
                <circle
                  cx="8"
                  cy="8"
                  r="6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeOpacity="0.25"
                />
                <path
                  d="M14 8C14 4.69 11.31 2 8 2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 13V3M8 3L3.5 7.5M8 3L12.5 7.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ Mic button (idle / recording / processing / error) ============
function MicButton({
  recState,
  disabled,
  onClick,
}: {
  recState: "idle" | "recording" | "processing" | "error";
  disabled: boolean;
  onClick: () => void;
}) {
  const isRecording = recState === "recording";
  const isProcessing = recState === "processing";

  const label =
    recState === "recording"
      ? "Detener grabación"
      : recState === "processing"
        ? "Transcribiendo"
        : "Dictar por voz";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isProcessing}
      aria-label={label}
      aria-pressed={isRecording}
      className={`relative h-8 w-8 rounded-full grid place-items-center transition-colors disabled:opacity-40 ${
        isRecording
          ? "bg-red-500/15 text-red-500"
          : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-3)]"
      }`}
    >
      {isRecording && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-red-500/30 animate-ping"
        />
      )}
      {isProcessing ? (
        <svg
          className="h-4 w-4 animate-spin"
          viewBox="0 0 16 16"
          fill="none"
        >
          <circle
            cx="8"
            cy="8"
            r="6"
            stroke="currentColor"
            strokeWidth="2"
            strokeOpacity="0.25"
          />
          <path
            d="M14 8C14 4.69 11.31 2 8 2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ) : isRecording ? (
        // Square stop glyph
        <span className="relative h-2.5 w-2.5 rounded-[2px] bg-current" />
      ) : (
        <svg className="relative h-4 w-4" viewBox="0 0 16 16" fill="none">
          <rect
            x="5.5"
            y="2"
            width="5"
            height="8"
            rx="2.5"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <path
            d="M3 8C3 10.7614 5.23858 13 8 13M8 13C10.7614 13 13 10.7614 13 8M8 13V14.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
}

// ============ Waveform-ish bars while recording (decorative) ============
function WaveBars() {
  return (
    <span className="inline-flex items-end gap-[2px] h-3" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="block w-[2px] bg-red-500 rounded-[1px]"
          style={{
            height: "100%",
            animation: `simulador-wave 0.9s ease-in-out ${i * 0.12}s infinite`,
            transformOrigin: "bottom",
          }}
        />
      ))}
      <style>{`
        @keyframes simulador-wave {
          0%, 100% { transform: scaleY(0.35); }
          50% { transform: scaleY(1); }
        }
      `}</style>
    </span>
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
        <ChatStyleTextarea
          placeholder="Escribe tu decisión y el razonamiento…"
          value={value}
          onChange={onChange}
          rows={4}
          minHeight={96}
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
        El formato cambia cómo se interpreta tu trabajo.
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
        Camila quiere priorizar el envío con un dato comercial del dataset.
        Responde como lo harías por Slack ahora mismo.
      </p>
      <div className="mt-8">
        <ChatStyleTextarea
          placeholder="Tu respuesta a Camila…"
          value={value}
          onChange={onChange}
          rows={4}
          minHeight={96}
        />
      </div>
    </>
  );
}

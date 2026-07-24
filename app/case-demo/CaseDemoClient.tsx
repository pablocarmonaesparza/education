"use client";

/**
 * /case-demo · primer caso ensamblado end-to-end con el formato 5×5.
 *
 * Caso: "Envío del lunes con datos sucios" · Marketing N1 · 12 min.
 * 5 secciones × 5 diapositivas = 25 slides totales.
 * 60% AI-native (15 activos) · 40% pasivos (10 readings).
 *
 * Shell heredado de /case-template (sidebar 5 secciones + progress
 * 5 segmentos + título/body/ejercicio/continuar). Estado de navegación
 * con useState: sectionIdx + slideIdx. Cada slide referencia un
 * block_id del registry y pasa caseContext con su content específico.
 *
 * Bloques que tienen OWNS_CONTINUE (case_cover, ai_textfield_guided,
 * categorize_rows, ai_comparison) manejan su propio botón Continuar via
 * onShellContinue. El shell no muestra su CTA cuando el bloque maneja el
 * suyo · para el resto, el shell bloquea Continuar hasta que el bloque
 * emite evidencia (isBlockComplete · P1.1).
 */

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExerciseBlockRenderer } from "@/components/simulador/ExerciseBlockRenderer";
import {
  AppleBadge,
  AppleCaseHeader,
  AppleSlideButton,
} from "@/components/simulador/apple";
import type { ExerciseBlockId } from "@/lib/simulador/exercise-blocks.generated";
import type { ExerciseResponsePayload } from "@/lib/simulador/exercise-registry";
import { isBlockComplete } from "@/lib/simulador/exercise-completion";
import { SlideBody } from "../exercise-lab/_shared/SlideBody";
import { SLIDES, CASE_ID, type Slide } from "./case-data.generated";

// ============================================================
// SECCIONES (5 obligatorias)
// ============================================================

// `id` es identificador (compone slideId · no cambia) · `name` es display.
const SECTIONS = [
  { id: "contexto", name: "Context" },
  { id: "datos", name: "Data" },
  { id: "ia", name: "AI" },
  { id: "revision", name: "Review" },
  { id: "cierre", name: "Wrap-up" },
] as const;

const SLIDES_PER_SECTION = 5;

// Bloques que manejan su propio botón Continuar internamente (auto-advance
// o subsección de revisión con CTA propio). El resto usa el Continuar del
// shell · el shell consultará completionPredicate del registry para
// bloquear avance si el payload aún no satisface la regla del bloque.
const OWNS_CONTINUE = new Set<ExerciseBlockId>([
  "case_cover",
  "ai_textfield_guided",
  "categorize_rows",
  "ai_comparison",
  // dashboard_pivot · removido en P1.2 · ahora pide leader_takeaway,
  // ya no auto-avanza.
]);

// Variants de la transición entre slides · efecto scroll vertical.
// direction=1 · avanza · slide nueva entra desde abajo, vieja se va arriba
// direction=-1 · regresa · slide nueva entra desde arriba, vieja se va abajo
const SLIDE_VARIANTS = {
  enter: (dir: 1 | -1) => ({
    y: dir > 0 ? "100vh" : "-100vh",
    opacity: 0,
  }),
  center: {
    y: 0,
    opacity: 1,
  },
  exit: (dir: 1 | -1) => ({
    y: dir > 0 ? "-100vh" : "100vh",
    opacity: 0,
  }),
};

// ============================================================
// TIPO Slide

/** Campos que se MUESTRAN al usuario y revelarían la respuesta · el shell
 *  los remueve antes de pasar el caseContext al renderer. Coincide con
 *  CASE_ASSEMBLY_SCHEMA.yaml > rules.judge_internal_fields.
 *
 *  IMPORTANTE · `flagIfMarked` NO va aquí: aunque es metadata del judge,
 *  el bloque ai_output_review lo necesita en runtime para saber qué flag
 *  asignar cuando el usuario marca un segmento (lógica funcional, no
 *  pista visual · nunca se renderiza). Borrarlo rompería el bloque. */
const JUDGE_INTERNAL_FIELDS = [
  "hint",
  "example",
  "issue",
  "goodWhen",
] as const;

/** Strip de los `judge_internal_fields` del caseContext antes de pasar al
 *  renderer. Implementa el contrato de CASE_ASSEMBLY_SCHEMA: los campos
 *  evaluativos se co-localizan en el caso (ergonomía de autoría) pero
 *  NUNCA llegan al cliente del bloque. Cumple la regla transversal
 *  "no enseñar antes de medir".
 *
 *  LIMITACIÓN client-side: en esta vitrina demo el array SLIDES completo
 *  se serializa al bundle, así que los campos internos están técnicamente
 *  en el JavaScript del cliente (no visibles en pantalla, sí en devtools).
 *  El runtime productivo (/case/[case_id]) los mantiene server-side y solo
 *  envía el caseContext ya limpio · ver migration_notes del schema. */
function stripJudgeFields(
  ctx: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!ctx) return ctx;
  const clean = JSON.parse(JSON.stringify(ctx));
  function walk(node: unknown): void {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    const obj = node as Record<string, unknown>;
    for (const field of JUDGE_INTERNAL_FIELDS) {
      delete obj[field];
    }
    Object.values(obj).forEach(walk);
  }
  walk(clean);
  return clean;
}

// ============================================================
// 25 SLIDES DEL CASO
// Caso: Envío del lunes con datos sucios · Marketing N1
// ============================================================
// COMPONENTE
// ============================================================

export function CaseDemoClient() {
  const [sectionIdx, setSectionIdx] = useState(0);
  const [slideIdx, setSlideIdx] = useState(0);
  /** Slide linear más avanzado al que llegó el usuario. Permite la flecha
   *  "Adelante" solo cuando el usuario está revisitando un slide anterior
   *  (es decir, ya pasó por slides más adelante y regresó). */
  const [maxLinearVisited, setMaxLinearVisited] = useState(0);
  /** Store de payloads por slideId · permite preservar respuestas cuando
   *  el usuario navega atrás y adelante sin perder lo que ya respondió.
   *  El ExerciseBlockRenderer hidrata su useState inicial con esto al
   *  remontar y notifica vía onPayloadChange en cada cambio. */
  const [payloads, setPayloads] = useState<Record<string, ExerciseResponsePayload>>({});
  /** Dirección de la transición · 1 = avanza (slide nueva entra desde abajo),
   *  -1 = regresa (slide nueva entra desde arriba). */
  const [direction, setDirection] = useState<1 | -1>(1);
  /** Cuando el participante termina el caso (último slide + Continuar),
   *  reemplazamos el runtime por la pantalla de cierre · simulación del
   *  reporte que el manager recibe. Permite `?completed=1` en la URL
   *  para saltar directo (preview, demos, screenshots). P3 · guard:
   *  solo válido en desarrollo · en producción el skip se ignora. */
  const [isCompleted, setIsCompleted] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    if (process.env.NODE_ENV === "production") return false;
    return new URLSearchParams(window.location.search).get("completed") === "1";
  });
  /** Timestamp de inicio del caso · para calcular duración total al cierre. */
  const [startedAt] = useState(() => Date.now());

  const slide = SLIDES[sectionIdx]?.[slideIdx];
  const ownsContinue = slide ? OWNS_CONTINUE.has(slide.blockId) : false;
  const linearIdx = sectionIdx * SLIDES_PER_SECTION + slideIdx;
  const canGoForward = linearIdx < maxLinearVisited;
  const currentSlideId = `${SECTIONS[sectionIdx].id}-${slideIdx + 1}`;
  /** P1.1 · Continuar se deshabilita si el bloque actual no emitió
   *  evidencia suficiente. El predicate vive en exercise-completion.ts. */
  const currentPayload = payloads[currentSlideId];
  const blockComplete = slide
    ? isBlockComplete(slide.blockId, currentPayload).complete
    : false;

  const goNext = useCallback(() => {
    const nextLinear = linearIdx + 1;
    if (slideIdx < SLIDES_PER_SECTION - 1) {
      setDirection(1);
      setSlideIdx(slideIdx + 1);
    } else if (sectionIdx < SECTIONS.length - 1) {
      setDirection(1);
      setSectionIdx(sectionIdx + 1);
      setSlideIdx(0);
    } else {
      // Última slide · ir a pantalla de cierre
      setIsCompleted(true);
      return;
    }
    setMaxLinearVisited((m) => (nextLinear > m ? nextLinear : m));
  }, [sectionIdx, slideIdx, linearIdx]);

  const goPrev = useCallback(() => {
    if (slideIdx > 0) {
      setDirection(-1);
      setSlideIdx(slideIdx - 1);
    } else if (sectionIdx > 0) {
      setDirection(-1);
      setSectionIdx(sectionIdx - 1);
      setSlideIdx(SLIDES_PER_SECTION - 1);
    }
  }, [sectionIdx, slideIdx]);

  const isFirstSlide = sectionIdx === 0 && slideIdx === 0;

  const handleFeedback = useCallback(() => {
    const slideRef = `${SECTIONS[sectionIdx].id}-${slideIdx + 1}`;
    const subject = encodeURIComponent(
      `Suggestion · demo case · slide ${slideRef}`,
    );
    const body = encodeURIComponent(
      `Slide: ${slideRef}\nTemplate: ${slide?.blockId}\n\nDescribe the suggestion or correction:\n`,
    );
    // P3 · destinatario configurable vía env var · fallback al buzón real del
    // dominio. En Vercel debe estar definido NEXT_PUBLIC_FEEDBACK_EMAIL.
    const to = process.env.NEXT_PUBLIC_FEEDBACK_EMAIL ?? "feedback@itera.la";
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  }, [sectionIdx, slideIdx, slide?.blockId]);

  // Scroll al top al cambiar de slide
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [sectionIdx, slideIdx]);

  // Enter para continuar (solo si no es un bloque que owns continue y
  // sólo si el bloque ya emitió evidencia suficiente · P1.1).
  useEffect(() => {
    if (ownsContinue) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Enter" && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") return;
        if (!blockComplete) return;
        e.preventDefault();
        goNext();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, ownsContinue, blockComplete]);

  if (!slide) return null;

  const isLastSlide =
    sectionIdx === SECTIONS.length - 1 && slideIdx === SLIDES_PER_SECTION - 1;

  // Pantalla de cierre · simulación del reporte que el manager recibe.
  if (isCompleted) {
    const durationMs = Date.now() - startedAt;
    const durationMinutes = Math.max(1, Math.round(durationMs / 60_000));
    return (
      <CaseCompletedScreen
        durationMinutes={durationMinutes}
        payloads={payloads}
      />
    );
  }

  return (
    <main className="simulador-root min-h-screen surface-canvas text-[var(--text-primary)]">
      <div className="flex min-h-screen flex-col">
        <AppleCaseHeader
          total={SLIDES_PER_SECTION}
          current={slideIdx}
          closeHref="/"
          onPrev={goPrev}
          prevDisabled={isFirstSlide}
          onNext={goNext}
          nextDisabled={!canGoForward}
          onFeedback={handleFeedback}
          ariaLabel={`Slide ${slideIdx + 1} of ${SLIDES_PER_SECTION}`}
        />

        {/* CONTENIDO · transición vertical estilo scroll (slide sale arriba,
            nueva entra desde abajo · invertido al regresar). Overflow hidden
            evita scrollbar durante la animación. */}
        <section className="relative flex flex-1 items-center justify-center overflow-hidden py-10">
          <AnimatePresence mode="popLayout" custom={direction} initial={false}>
            <motion.div
              key={currentSlideId}
              custom={direction}
              variants={SLIDE_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="w-[92%] max-w-[1200px] sm:w-[80%] lg:w-[65%]"
            >
              {/* Eyebrow · solo el nombre de la sección · receta v2:
                  extrabold + tracking + acento */}
              <div className="ts-footnote font-extrabold uppercase tracking-[0.8px] text-[var(--accent)]">
                {SECTIONS[sectionIdx].name}
              </div>

              {/* Título */}
              <h1 className="mt-3 display display-tight ts-display text-[var(--text-primary)]">
                {slide.title}
              </h1>

              {/* Body markdown */}
              <SlideBody className="mt-4">{slide.body}</SlideBody>

              {/* Ejercicio · key fuerza re-mount al cambiar de slide para
                  que cada bloque reciba caseContext fresco. initialPayload
                  hidrata el state del bloque con la respuesta previa del
                  store si el usuario está revisitando este slide. */}
              <div className="mt-8">
                <ExerciseBlockRenderer
                  key={currentSlideId}
                  blockId={slide.blockId}
                  sessionId={null}
                  mode="lab_demo"
                  slideId={currentSlideId}
                  caseContext={stripJudgeFields(slide.caseContext)}
                  onShellContinue={goNext}
                  initialPayload={payloads[currentSlideId]}
                  onPayloadChange={(p) =>
                    setPayloads((prev) => ({ ...prev, [currentSlideId]: p }))
                  }
                />
              </div>

              {/* Continuar · solo si el bloque no maneja su propio CTA.
                  Atrás vive en el header arriba (cuadrado con ícono).
                  En la última slide, "Continuar" → pantalla de cierre. */}
              {!ownsContinue && (
                <div className="mt-10">
                  <AppleSlideButton
                    onClick={goNext}
                    isDisabled={!blockComplete}
                    hint={
                      blockComplete ? (
                        true
                      ) : (
                        <span className="ts-footnote text-[var(--text-tertiary)]">
                          Complete the exercise to continue.
                        </span>
                      )
                    }
                  >
                    {isLastSlide ? "See summary →" : "Continue →"}
                  </AppleSlideButton>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}

// ============================================================
// PANTALLA DE CIERRE · simulación del reporte ejecutivo
// Lenguaje visual de /demo (pill de banda + barras chunky con color
// de banda + risk cards tintadas) · single column · sin score numérico
// público (cumple contrato v0: "la banda es la unidad narrativa").
// Consume el store de payloads del shell · P0.2.
// ============================================================

interface CaseCompletedScreenProps {
  durationMinutes: number;
  /** Store de payloads del shell · permite computar bandas y citas
   *  textuales reales en vez de hardcoded. P0.2. */
  payloads: Record<string, ExerciseResponsePayload>;
}

type Band = "alto" | "medio" | "bajo";

/** Capa de display de la banda. Los valores internos ("alto"/"medio"/"bajo")
 *  son identificadores alineados con los enums A/M/B de BD · NO se traducen.
 *  Solo se localiza lo que se pinta en pantalla. */
const BAND_LABEL: Record<Band, string> = {
  alto: "High",
  medio: "Medium",
  bajo: "Low",
};

/** Estilos por banda · mismo lenguaje visual que el reporte de /demo
 *  (pill tinted + barra con color de banda). Tokens band-* de simulador.css. */
const BAND_TINT: Record<Band, string> = {
  alto: "bg-[var(--band-a-bg)] text-[var(--band-a-text)]",
  medio: "bg-[var(--band-m-bg)] text-[var(--band-m-text)]",
  bajo: "bg-[var(--band-b-bg)] text-[var(--band-b-text)]",
};
const BAND_BAR: Record<Band, string> = {
  alto: "var(--band-a-bar)",
  medio: "var(--band-m-bar)",
  bajo: "var(--band-b-bar)",
};
// Ancho representativo de la barra por banda · mismo encoding que /demo
// (BAND_WIDTH). No es un score público: es la banda traducida a longitud
// para que la fila se lea de un vistazo.
const BAND_WIDTH: Record<Band, number> = { alto: 92, medio: 75, bajo: 32 };

interface DimensionScore {
  id: string;
  label: string;
  band: Band;
  /** Métrica observable contable derivada del payload. */
  metric: string;
}

interface RiskEvent {
  id: string;
  severity: "alto" | "medio";
  type: string;
  /** Cita textual o referencia al payload del usuario donde aparece el
   *  risk. Cumple DIAGNOSTICO_1_CASO_V0 línea 239: "Cada uno debe tener
   *  evidencia textual citable del transcript". */
  evidence: string;
  slideRef: string;
}

// Reporte sintético v0 · las bandas y risk events se derivan de los
// payloads reales del store usando heurísticas simples · cumple
// contrato v0 (sin score numérico público · banda como unidad narrativa
// · evidencia textual citable del transcript).
//
// NOTA: este scoring es un PLACEHOLDER hasta que el judge LLM esté
// conectado al runtime productivo. Los thresholds y heurísticas viven
// aquí solo para que la pantalla de cierre responda al comportamiento
// del usuario · no como rúbrica final.

const RECOMMENDATION_DEFAULTS = {
  practice: {
    title: "Verify before you send",
    duration: "5 minutes",
  },
};

interface ReportSnapshot {
  recommendation: {
    action: "pilotar" | "entrenar" | "pausar" | "escalar";
    title: string;
    oneLiner: string;
  };
  dimensions: DimensionScore[];
  riskEvents: RiskEvent[];
}

/**
 * Computa el reporte del cierre a partir de los payloads del store.
 *
 * Lógica v0 (placeholder hasta que el judge LLM esté wired):
 * - Por cada dimensión, evalúa una o dos slides clave del caso.
 * - Risk events se extraen del payload con cita textual cuando es texto
 *   libre (rationale_text, leader_takeaway, memo), o referencia al
 *   slide cuando es selección.
 */
// El scoring detallado de abajo está calibrado SOLO para el caso de referencia
// (Aurora Retail). Un caso GENERADO por el motor tiene otros ids de slide/fila,
// así que ese scoring no aplica. En vez de mostrar bandas falsas (que dirían "no
// completó X" sobre cosas que no existen), un caso generado recibe un reporte
// honesto y genérico. La evaluación real por dimensión la hace el juez en
// producción (lib/simulador/judge). Hacer este reporte data-driven es F1.5.
const GOLDEN_CASE_ID = "marketing_dirty_data_relaunch";

function genericSnapshot(
  payloads: Record<string, ExerciseResponsePayload>,
): ReportSnapshot {
  const answered = Object.keys(payloads).length;
  const LABELS: Record<string, string> = {
    contexto: "Context",
    privacidad: "Privacy",
    validacion: "Verification",
    juicio: "Judgment",
    decision: "Decision",
  };
  const dimensions: DimensionScore[] = Object.entries(LABELS).map(
    ([id, label]) => ({
      id,
      label,
      band: "medio" as Band,
      metric: "The judge scores each dimension in production.",
    }),
  );
  return {
    recommendation: {
      action: "pilotar",
      title: "Auto-generated case",
      oneLiner: `You went through ${answered} exercises. The detailed report is calibrated only for the reference case. In production the judge does the scoring.`,
    },
    dimensions,
    riskEvents: [],
  };
}

function buildReportSnapshot(
  payloads: Record<string, ExerciseResponsePayload>,
): ReportSnapshot {
  // Caso generado (no es el golden): reporte honesto, sin bandas inventadas.
  if (CASE_ID !== GOLDEN_CASE_ID) return genericSnapshot(payloads);

  const dimensions: DimensionScore[] = [];
  const riskEvents: RiskEvent[] = [];

  // ===== CONTEXTO · evalúa si reconoció la presión y la restricción Legal =====
  const acknowledgedLegal = Boolean(
    (payloads["contexto-5"] as Extract<ExerciseResponsePayload, { block_id: "reading_message" }> | undefined)?.acknowledged,
  );
  dimensions.push({
    id: "contexto",
    label: "Context",
    band: acknowledgedLegal ? "alto" : "medio",
    metric: acknowledgedLegal
      ? "Read the manager's email and the Legal ticket."
      : "Did not finish reading the context.",
  });

  // ===== PRIVACIDAD · evalúa si excluyó/anonimizó contactos sin consentimiento + campos PII =====
  const dataContactsPayload = payloads["datos-1"] as
    | Extract<ExerciseResponsePayload, { block_id: "categorize_rows" }>
    | undefined;
  const dataFieldsPayload = payloads["datos-2"] as
    | Extract<ExerciseResponsePayload, { block_id: "categorize_rows" }>
    | undefined;
  // c3 = Renata (consentimiento revocado) · c5 = Lía (pidió baja). Ambos se
  // deben excluir (regla dura de la política). f2 = correo, no debe ir al modelo.
  const excludedRevoked = dataContactsPayload?.row_actions.find(
    (r) => r.row_id === "c3",
  );
  const excludedBaja = dataContactsPayload?.row_actions.find(
    (r) => r.row_id === "c5",
  );
  const emailToModel = dataFieldsPayload?.row_actions.find(
    (r) => r.row_id === "f2",
  );
  const excludedNoConsent =
    excludedRevoked?.action === "excluir" && excludedBaja?.action === "excluir";
  const protectedEmail =
    emailToModel?.action === "no_va" || emailToModel?.action === "transformada";
  const privacyBand: Band =
    excludedNoConsent && protectedEmail
      ? "alto"
      : excludedNoConsent
        ? "medio"
        : "bajo";
  dimensions.push({
    id: "privacidad",
    label: "Privacy",
    band: privacyBand,
    metric:
      privacyBand === "alto"
        ? "Excluded the revoked contact and the opt-out, and kept the email address away from the model."
        : privacyBand === "medio"
          ? "Excluded the contacts without consent, but let personal data reach the model."
          : "Did not exclude the revoked contact or the opt-out.",
  });
  if (emailToModel?.action === "va") {
    riskEvents.push({
      id: "risk-email-to-model",
      severity: "alto",
      type: "Personal data sent to the model",
      // Cita textual del payload del usuario · cumple regla v0:
      // "risk_event debe tener evidencia textual citable del transcript".
      evidence: `Marked "Email" as "Goes to the model" when it is a personal identifier that should not have been passed.`,
      slideRef: "Data · 2 / 5",
    });
  }

  // ===== VALIDACIÓN · evalúa si marcó las 2 cifras inventadas (r1, r2) en el
  // ai_output_review de Revisión slot 1. r3 y r4 son frases correctas. =====
  const reviewCifras = payloads["revision-1"] as
    | Extract<ExerciseResponsePayload, { block_id: "ai_output_review" }>
    | undefined;
  const correctFlags = (reviewCifras?.flagged_segments ?? []).filter(
    (s) => (s.segment_id === "r1" || s.segment_id === "r2") && s.flag !== null,
  ).length;
  const validacionBand: Band =
    correctFlags >= 2 ? "alto" : correctFlags >= 1 ? "medio" : "bajo";
  dimensions.push({
    id: "validacion",
    label: "Verification",
    band: validacionBand,
    metric: `${correctFlags} of 2 made-up figures flagged`,
  });
  if (correctFlags < 2) {
    riskEvents.push({
      id: "risk-unverified-claim",
      severity: correctFlags === 0 ? "alto" : "medio",
      type: "Unverified figure",
      evidence: `Let ${2 - correctFlags} of 2 unsupported figures from the model through.`,
      slideRef: "Review · 1 / 5",
    });
  }

  // ===== JUICIO · evalúa la decisión principal del cierre (slot 5). lanzar_lunes
  // es defendible SOLO si limpió la base (excluyó a los sin consentimiento) y
  // cazó las cifras inventadas · si no, lanzar subestima el riesgo. Esto alinea
  // el scoring con el copy de la opción ("lánzalo si la base quedó limpia"). =====
  const decisionPayload = payloads["cierre-5"] as
    | Extract<ExerciseResponsePayload, { block_id: "tradeoff_decision_memo" }>
    | undefined;
  const didCleanup = excludedNoConsent && correctFlags >= 2;
  const isPausar =
    decisionPayload?.decision === "pausar_y_limpiar" ||
    decisionPayload?.decision === "pausar_y_escalar";
  const juicioBand: Band =
    decisionPayload?.decision === "piloto_controlado"
      ? "alto"
      : decisionPayload?.decision === "lanzar_lunes"
        ? didCleanup
          ? "alto"
          : "bajo"
        : isPausar
          ? "medio"
          : "bajo";
  dimensions.push({
    id: "juicio",
    label: "Judgment",
    band: juicioBand,
    metric:
      decisionPayload?.decision === "piloto_controlado"
        ? "Chose a controlled pilot · proportional to the risk."
        : decisionPayload?.decision === "lanzar_lunes"
          ? didCleanup
            ? "Chose to launch after cleaning the list and cutting the figures · defensible."
            : "Chose to launch without finishing the cleanup · underestimates the risk."
          : decisionPayload?.decision === "pausar_y_limpiar"
            ? "Chose to pause and clean up · cautious and workable."
            : decisionPayload?.decision === "pausar_y_escalar"
              ? "Chose to pause and escalate · defensible conservative call."
              : "No decision recorded.",
  });

  // ===== DECISIÓN · evalúa claridad del memo que justifica la decisión.
  // El memo vive en el tradeoff_decision_memo del slot 5 (cierre-5),
  // junto a la decision. El mensaje base del envío (cierre-2, ai_textfield_free)
  // es un artefacto distinto · se usa como señal de ejecución abajo. =====
  const memoText = decisionPayload?.memo.trim() ?? "";
  const memoLength = memoText.length;
  const sendMessage = payloads["cierre-2"] as
    | Extract<ExerciseResponsePayload, { block_id: "ai_textfield_free" }>
    | undefined;
  const wroteMessage = (sendMessage?.prompt_text.trim().length ?? 0) >= 20;
  // Banda alta requiere memo sustancial Y mensaje escrito; media si solo uno.
  const decisionBand: Band =
    memoLength >= 120 && wroteMessage
      ? "alto"
      : memoLength >= 40 || wroteMessage
        ? "medio"
        : "bajo";
  // Cita textual del memo del usuario (no resumen) · cumple regla v0 de
  // evidencia citable. Si no escribió memo, lo dice explícito.
  const memoQuote =
    memoLength > 0
      ? `"${memoText.length > 90 ? memoText.slice(0, 90).trimEnd() + "…" : memoText}"`
      : "Did not write a justification memo.";
  dimensions.push({
    id: "decision",
    label: "Decision",
    band: decisionBand,
    metric: memoQuote,
  });

  // ===== RECOMENDACIÓN AGREGADA =====
  const recommendation = buildRecommendation(dimensions, riskEvents);

  return { recommendation, dimensions, riskEvents };
}

function buildRecommendation(
  dimensions: DimensionScore[],
  riskEvents: RiskEvent[],
): ReportSnapshot["recommendation"] {
  const altos = dimensions.filter((d) => d.band === "alto").length;
  const bajos = dimensions.filter((d) => d.band === "bajo").length;
  const highRisks = riskEvents.filter((r) => r.severity === "alto").length;

  // Escalar · 2+ risk events alto · el problema no es individual,
  // requiere intervención de Legal/Compliance/Process.
  if (highRisks >= 2) {
    return {
      action: "escalar",
      title: "Escalate to Legal and process",
      oneLiner:
        "Multiple high risk events. Individual practice will not close this gap · it needs a process change.",
    };
  }

  // Pausar · 1 risk alto o muchas dimensiones bajas.
  if (highRisks >= 1 || bajos >= 2) {
    return {
      action: "pausar",
      title: "Pause before piloting",
      oneLiner:
        "One or more critical dimensions are weak. Shore them up before working with real data.",
    };
  }

  // Pilotar · todas o casi todas las dimensiones en alto.
  if (altos >= 4) {
    return {
      action: "pilotar",
      title: "Ready to pilot",
      oneLiner:
        "Solid judgment on the key dimensions. Can work with light supervision.",
    };
  }

  // Entrenar · default · gap puntual corregible con práctica.
  return {
    action: "entrenar",
    title: "Coach a specific gap",
    oneLiner:
      "Solid judgment on most dimensions, but there is one pattern to fix before piloting.",
  };
}

/** Display de la acción recomendada. Los identificadores internos
 *  ("pilotar"/"entrenar"/…) están alineados con BD · NO se traducen ·
 *  solo se localiza el label (glosario: Pilot/Coach/Pause de /demo). */
const ACTION_LABEL: Record<ReportSnapshot["recommendation"]["action"], string> =
  {
    pilotar: "Pilot",
    entrenar: "Coach",
    pausar: "Pause",
    escalar: "Escalate",
  };
const ACTION_TONE: Record<
  ReportSnapshot["recommendation"]["action"],
  "success" | "warning" | "danger"
> = {
  pilotar: "success",
  entrenar: "warning",
  pausar: "danger",
  escalar: "danger",
};

/** Banda global agregada del reporte · espejo de los umbrales de
 *  buildRecommendation para que el pill del hero y la recomendación
 *  nunca se contradigan. Sigue el contrato v0: sin score numérico
 *  público · la banda es la unidad narrativa. */
function computeOverallBand(
  dimensions: DimensionScore[],
  riskEvents: RiskEvent[],
): Band {
  const altos = dimensions.filter((d) => d.band === "alto").length;
  const bajos = dimensions.filter((d) => d.band === "bajo").length;
  const highRisks = riskEvents.filter((r) => r.severity === "alto").length;
  if (highRisks >= 1 || bajos >= 2) return "bajo";
  if (altos >= 4) return "alto";
  return "medio";
}

/** Pill de banda tinted · única representación pública del juicio por
 *  dimensión. Reemplaza los dots monocromos v0: /demo ya estableció el
 *  color de banda como lenguaje del reporte, y el cierre del case-demo
 *  debe parecerse al reporte que /demo prometió dos clicks antes. */
function BandPill({ band }: { band: Band }) {
  return (
    <span
      className={`inline-flex flex-none items-center rounded-full px-2.5 py-0.5 ts-caption-1 font-bold ${BAND_TINT[band]}`}
    >
      {BAND_LABEL[band]}
    </span>
  );
}

/** Barra chunky con color de banda · mismo encoding visual que /demo. */
function BandBar({ band }: { band: Band }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--surface-3)]">
      <div
        className="h-full rounded-full"
        style={{
          width: `${BAND_WIDTH[band]}%`,
          backgroundColor: BAND_BAR[band],
        }}
      />
    </div>
  );
}

function CaseCompletedScreen({ durationMinutes, payloads }: CaseCompletedScreenProps) {
  const snapshot = buildReportSnapshot(payloads);
  const { recommendation, dimensions, riskEvents } = snapshot;
  const overallBand = computeOverallBand(dimensions, riskEvents);
  const highRisks = riskEvents.filter((r) => r.severity === "alto").length;
  // Contar activos completados · más honesto que "25 decisiones".
  const activeCount = Object.values(payloads).filter((p) => {
    if (
      p.block_id === "case_cover" ||
      p.block_id.startsWith("reading_")
    )
      return false;
    return true;
  }).length;

  return (
    // Sin centrado vertical: el reporte v2 es más alto que un viewport
    // chico y items-center recortaría el tope · scroll normal de página.
    <main className="simulador-root min-h-screen surface-canvas text-[var(--text-primary)]">
      <div className="mx-auto w-full max-w-[680px] px-6 py-6 sm:py-10">
        {/* HEADER · botón cerrar arriba a la derecha · estilo runtime */}
        <div className="flex justify-end">
          <a
            href="/"
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-[var(--radius-md)] border border-[var(--border)] text-[var(--text-secondary)] transition-colors hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
              <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </a>
        </div>

        {/* HERO · la banda global como pill grande con color de banda +
            la recomendación como título. Mismo lenguaje visual que el
            reporte de /demo · el cierre cumple lo que /demo prometió
            dos clicks antes. Sin score numérico público (contrato v0). */}
        <div className="mt-3 ts-footnote font-extrabold uppercase tracking-[0.8px] text-[var(--accent)]">
          Report for your manager
        </div>
        <div className="mt-4">
          <span
            className={`inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 ts-headline font-bold ${BAND_TINT[overallBand]}`}
          >
            <span
              className="h-2.5 w-2.5 flex-none rounded-full"
              style={{ backgroundColor: BAND_BAR[overallBand] }}
            />
            {BAND_LABEL[overallBand]} band
          </span>
        </div>
        <h1 className="mt-3 display display-tight ts-display text-[var(--text-primary)]">
          {recommendation.title}
        </h1>

        {/* Stats inline · separados con · igual que el resto del runtime.
            activeCount refleja slides realmente respondidos (sin contar
            pasivos) en vez de inflar a "25 decisiones". */}
        <div className="mt-2 ts-footnote text-[var(--text-tertiary)] tabular-nums">
          {durationMinutes} min · {activeCount}{" "}
          {activeCount === 1 ? "answer" : "answers"} · {riskEvents.length}{" "}
          {riskEvents.length === 1 ? "risk" : "risks"}
          {highRisks > 0 ? ` · ${highRisks} high` : ""}
        </div>

        {/* DIMENSIONES · filas con pill de banda + barra chunky con color
            de banda + métrica observable del payload. La banda sigue siendo
            la única señal pública (sin score numérico por dimensión). */}
        <div className="mt-6 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-card">
          <div className="ts-caption-1 font-extrabold uppercase tracking-[0.6px] text-[var(--text-tertiary)]">
            Judgment by dimension
          </div>
          <div className="mt-4 flex flex-col gap-4">
            {dimensions.map((d) => (
              <div key={d.id}>
                <div className="flex items-center justify-between gap-3">
                  <span className="min-w-0 ts-callout font-bold text-[var(--text-primary)]">
                    {d.label}
                  </span>
                  <BandPill band={d.band} />
                </div>
                <div className="mt-1.5">
                  <BandBar band={d.band} />
                </div>
                <p className="mt-1 ts-footnote leading-[1.45] text-[var(--text-tertiary)]">
                  {d.metric}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* RIESGOS · la estrella del reporte: cards tintadas por severidad
            (alto = band-b-bg, medio = band-m-bg) con la evidencia citada
            del transcript. Solo aparece si hay riesgos detectados. */}
        {riskEvents.length > 0 && (
          <div className="mt-6">
            <div className="ts-caption-1 font-extrabold uppercase tracking-[0.6px] text-[var(--text-tertiary)]">
              Risks detected
            </div>
            <div className="mt-2 flex flex-col gap-3">
              {riskEvents.map((r) => (
                <div
                  key={r.id}
                  className={`rounded-[var(--radius-lg)] p-4 ${
                    r.severity === "alto"
                      ? "bg-[var(--band-b-bg)]"
                      : "bg-[var(--band-m-bg)]"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <span className="min-w-0 ts-callout font-bold text-[var(--text-primary)]">
                      {r.type}
                    </span>
                    <span
                      className={`flex-none ts-caption-1 font-bold tabular-nums ${
                        r.severity === "alto"
                          ? "text-[var(--band-b-text)]"
                          : "text-[var(--band-m-text)]"
                      }`}
                    >
                      {BAND_LABEL[r.severity]} · {r.slideRef}
                    </span>
                  </div>
                  <p className="mt-1 ts-footnote leading-[1.5] text-[var(--text-secondary)]">
                    {r.evidence}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RECOMENDACIÓN · la acción de manager como AppleBadge pill + una
            línea. Labels Pilot/Coach/Pause/Escalate · mismo glosario que
            /demo. flex-wrap: en 375px la línea cae debajo del pill. */}
        <div className="mt-6 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-card">
          <div className="ts-caption-1 font-extrabold uppercase tracking-[0.6px] text-[var(--text-tertiary)]">
            Manager recommendation
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <AppleBadge pill tone={ACTION_TONE[recommendation.action]}>
              {ACTION_LABEL[recommendation.action]}
            </AppleBadge>
            <p className="min-w-0 flex-1 basis-[240px] ts-footnote leading-[1.5] text-[var(--text-secondary)]">
              {recommendation.oneLiner}
            </p>
          </div>
        </div>

        {/* PRÁCTICA · enlaza al motor educativo (medir → gap → practicar) */}
        {/* v2: card con borde + shadow-card (antes bloque tinted plano) */}
        <a
          href="/aprender-demo"
          className="mt-4 block rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-card transition-colors hover:border-[var(--border-strong)]"
        >
          <span className="ts-caption-1 font-extrabold uppercase tracking-[0.6px] text-[var(--text-tertiary)]">
            Suggested practice
          </span>
          {/* flex-wrap + min-w-0: en 375px el link cae debajo del título
              en vez de desbordar horizontalmente. */}
          <div className="mt-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <span className="min-w-0 ts-callout font-bold text-[var(--text-primary)]">
              {RECOMMENDATION_DEFAULTS.practice.title} ·{" "}
              {RECOMMENDATION_DEFAULTS.practice.duration}
            </span>
            <span className="ts-footnote font-bold text-[var(--accent)]">
              See the practice engine →
            </span>
          </div>
        </a>

        {/* CTAs · el demo cierra invitando a llevar esto al equipo real.
            flex-wrap: en viewports angostos (375px) el link cae debajo
            del botón en vez de desbordar horizontalmente. */}
        <div className="mt-7 flex flex-wrap items-center gap-4">
          <AppleSlideButton href="/auth/signup?next=%2Fonboarding%2Forg">
            Start with your team →
          </AppleSlideButton>
          <a
            href="/case-demo"
            className="ts-footnote text-[var(--text-secondary)] underline-offset-4 transition-colors hover:text-[var(--text-primary)] hover:underline"
          >
            Retake the case
          </a>
        </div>
      </div>
    </main>
  );
}

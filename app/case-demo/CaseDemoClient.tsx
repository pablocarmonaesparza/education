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
import type { ExerciseBlockId } from "@/lib/simulador/exercise-blocks.generated";
import type { ExerciseResponsePayload } from "@/lib/simulador/exercise-registry";
import { isBlockComplete } from "@/lib/simulador/exercise-completion";
import { SlideBody } from "../exercise-lab/_shared/SlideBody";
import { SLIDES, type Slide } from "./case-data.generated";

// ============================================================
// SECCIONES (5 obligatorias)
// ============================================================

const SECTIONS = [
  { id: "contexto", name: "Contexto" },
  { id: "datos", name: "Datos" },
  { id: "ia", name: "IA" },
  { id: "revision", name: "Revisión" },
  { id: "cierre", name: "Cierre" },
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
      `Sugerencia · caso demo · slide ${slideRef}`,
    );
    const body = encodeURIComponent(
      `Slide: ${slideRef}\nTemplate: ${slide?.blockId}\n\nDescribe la sugerencia o corrección:\n`,
    );
    // P3 · destinatario configurable vía env var · fallback al placeholder
    // de desarrollo. En producción debe estar definido NEXT_PUBLIC_FEEDBACK_EMAIL.
    const to =
      process.env.NEXT_PUBLIC_FEEDBACK_EMAIL ?? "feedback@itera.example";
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
        {/* HEADER · 2 botones cuadrados arriba a la izquierda (Cerrar + Atrás)
            + progress bar centrado al lado. */}
        <div className="pt-6 pb-6">
          <div className="mx-auto flex w-[65%] max-w-[1200px] items-center gap-4">
            <div className="flex items-center gap-2">
              {/* Cerrar · regresa al lab de ejercicios */}
              <a
                href="/exercise-lab"
                aria-label="Cerrar caso"
                className="grid h-12 w-12 place-items-center rounded-[var(--radius-md)] border border-[var(--border)] text-[var(--text-secondary)] transition-colors hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 6L18 18M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </a>
              {/* Atrás · slide anterior */}
              <button
                type="button"
                onClick={goPrev}
                disabled={isFirstSlide}
                aria-label="Diapositiva anterior"
                className={`grid h-12 w-12 place-items-center rounded-[var(--radius-md)] border transition-colors ${
                  isFirstSlide
                    ? "border-[var(--surface-3)] text-[var(--text-disabled)] cursor-not-allowed"
                    : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M15 6L9 12L15 18"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <div
              role="progressbar"
              aria-label={`Diapositiva ${slideIdx + 1} de ${SLIDES_PER_SECTION}`}
              aria-valuemin={1}
              aria-valuemax={SLIDES_PER_SECTION}
              aria-valuenow={slideIdx + 1}
              className="flex flex-1 gap-2"
            >
              {Array.from({ length: SLIDES_PER_SECTION }).map((_, idx) => {
                const isActive = idx === slideIdx;
                const isPast = idx < slideIdx;
                return (
                  <div
                    key={idx}
                    className={`h-[3px] flex-1 rounded-full transition-colors ${
                      isActive
                        ? "bg-[var(--accent)] animate-pulse"
                        : isPast
                          ? "bg-[var(--text-secondary)]"
                          : "bg-[var(--surface-3)]"
                    }`}
                  />
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              {/* Adelante · solo desbloqueado si el usuario regresó · permite
                  re-avanzar sin perder respuesta. */}
              <button
                type="button"
                onClick={goNext}
                disabled={!canGoForward}
                aria-label="Avanzar a la siguiente diapositiva"
                className={`grid h-12 w-12 place-items-center rounded-[var(--radius-md)] border transition-colors ${
                  !canGoForward
                    ? "border-[var(--surface-3)] text-[var(--text-disabled)] cursor-not-allowed"
                    : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 6L15 12L9 18"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {/* Sugerencia o corrección · abre mailto con el slide actual */}
              <button
                type="button"
                onClick={handleFeedback}
                aria-label="Mandar sugerencia o corrección"
                className="grid h-12 w-12 place-items-center rounded-[var(--radius-md)] border border-[var(--border)] text-[var(--text-secondary)] transition-colors hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 11.5a8.4 8.4 0 0 1-0.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-0.9L3 21l1.9-5.7a8.4 8.4 0 0 1-0.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-0.9h0.5a8.5 8.5 0 0 1 8 8v0.5z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

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
              className="w-[65%] max-w-[1200px]"
            >
              {/* Eyebrow · solo el nombre de la sección */}
              <div className="ts-caption-1 font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
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
                <div className="mt-10 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!blockComplete}
                    className={`rounded-[var(--radius-md)] px-7 py-3 ts-callout font-medium transition-opacity ${
                      blockComplete
                        ? "accent-bg text-white hover:opacity-90"
                        : "bg-[var(--surface-3)] text-[var(--text-disabled)] cursor-not-allowed"
                    }`}
                  >
                    {isLastSlide ? "Ver resumen →" : "Continuar →"}
                  </button>
                  {blockComplete ? (
                    <span className="ts-footnote text-[var(--text-tertiary)]">
                      o pulsa{" "}
                      <kbd className="rounded border border-[var(--border)] bg-[var(--surface-2)] px-1.5 py-0.5 ts-caption-2 font-medium text-[var(--text-secondary)]">
                        Enter ↵
                      </kbd>
                    </span>
                  ) : (
                    <span className="ts-footnote text-[var(--text-tertiary)]">
                      Completa el ejercicio para continuar.
                    </span>
                  )}
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
// Lenguaje Typeform · single column · sin score numérico público
// (cumple contrato v0: "la banda es la unidad narrativa").
// Consume el store de payloads del shell · P0.2.
// ============================================================

interface CaseCompletedScreenProps {
  durationMinutes: number;
  /** Store de payloads del shell · permite computar bandas y citas
   *  textuales reales en vez de hardcoded. P0.2. */
  payloads: Record<string, ExerciseResponsePayload>;
}

type Band = "alto" | "medio" | "bajo";

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
    title: "Verifica antes de enviar",
    duration: "5 minutos",
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
function buildReportSnapshot(
  payloads: Record<string, ExerciseResponsePayload>,
): ReportSnapshot {
  const dimensions: DimensionScore[] = [];
  const riskEvents: RiskEvent[] = [];

  // ===== CONTEXTO · evalúa si reconoció la presión y la restricción Legal =====
  const acknowledgedLegal = Boolean(
    (payloads["contexto-5"] as Extract<ExerciseResponsePayload, { block_id: "reading_message" }> | undefined)?.acknowledged,
  );
  dimensions.push({
    id: "contexto",
    label: "Contexto",
    band: acknowledgedLegal ? "alto" : "medio",
    metric: acknowledgedLegal
      ? "Leyó el email del manager y el ticket de Legal."
      : "No completó la lectura del contexto.",
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
    label: "Privacidad",
    band: privacyBand,
    metric:
      privacyBand === "alto"
        ? "Excluyó a quien revocó y a quien pidió baja, y no mandó el correo al modelo."
        : privacyBand === "medio"
          ? "Excluyó a los de sin consentimiento, pero dejó pasar datos personales al modelo."
          : "No excluyó a quien revocó o pidió baja.",
  });
  if (emailToModel?.action === "va") {
    riskEvents.push({
      id: "risk-email-to-model",
      severity: "alto",
      type: "Dato personal al modelo",
      // Cita textual del payload del usuario · cumple regla v0:
      // "risk_event debe tener evidencia textual citable del transcript".
      evidence: `Marcó "Correo" con la acción "va al modelo" cuando es un identificador personal que no debía pasar.`,
      slideRef: "Datos · 2 / 5",
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
    label: "Validación",
    band: validacionBand,
    metric: `${correctFlags} de 2 cifras inventadas marcadas`,
  });
  if (correctFlags < 2) {
    riskEvents.push({
      id: "risk-unverified-claim",
      severity: correctFlags === 0 ? "alto" : "medio",
      type: "Cifra sin verificar",
      evidence: `Dejó pasar ${2 - correctFlags} de 2 cifras sin respaldo que el modelo afirmó.`,
      slideRef: "Revisión · 1 / 5",
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
  const juicioBand: Band =
    decisionPayload?.decision === "piloto_controlado"
      ? "alto"
      : decisionPayload?.decision === "lanzar_lunes"
        ? didCleanup
          ? "alto"
          : "bajo"
        : decisionPayload?.decision === "pausar_y_escalar"
          ? "medio"
          : "bajo";
  dimensions.push({
    id: "juicio",
    label: "Juicio",
    band: juicioBand,
    metric:
      decisionPayload?.decision === "piloto_controlado"
        ? "Eligió piloto controlado · proporcional al riesgo."
        : decisionPayload?.decision === "lanzar_lunes"
          ? didCleanup
            ? "Eligió lanzar tras limpiar la base y quitar las cifras · defendible."
            : "Eligió lanzar sin terminar de limpiar · subestima el riesgo."
          : decisionPayload?.decision === "pausar_y_escalar"
            ? "Eligió pausar · postura conservadora defendible."
            : "Decisión no registrada.",
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
      : "No escribió memo de justificación.";
  dimensions.push({
    id: "decision",
    label: "Decisión",
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
      title: "Escalar a Legal y proceso",
      oneLiner:
        "Múltiples eventos de riesgo alto. El gap no se resuelve con práctica individual · requiere ajuste de proceso.",
    };
  }

  // Pausar · 1 risk alto o muchas dimensiones bajas.
  if (highRisks >= 1 || bajos >= 2) {
    return {
      action: "pausar",
      title: "Pausar antes de pilotar",
      oneLiner:
        "Una o varias dimensiones críticas están débiles. Reforzar antes de operar con datos reales.",
    };
  }

  // Pilotar · todas o casi todas las dimensiones en alto.
  if (altos >= 4) {
    return {
      action: "pilotar",
      title: "Listo para pilotar",
      oneLiner:
        "Criterio sólido en las dimensiones clave. Puede operar con supervisión ligera.",
    };
  }

  // Entrenar · default · gap puntual corregible con práctica.
  return {
    action: "entrenar",
    title: "Entrenar gap específico",
    oneLiner:
      "Criterio sólido en la mayoría, pero hay un patrón a corregir antes de pilotar.",
  };
}

/** Etiqueta de banda · única representación pública del juicio. Cumple
 *  DIAGNOSTICO_1_CASO_V0 línea 233: "Sin score numérico público en v0.
 *  La banda es la unidad narrativa." Sin colores semánticos · la banda
 *  se comunica con un dot intensidad-graduada y la palabra. */
function BandLabel({ band }: { band: Band }) {
  const dots = band === "alto" ? 3 : band === "medio" ? 2 : 1;
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 w-1.5 rounded-full ${
              i < dots ? "bg-[var(--text-primary)]" : "bg-[var(--surface-3)]"
            }`}
          />
        ))}
      </div>
      <span className="ts-callout font-medium capitalize text-[var(--text-primary)] w-14 text-right">
        {band}
      </span>
    </div>
  );
}

function CaseCompletedScreen({ durationMinutes, payloads }: CaseCompletedScreenProps) {
  const snapshot = buildReportSnapshot(payloads);
  const { recommendation, dimensions, riskEvents } = snapshot;
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
    <main className="simulador-root flex min-h-screen items-center justify-center surface-canvas text-[var(--text-primary)]">
      <div className="mx-auto w-full max-w-[680px] px-6 py-6">
        {/* HEADER · botón cerrar arriba a la derecha · estilo runtime */}
        <div className="flex justify-end">
          <a
            href="/exercise-lab"
            aria-label="Cerrar"
            className="grid h-9 w-9 place-items-center rounded-[var(--radius-md)] border border-[var(--border)] text-[var(--text-secondary)] transition-colors hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
              <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </a>
        </div>

        {/* EYEBROW + TÍTULO · estilo runtime · la recomendación ES el título */}
        <div className="mt-3 ts-caption-1 font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
          Reporte para tu manager
        </div>
        <h1 className="mt-2 display display-tight ts-display text-[var(--text-primary)]">
          {recommendation.title}.
        </h1>
        <p className="mt-3 ts-body leading-[1.5] text-[var(--text-secondary)]">
          {recommendation.oneLiner}
        </p>

        {/* Stats inline · separados con · igual que el resto del runtime.
            activeCount refleja slides realmente respondidos (sin contar
            pasivos) en vez de inflar a "25 decisiones". */}
        <div className="mt-2 ts-footnote text-[var(--text-tertiary)] tabular-nums">
          {durationMinutes} min · {activeCount} respuestas · {riskEvents.length}{" "}
          riesgos{highRisks > 0 ? ` · ${highRisks} alto` : ""}
        </div>

        {/* DIMENSIONES · banda como única señal pública (sin score numérico).
            Métrica observable derivada del payload en una línea de contexto. */}
        <div className="mt-6 border-t border-[var(--hairline)]">
          {dimensions.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between gap-4 border-b border-[var(--hairline)] py-2.5"
            >
              <div className="min-w-0 flex-1">
                <div className="ts-callout text-[var(--text-primary)]">
                  {d.label}
                </div>
                <div className="mt-0.5 ts-footnote text-[var(--text-tertiary)]">
                  {d.metric}
                </div>
              </div>
              <BandLabel band={d.band} />
            </div>
          ))}
        </div>

        {/* RIESGOS · solo aparece la sección si hay riesgos detectados.
            Cada riesgo trae evidencia derivada del payload del usuario. */}
        {riskEvents.length > 0 && (
          <div className="mt-5">
            <div className="ts-caption-1 font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
              Riesgos detectados
            </div>
            <div className="mt-2 border-t border-[var(--hairline)]">
              {riskEvents.map((r) => (
                <div
                  key={r.id}
                  className="flex items-start justify-between gap-4 border-b border-[var(--hairline)] py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="ts-callout text-[var(--text-primary)]">
                      {r.type}
                    </div>
                    <div className="mt-0.5 ts-footnote text-[var(--text-tertiary)]">
                      {r.evidence}
                    </div>
                  </div>
                  <span className="ts-footnote capitalize text-[var(--text-tertiary)] tabular-nums whitespace-nowrap">
                    {r.severity} · {r.slideRef}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PRÁCTICA · inline simple */}
        <div className="mt-5">
          <span className="ts-caption-1 font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
            Práctica sugerida
          </span>
          <div className="mt-1 ts-callout text-[var(--text-primary)]">
            {RECOMMENDATION_DEFAULTS.practice.title} ·{" "}
            {RECOMMENDATION_DEFAULTS.practice.duration}
          </div>
        </div>

        {/* CTAs · mismo lenguaje que el botón Continuar del runtime */}
        <div className="mt-7 flex items-center gap-4">
          <a
            href="/exercise-lab"
            className="rounded-[var(--radius-md)] accent-bg px-7 py-3 ts-callout font-medium text-white transition-opacity hover:opacity-90"
          >
            Volver al lab →
          </a>
          <a
            href="/case-demo"
            className="ts-footnote text-[var(--text-secondary)] underline-offset-4 transition-colors hover:text-[var(--text-primary)] hover:underline"
          >
            Repetir el caso
          </a>
        </div>
      </div>
    </main>
  );
}

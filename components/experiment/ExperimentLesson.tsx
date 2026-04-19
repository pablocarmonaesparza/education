'use client';

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useTransform,
} from 'framer-motion';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ConfettiEffect from '@/components/demo/ConfettiEffect';
import IconButton from '@/components/ui/IconButton';
import { Textarea } from '@/components/ui/Input';
import { Title, Body } from '@/components/ui/Typography';
import { depth, depthBase } from '@/lib/design-tokens';

/* ───────────────────────────────────────────────────────────
   Experiment Lesson — Mimo-style flow, Itera design system
   ─────────────────────────────────────────────────────────── */

type Option = { id: number; text: string };

type TapMatchAttempt = {
  // user-built pairs (no validation while building)
  pairs: { termIdx: number; defIdx: number }[];
  selectedTerm: number | null;
  selectedDef: number | null;
};

type Step =
  | { kind: 'concept'; title: string; body: string; image?: string }
  | { kind: 'concept-visual'; title: string; body: string }
  | { kind: 'celebration'; emoji: string; title: string; body: string; section?: string }
  | {
      kind: 'mcq';
      prompt: string;
      options: Option[];
      correctId: number;
      explanation: string;
      xp?: number;
    }
  | {
      kind: 'multi-select';
      prompt: string;
      options: Option[];
      correctIds: number[];
      explanation: string;
      xp?: number;
    }
  | {
      kind: 'true-false';
      prompt: string;
      statement: string;
      answer: boolean;
      explanation: string;
      xp?: number;
    }
  | {
      kind: 'fill-blank';
      prompt: string;
      sentenceBefore: string;
      sentenceAfter: string;
      tokens: string[];
      correctTokenIndex: number;
      explanation: string;
      xp?: number;
    }
  | {
      kind: 'code-completion';
      prompt: string;
      codeBefore: string;
      codeAfter: string;
      tokens: string[];
      correctTokenIndex: number;
      explanation: string;
      xp?: number;
    }
  | {
      kind: 'build-prompt';
      prompt: string;
      tokens: string[];
      correctOrder: number[];
      explanation: string;
      xp?: number;
    }
  | {
      kind: 'order-steps';
      prompt: string;
      steps: string[];
      correctOrder: number[];
      explanation: string;
      xp?: number;
    }
  | {
      kind: 'tap-match';
      prompt: string;
      pairs: { term: string; def: string }[];
      explanation: string;
      xp?: number;
    }
  | {
      kind: 'ai-prompt';
      prompt: string;
      instructions: string;
      placeholder: string;
      xp?: number;
    };

function getStepXp(step: Step, fallback = 10): number {
  if ('xp' in step && typeof step.xp === 'number') return step.xp;
  return fallback;
}

/* ─── helpers ─── */

function isInteractive(step: Step): boolean {
  return (
    step.kind !== 'concept' &&
    step.kind !== 'concept-visual' &&
    step.kind !== 'celebration'
  );
}

function isScoreable(step: Step): boolean {
  return isInteractive(step);
}

const initialTapMatch: TapMatchAttempt = {
  pairs: [],
  selectedTerm: null,
  selectedDef: null,
};

function getInitialAttempt(step: Step): unknown {
  switch (step.kind) {
    case 'mcq':
      return null;
    case 'multi-select':
      return [] as number[];
    case 'true-false':
      return null;
    case 'fill-blank':
    case 'code-completion':
      return null;
    case 'build-prompt':
    case 'order-steps':
      return [] as number[];
    case 'tap-match':
      return { ...initialTapMatch } as TapMatchAttempt;
    case 'ai-prompt':
      return '';
    default:
      return null;
  }
}

function isAttemptComplete(step: Step, attempt: unknown): boolean {
  switch (step.kind) {
    case 'mcq':
      return attempt !== null;
    case 'multi-select':
      return (attempt as number[]).length > 0;
    case 'true-false':
      return attempt !== null;
    case 'fill-blank':
    case 'code-completion':
      return attempt !== null;
    case 'build-prompt':
      return (attempt as number[]).length === step.tokens.length;
    case 'order-steps':
      return (attempt as number[]).length === step.steps.length;
    case 'tap-match':
      return (attempt as TapMatchAttempt).pairs.length === step.pairs.length;
    case 'ai-prompt':
      return (attempt as string).trim().length >= 10;
    default:
      return true;
  }
}

function isAttemptCorrect(step: Step, attempt: unknown): boolean {
  switch (step.kind) {
    case 'mcq':
      return attempt === step.correctId;
    case 'multi-select': {
      const ids = attempt as number[];
      return (
        ids.length === step.correctIds.length &&
        step.correctIds.every((id) => ids.includes(id))
      );
    }
    case 'true-false':
      return attempt === step.answer;
    case 'fill-blank':
      return attempt === step.correctTokenIndex;
    case 'code-completion':
      return attempt === step.correctTokenIndex;
    case 'build-prompt':
    case 'order-steps': {
      const order = attempt as number[];
      const target = step.correctOrder;
      return (
        order.length === target.length && order.every((v, i) => v === target[i])
      );
    }
    case 'tap-match': {
      // Validated only on submit: every user pair must match its expected
      // partner (term i ↔ defOrder[defIdx] === i). Since defOrder is internal
      // to the renderer, we instead verify that the user paired the right
      // semantic term with the right definition by checking termIdx equality
      // with the original pair index — which is exactly what defOrder[defIdx]
      // resolves to. The renderer normalizes attempt.pairs.defIdx to ALWAYS
      // store the original pair index, so the check is direct.
      const a = attempt as TapMatchAttempt;
      if (a.pairs.length !== step.pairs.length) return false;
      return a.pairs.every((p) => p.termIdx === p.defIdx);
    }
    case 'ai-prompt':
      return analyzePrompt(attempt as string).score >= 60;
    default:
      return false;
  }
}

/* ─── mock AI prompt analyzer (placeholder hasta tener backend) ─── */

function analyzePrompt(text: string): { score: number; feedback: string } {
  const len = text.trim().length;
  const hasContext = /contexto|evidencia|cita|fuente|recuperad/i.test(text);
  const hasRole = /eres|actúa|asistente|eres un|tu rol/i.test(text);
  const hasConstraint = /si no|declara|no sé|solo responde|únicamente|responder solo/i.test(text);

  let score = 30;
  if (len > 60) score += 15;
  if (len > 140) score += 10;
  if (hasContext) score += 15;
  if (hasRole) score += 15;
  if (hasConstraint) score += 15;
  score = Math.min(100, score);

  const hints: string[] = [];
  if (!hasRole) hints.push('Define explícitamente el rol del asistente.');
  if (!hasContext) hints.push('Menciona las fuentes o el contexto recuperado.');
  if (!hasConstraint)
    hints.push('Agrega un fallback para cuando no haya evidencia suficiente.');
  if (len < 60) hints.push('Desarrolla más el comportamiento esperado.');

  const feedback =
    hints.length === 0
      ? 'Prompt sólido: define rol, uso del contexto recuperado y fallback.'
      : hints.join(' ');

  return { score, feedback };
}

/* ─── feature flags ─── */

// Usuarios pagados / owners no pierden vidas ni ven el modal.
const HAS_UNLIMITED_LIVES = true;

// Mock: racha de días consecutivos usando la app (vendría del backend).
const DAILY_STREAK = 5;

/* ─── lesson data ─── */

export type { Step };

export const DEFAULT_STEPS: Step[] = [
  {
    kind: 'concept',
    title: 'qué es un agente RAG',
    body: 'Un agente RAG recupera información antes de responder, en vez de improvisar desde memoria. Eso lo hace mucho más confiable.',
  },
  {
    kind: 'mcq',
    prompt: '¿Cuál es el objetivo principal de un agente RAG?',
    options: [
      { id: 1, text: 'Generar texto creativo sin contexto.' },
      { id: 2, text: 'Responder con base en información recuperada.' },
      { id: 3, text: 'Reemplazar al usuario en la búsqueda.' },
    ],
    correctId: 2,
    explanation:
      'RAG = Retrieval-Augmented Generation: el modelo queda atado a información concreta.',
    xp: 10,
  },
  {
    kind: 'fill-blank',
    prompt: 'completa la oración',
    sentenceBefore: 'Un agente RAG',
    sentenceAfter: 'información antes de responder.',
    tokens: ['inventa', 'recupera', 'ignora', 'traduce'],
    correctTokenIndex: 1,
    explanation: 'Recuperar (retrieval) es el paso R de RAG.',
    xp: 10,
  },
  {
    kind: 'concept-visual',
    title: 'el flujo básico',
    body: 'El usuario pregunta, el agente busca en una base de conocimiento y responde citando lo que encontró.',
  },
  {
    kind: 'true-false',
    prompt: 'verdadero o falso',
    statement:
      'Subir la temperatura del modelo siempre reduce las alucinaciones.',
    answer: false,
    explanation:
      'Falso: mayor temperatura aumenta la variabilidad y tiende a fabricar más, no menos.',
    xp: 10,
  },
  {
    kind: 'multi-select',
    prompt: '¿Qué prácticas reducen las alucinaciones?',
    options: [
      { id: 1, text: 'Subir la temperatura del modelo.' },
      { id: 2, text: 'Exigir citas a las fuentes.' },
      { id: 3, text: 'Permitir que el modelo diga "no sé".' },
      { id: 4, text: 'Eliminar el paso de retrieval.' },
    ],
    correctIds: [2, 3],
    explanation:
      'Citas + permiso para declarar ausencia de evidencia son las dos palancas más fuertes.',
    xp: 20,
  },
  {
    kind: 'tap-match',
    prompt: 'empareja cada concepto con su definición',
    pairs: [
      { term: 'Retrieval', def: 'Buscar fragmentos relevantes en una base de datos.' },
      { term: 'Augmentation', def: 'Inyectar ese contexto dentro del prompt.' },
      { term: 'Generation', def: 'Producir la respuesta final con el modelo.' },
      { term: 'Grounding', def: 'Atar la respuesta a la evidencia recuperada.' },
    ],
    explanation:
      'Las tres letras de RAG más grounding resumen toda la arquitectura del agente.',
    xp: 25,
  },
  {
    kind: 'celebration',
    emoji: '🎉',
    title: 'conquistaste los conceptos de RAG',
    body: 'Retrieval, augmentation, generation y grounding ya son parte de tu vocabulario.',
    section: 'fin de la sección 1 · conceptos',
  },
  {
    kind: 'order-steps',
    prompt: 'ordena los pasos del flujo RAG',
    steps: [
      'El modelo genera una respuesta citando las fuentes.',
      'El usuario hace una pregunta.',
      'El sistema busca fragmentos relevantes en la base de conocimiento.',
      'Los fragmentos se añaden como contexto al modelo.',
    ],
    correctOrder: [1, 2, 3, 0],
    explanation:
      'Primero la pregunta, luego retrieval, luego contexto al modelo, luego generación con citas.',
    xp: 20,
  },
  {
    kind: 'concept',
    title: 'el problema de las alucinaciones',
    body: 'Cuando un modelo no sabe algo, a veces inventa una respuesta convincente pero falsa. Eso es una alucinación.',
  },
  {
    kind: 'code-completion',
    prompt: 'completa el código',
    codeBefore:
      'const docs = retrieveDocs(query);\nconst response = llm.generate({\n  prompt: userMessage,\n  ',
    codeAfter: ': docs,\n});',
    tokens: ['history', 'context', 'metadata', 'prompt'],
    correctTokenIndex: 1,
    explanation:
      'En RAG, el contexto recuperado se inyecta al modelo bajo la clave "context".',
    xp: 25,
  },
  {
    kind: 'build-prompt',
    prompt: 'arma un prompt de sistema',
    tokens: [
      'Cita las fuentes.',
      'Eres un asistente.',
      'Responde solo si',
      'hay evidencia recuperada.',
    ],
    correctOrder: [1, 2, 3, 0],
    explanation: 'Rol → condición → fallback → requisito de citas.',
    xp: 20,
  },
  {
    kind: 'celebration',
    emoji: '🚀',
    title: 'ahora viene la parte divertida',
    body: 'Ya dominas las piezas. Es hora de que escribas tu propio prompt de sistema.',
    section: 'fin de la sección 2 · práctica',
  },
  {
    kind: 'ai-prompt',
    prompt: 'escribe tu propio prompt',
    instructions:
      'Escribe un prompt de sistema para un asistente RAG que responda solo con base en la información recuperada y cite sus fuentes.',
    placeholder: 'Eres un asistente que...',
    xp: 50,
  },
];

/* ─── main component ─── */

export default function ExperimentLesson({
  steps: propSteps,
  onClose,
  onComplete,
  onNext,
  nextLabel,
}: {
  steps?: Step[];
  onClose?: () => void;
  /** Fires once when the user finishes the lesson successfully (clicks
   * "terminar" in the result modal after passing, or exits a non-scoreable
   * placeholder lesson which is considered passed by default). May be async;
   * the overlay waits for it to resolve before closing so the caller can
   * persist progress before the UI advances. */
  onComplete?: () => void | Promise<void>;
  /** When provided, the last step shows two CTAs: "menú principal" (secondary)
   * and `nextLabel` (primary). Clicking next runs `onComplete` and then this
   * callback without closing the overlay — letting the caller swap the lesson
   * in-place for the next one in the ruta. */
  onNext?: () => void | Promise<void>;
  nextLabel?: string;
} = {}) {
  const STEPS = propSteps ?? DEFAULT_STEPS;
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [maxVisited, setMaxVisited] = useState(0);
  const [attempt, setAttempt] = useState<unknown>(() => getInitialAttempt(STEPS[0]));
  const [submitted, setSubmitted] = useState(false);
  const [lives, setLives] = useState(5);
  const [scoredSteps, setScoredSteps] = useState<Set<number>>(() => new Set());
  const [livesPulse, setLivesPulse] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showNoLives, setShowNoLives] = useState(false);
  const [streak, setStreak] = useState(0);
  const [ctaBounce, setCtaBounce] = useState(false);
  const [firstSubmitted, setFirstSubmitted] = useState<Set<number>>(() => new Set());
  const [xp, setXp] = useState(0);
  const [xpDelta, setXpDelta] = useState<{ gain: number; id: number } | null>(null);

  const totalXp = useMemo(
    () =>
      STEPS.reduce(
        (acc, s) => (isScoreable(s) ? acc + getStepXp(s) : acc),
        0,
      ),
    [],
  );

  useEffect(() => {
    if (!livesPulse) return;
    const t = setTimeout(() => setLivesPulse(false), 450);
    return () => clearTimeout(t);
  }, [livesPulse]);

  useEffect(() => {
    if (!HAS_UNLIMITED_LIVES && lives === 0) setShowNoLives(true);
  }, [lives]);

  useEffect(() => {
    if (!ctaBounce) return;
    const t = setTimeout(() => setCtaBounce(false), 400);
    return () => clearTimeout(t);
  }, [ctaBounce]);

  useEffect(() => {
    if (xpDelta === null) return;
    const t = setTimeout(() => setXpDelta(null), 900);
    return () => clearTimeout(t);
  }, [xpDelta?.id]);

  const step = STEPS[index];
  const isLast = index === STEPS.length - 1;
  const interactive = isInteractive(step);
  const needsCheck = interactive && !submitted;
  const complete = interactive ? isAttemptComplete(step, attempt) : true;
  const ctaDisabled = needsCheck && !complete;
  const ctaLabel = needsCheck ? 'comprobar' : isLast ? 'terminar' : 'continuar';

  const handleExit = () => {
    if (onClose) {
      onClose();
    } else {
      router.push('/');
    }
  };

  const [isFinishing, setIsFinishing] = useState(false);
  const handleFinish = async () => {
    if (isFinishing) return;
    setIsFinishing(true);
    try {
      await onComplete?.();
    } catch (err) {
      console.warn('[experiment] onComplete threw, closing anyway', err);
    } finally {
      handleExit();
    }
  };

  // Mark complete, then jump to the next lesson/section without closing the
  // overlay. Used by the "siguiente lección / siguiente sección" CTA.
  const handleFinishAndContinue = async () => {
    if (isFinishing) return;
    setIsFinishing(true);
    try {
      await onComplete?.();
      await onNext?.();
    } catch (err) {
      console.warn('[experiment] onComplete/onNext threw', err);
    } finally {
      setIsFinishing(false);
    }
  };

  const resetStateForStep = (i: number) => {
    setAttempt(getInitialAttempt(STEPS[i]));
    setSubmitted(false);
  };

  const handleBack = () => {
    if (index === 0) return;
    const next = index - 1;
    setIndex(next);
    resetStateForStep(next);
  };

  const handleForward = () => {
    if (index >= maxVisited) return;
    const next = index + 1;
    setIndex(next);
    resetStateForStep(next);
  };

  const handleRestart = () => {
    setIndex(0);
    setMaxVisited(0);
    setAttempt(getInitialAttempt(STEPS[0]));
    setSubmitted(false);
    setLives(5);
    setScoredSteps(new Set());
    setFirstSubmitted(new Set());
    setStreak(0);
    setXp(0);
    setXpDelta(null);
    setShowResult(false);
  };

  const totalScoreable = STEPS.filter(isScoreable).length;
  const wrongCount = scoredSteps.size;
  const correctCount = totalScoreable - wrongCount;
  const accuracy = totalScoreable === 0 ? 1 : correctCount / totalScoreable;
  const passed = accuracy >= 0.8;

  const handleCta = () => {
    if (ctaDisabled) return;
    if (needsCheck) {
      setSubmitted(true);
      if (isScoreable(step) && !firstSubmitted.has(index)) {
        const correct = isAttemptCorrect(step, attempt);
        setFirstSubmitted((s) => new Set(s).add(index));
        if (correct) {
          const newStreak = streak + 1;
          setStreak(newStreak);
          setCtaBounce(true);
          const base = getStepXp(step);
          const streakBonus = newStreak >= 3 ? 5 : 0;
          const gain = base + streakBonus;
          setXp((x) => x + gain);
          setXpDelta((prev) => ({ gain, id: (prev?.id ?? 0) + 1 }));
        } else {
          setStreak(0);
          if (!HAS_UNLIMITED_LIVES) {
            setLives((l) => Math.max(0, l - 1));
            setLivesPulse(true);
          }
          setScoredSteps((s) => new Set(s).add(index));
        }
      }
      return;
    }
    if (isLast) {
      // The last slide is already a celebration (with confetti + emoji +
      // stats). If the user passed the lesson, skip the result popup and
      // finish directly — the celebration slide IS the completion screen.
      // Only show the result modal when the user failed, so they still get
      // the "repetir lección" affordance.
      if (passed) {
        handleFinish();
      } else {
        setShowResult(true);
      }
      return;
    }
    const next = index + 1;
    setIndex(next);
    setMaxVisited((m) => Math.max(m, next));
    resetStateForStep(next);
  };

  return (
    <div className={`${onClose ? 'h-full' : 'min-h-screen'} flex flex-col bg-white dark:bg-gray-800`}>
      {/* Top bar: single flex row, no absolute positioning — scales cleanly to mobile */}
      <header className="px-4 py-4">
        <div className="mx-auto max-w-2xl flex items-center gap-2 md:gap-3">
          <IconButton
            variant="outline"
            aria-label="Salir de la lección"
            onClick={handleExit}
            className="w-[50px] h-[50px]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </IconButton>
          <div className="flex-1 min-w-0 flex items-center gap-2 md:gap-3">
            <div className="hidden md:block">
              <IconButton
                variant="outline"
                aria-label="Etapa anterior"
                onClick={handleBack}
                disabled={index === 0}
                className="w-[50px] h-[50px]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </IconButton>
            </div>
            <SegmentedProgress total={STEPS.length} current={index} />
            <div className="hidden md:block">
              <IconButton
                variant="outline"
                aria-label="Etapa siguiente"
                onClick={handleForward}
                disabled={index >= maxVisited || ctaDisabled || needsCheck}
                className="w-[50px] h-[50px]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </IconButton>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {step.kind === 'concept' && (
            <ConceptStep title={step.title} body={step.body} image={step.image} />
          )}
          {step.kind === 'concept-visual' && (
            <ConceptVisualStep title={step.title} body={step.body} />
          )}
          {step.kind === 'celebration' && (
            <CelebrationStep
              emoji={step.emoji}
              title={step.title}
              body={step.body}
              section={step.section}
              streak={streak}
              xpGained={xp}
              correctSoFar={(() => {
                let n = 0;
                for (let i = 0; i < index; i++) {
                  if (isScoreable(STEPS[i]) && firstSubmitted.has(i) && !scoredSteps.has(i)) n++;
                }
                return n;
              })()}
              totalSoFar={STEPS.slice(0, index).filter(isScoreable).length}
              passed={passed}
            />
          )}
          {step.kind === 'mcq' && (
            <MultipleChoiceStep
              step={step}
              attempt={attempt as number | null}
              onChange={(v) => setAttempt(v)}
              submitted={submitted}
            />
          )}
          {step.kind === 'multi-select' && (
            <MultiSelectStep
              step={step}
              attempt={attempt as number[]}
              onChange={(v) => setAttempt(v)}
              submitted={submitted}
            />
          )}
          {step.kind === 'true-false' && (
            <TrueFalseStep
              step={step}
              attempt={attempt as boolean | null}
              onChange={(v) => setAttempt(v)}
              submitted={submitted}
            />
          )}
          {step.kind === 'fill-blank' && (
            <FillBlankStep
              step={step}
              attempt={attempt as number | null}
              onChange={(v) => setAttempt(v)}
              submitted={submitted}
            />
          )}
          {step.kind === 'code-completion' && (
            <CodeCompletionStep
              step={step}
              attempt={attempt as number | null}
              onChange={(v) => setAttempt(v)}
              submitted={submitted}
            />
          )}
          {step.kind === 'build-prompt' && (
            <TapSequenceStep
              prompt={step.prompt}
              items={step.tokens}
              correctOrder={step.correctOrder}
              explanation={step.explanation}
              attempt={attempt as number[]}
              onChange={(v) => setAttempt(v)}
              submitted={submitted}
              itemSize="token"
            />
          )}
          {step.kind === 'order-steps' && (
            <TapSequenceStep
              prompt={step.prompt}
              items={step.steps}
              correctOrder={step.correctOrder}
              explanation={step.explanation}
              attempt={attempt as number[]}
              onChange={(v) => setAttempt(v)}
              submitted={submitted}
              itemSize="block"
            />
          )}
          {step.kind === 'tap-match' && (
            <TapMatchStep
              step={step}
              attempt={attempt as TapMatchAttempt}
              onChange={(v) => setAttempt(v)}
              submitted={submitted}
            />
          )}
          {step.kind === 'ai-prompt' && (
            <AiPromptStep
              step={step}
              attempt={attempt as string}
              onChange={(v) => setAttempt(v)}
              submitted={submitted}
            />
          )}
        </div>
      </main>

      {/* Bottom: XP bar + divider + CTA — matches header width for visual alignment */}
      <footer className="px-4 py-6">
        <div className="mx-auto max-w-2xl space-y-4">
          <XpBar xp={xp} total={totalXp} delta={xpDelta} />
          <div className="border-t border-gray-200 dark:border-gray-900" />
          <div className="flex justify-end gap-3">
            {isLast && onNext ? (
              <>
                <Button variant="outline" size="lg" onClick={handleExit} disabled={isFinishing}>
                  menú principal
                </Button>
                <div
                  className={`inline-block transition-transform duration-200 ${ctaBounce ? 'scale-110' : 'scale-100'}`}
                >
                  {passed ? (
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleFinishAndContinue}
                      disabled={ctaDisabled || isFinishing}
                    >
                      {nextLabel ?? 'siguiente lección'}
                    </Button>
                  ) : (
                    <Button
                      variant="danger"
                      size="lg"
                      onClick={handleRestart}
                      disabled={isFinishing}
                    >
                      repetir lección
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <div
                className={`inline-block transition-transform duration-200 ${ctaBounce ? 'scale-110' : 'scale-100'}`}
              >
                <Button variant="primary" size="lg" onClick={handleCta} disabled={ctaDisabled}>
                  {ctaLabel}
                </Button>
              </div>
            )}
          </div>
        </div>
      </footer>

      {showResult && (
        <ResultModal
          passed={passed}
          accuracy={accuracy}
          correctCount={correctCount}
          totalMcq={totalScoreable}
          onRetry={handleRestart}
          onExit={handleExit}
          onFinish={handleFinish}
        />
      )}

      {showNoLives && (
        <NoLivesModal
          onWait={handleExit}
          onBuy={() => {
            // TODO: cuando exista el flow de compra, navegar al checkout
            router.push('/');
          }}
        />
      )}
    </div>
  );
}

/* ─── result modal ─── */

function ResultModal({
  passed,
  accuracy,
  correctCount,
  totalMcq,
  onRetry,
  onExit,
  onFinish,
}: {
  passed: boolean;
  accuracy: number;
  correctCount: number;
  totalMcq: number;
  onRetry: () => void;
  onExit: () => void;
  onFinish: () => void;
}) {
  const percent = Math.round(accuracy * 100);
  const hasExercises = totalMcq > 0;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/40 dark:bg-white/10 backdrop-blur-sm">
      {passed && <ConfettiEffect count={120} pattern="radial" shape="circle" />}
      <Card variant="neutral" padding="lg" className="relative z-[110] w-full max-w-md">
        <div className="text-center space-y-5">
          <Title className="!text-3xl">
            {passed ? 'lección completada' : 'repetir lección'}
          </Title>
          <Body className="text-[#777777] dark:text-gray-400">
            {hasExercises
              ? `Acertaste ${correctCount} de ${totalMcq} ejercicios (${percent}%).`
              : 'Has revisado toda la lección.'}
            {passed ? ' ¡Buen trabajo!' : ' Necesitas al menos 80% para avanzar.'}
          </Body>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button variant={passed ? 'outline' : 'primary'} size="lg" onClick={passed ? onExit : onRetry}>
              {passed ? 'cerrar' : 'repetir'}
            </Button>
            {passed && (
              <Button variant="primary" size="lg" onClick={onFinish}>
                terminar
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ─── no lives modal ─── */

function NoLivesModal({
  onWait,
  onBuy,
}: {
  onWait: () => void;
  onBuy: () => void;
}) {
  // Target: 24h from now (fixed at mount so refreshes wouldn't cheat)
  const [remaining, setRemaining] = useState(24 * 60 * 60);

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/40 dark:bg-white/10 backdrop-blur-sm">
      <Card variant="neutral" padding="lg" className="relative z-[110] w-full max-w-md">
        <div className="text-center space-y-5">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <svg className="w-9 h-9 text-red-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21s-7-4.5-9.5-9C.5 8 3 4 6.5 4c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3C21 4 23.5 8 21.5 12 19 16.5 12 21 12 21z" />
            </svg>
          </div>
          <Title className="!text-3xl">ya no tienes más vidas</Title>
          <Body className="text-[#777777] dark:text-gray-400">
            Espera a que se recarguen tus vidas o consigue más ahora mismo para
            seguir aprendiendo.
          </Body>

          <div className="flex items-center justify-center gap-2 pt-1">
            <TimeSegment value={pad(h)} label="hrs" />
            <span className="text-2xl font-extrabold text-[#aeb3bb] pb-4">:</span>
            <TimeSegment value={pad(m)} label="min" />
            <span className="text-2xl font-extrabold text-[#aeb3bb] pb-4">:</span>
            <TimeSegment value={pad(s)} label="seg" />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button variant="outline" size="lg" onClick={onWait}>
              esperar
            </Button>
            <Button variant="primary" size="lg" onClick={onBuy}>
              comprar vidas
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function TimeSegment({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-3xl md:text-4xl font-extrabold tabular-nums text-[#4b4b4b] dark:text-white">
        {value}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-wider text-[#777777] dark:text-gray-400">
        {label}
      </span>
    </div>
  );
}

/* ─── progress bar ─── */

function SegmentedProgress({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex-1 flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`flex-1 h-3 rounded-full transition-colors duration-200 ${
            i <= current ? 'bg-[#1472FF]' : 'bg-gray-200 dark:bg-gray-900'
          }`}
        />
      ))}
    </div>
  );
}

/* ─── step renderers ─── */

/**
 * Inline markdown for single-line strings (explanations, short labels, etc.).
 * Only supports **bold**. Returns JSX suitable for nesting inside a <p>.
 */
function renderInlineMarkdown(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(
      <strong key={`b-${m.index}`} className="font-bold text-[#4b4b4b] dark:text-white">
        {m[1]}
      </strong>,
    );
    last = re.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length > 0 ? <>{parts}</> : text;
}

/**
 * Render the body of a concept slide with minimal markdown support:
 *   **bold**        → <strong>
 *   - item / • item → <ul><li>
 *   blank line      → paragraph break
 *
 * Content is authored by us (server-side in Supabase), so it's trusted.
 */
function renderMarkdownBody(body: string): React.ReactNode {
  const lines = body.split('\n');
  const blocks: React.ReactNode[] = [];
  let listBuffer: string[] = [];

  const flushList = () => {
    if (listBuffer.length > 0) {
      blocks.push(
        <ul
          key={`ul-${blocks.length}`}
          className="list-disc pl-6 space-y-1 text-left mx-auto max-w-md"
        >
          {listBuffer.map((item, i) => (
            <li key={i}>{renderInlineMarkdown(item)}</li>
          ))}
        </ul>,
      );
      listBuffer = [];
    }
  };

  lines.forEach((raw, i) => {
    const line = raw.trim();
    const bulletMatch = line.match(/^[-•]\s+(.*)$/);
    if (bulletMatch) {
      listBuffer.push(bulletMatch[1]);
      return;
    }
    flushList();
    if (line.length > 0) {
      blocks.push(<p key={`p-${i}`}>{renderInlineMarkdown(line)}</p>);
    }
  });
  flushList();

  return blocks;
}

function ConceptStep({
  title,
  body,
  image,
}: {
  title: string;
  body: string;
  image?: string;
}) {
  return (
    <div className="text-center space-y-6">
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          className="mx-auto w-[21rem] md:w-[24.5rem] h-auto object-contain"
        />
      )}
      <Title className="!text-3xl md:!text-4xl">{title}</Title>
      <div className="text-base md:text-lg text-[#777777] dark:text-gray-400 space-y-3 leading-relaxed">
        {renderMarkdownBody(body)}
      </div>
    </div>
  );
}

function ConceptVisualStep({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  // 4 boxes + 3 arrows, left-to-right. Box width 120, height 70, gaps 40.
  const boxes = [
    { label: 'usuario', icon: '❓', x: 10 },
    { label: 'retrieval', icon: '🔍', x: 170 },
    { label: 'contexto', icon: '📄', x: 330 },
    { label: 'respuesta', icon: '🤖', x: 490 },
  ];
  const boxW = 100;
  const boxH = 70;
  const boxY = 40;

  return (
    <div className="space-y-6">
      <Title className="!text-2xl md:!text-3xl text-center">{title}</Title>
      <div className="w-full">
        <svg
          viewBox="0 0 600 150"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
          role="img"
          aria-label="Diagrama del flujo RAG: usuario, retrieval, contexto, respuesta"
        >
          <defs>
            <marker
              id="rag-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#aeb3bb" />
            </marker>
          </defs>
          {boxes.map((b, i) => {
            const delay = i * 0.15;
            const arrowDelay = delay + 0.1;
            return (
              <g key={b.label}>
                <motion.g
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay, duration: 0.3 }}
                >
                  <rect
                    x={b.x}
                    y={boxY}
                    width={boxW}
                    height={boxH}
                    rx={12}
                    ry={12}
                    className="fill-white dark:fill-gray-800"
                    stroke="#1472FF"
                    strokeWidth={2}
                  />
                  <text
                    x={b.x + boxW / 2}
                    y={boxY + 32}
                    textAnchor="middle"
                    fontSize="22"
                  >
                    {b.icon}
                  </text>
                  <text
                    x={b.x + boxW / 2}
                    y={boxY + 55}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="700"
                    className="fill-[#4b4b4b] dark:fill-gray-200"
                  >
                    {b.label}
                  </text>
                </motion.g>
                {i < boxes.length - 1 && (
                  <motion.line
                    x1={b.x + boxW + 4}
                    y1={boxY + boxH / 2}
                    x2={boxes[i + 1].x - 6}
                    y2={boxY + boxH / 2}
                    stroke="#aeb3bb"
                    strokeWidth={2}
                    markerEnd="url(#rag-arrow)"
                    initial={{ opacity: 0, pathLength: 0 }}
                    animate={{ opacity: 1, pathLength: 1 }}
                    transition={{ delay: arrowDelay, duration: 0.3 }}
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <Body className="text-center text-[#777777] dark:text-gray-400">{body}</Body>
    </div>
  );
}

function MultipleChoiceStep({
  step,
  attempt,
  onChange,
  submitted,
}: {
  step: Extract<Step, { kind: 'mcq' }>;
  attempt: number | null;
  onChange: (id: number) => void;
  submitted: boolean;
}) {
  const [suppressHoverId, setSuppressHoverId] = useState<number | null>(null);

  const baseSelected =
    '[--depth-color:#aeb3bb] dark:[--depth-color:#4b5563] border-[#aeb3bb] bg-gray-200 dark:bg-gray-700 dark:border-gray-600';
  const selectedHover =
    ' hover:border-[#ef4444] hover:bg-white dark:hover:bg-gray-900 hover:[--depth-color:#b91c1c] [&_p]:hover:text-[#ef4444]';

  return (
    <div className="space-y-6">
      <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#4b4b4b] dark:text-white text-center leading-tight">
        {step.prompt}
      </h3>

      <div className="space-y-3">
        {step.options.map((option) => {
          const isSelected = attempt === option.id;
          const isCorrectOption = option.id === step.correctId;

          let stateClass =
            '[--depth-color:#e5e7eb] dark:[--depth-color:#111827] border-gray-200 dark:border-gray-900 hover:border-[#1472FF] hover:[--depth-color:#1472FF] [&_p]:hover:text-[#1472FF]';
          if (submitted) {
            if (isCorrectOption) {
              stateClass = '[--depth-color:#16a34a] border-[#16a34a] bg-[#22c55e] [&_p]:text-white';
            } else if (isSelected) {
              stateClass = '[--depth-color:#b91c1c] border-red-700 bg-red-500 [&_p]:text-white';
            } else {
              stateClass = '[--depth-color:#e5e7eb] dark:[--depth-color:#111827] border-gray-200 dark:border-gray-900 opacity-60';
            }
          } else if (isSelected) {
            stateClass =
              suppressHoverId === option.id
                ? baseSelected
                : baseSelected + selectedHover;
          }

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                if (submitted) return;
                onChange(option.id);
                setSuppressHoverId(option.id);
              }}
              onMouseLeave={() => {
                if (suppressHoverId === option.id) setSuppressHoverId(null);
              }}
              className={`w-full text-left rounded-2xl ${depth.border} px-5 py-4 transition-all duration-150 [box-shadow:0_4px_0_0_var(--depth-color)] ${
                submitted
                  ? 'cursor-default'
                  : 'cursor-pointer active:translate-y-[2px] active:[box-shadow:0_2px_0_0_var(--depth-color)]'
              } ${stateClass}`}
            >
              <p className="text-base md:text-lg font-medium text-[#4b4b4b] dark:text-gray-200">
                {option.text}
              </p>
            </button>
          );
        })}
      </div>

      {submitted && (
        <p className="text-center text-sm text-[#777777] dark:text-gray-400">
          {renderInlineMarkdown(step.explanation)}
        </p>
      )}
    </div>
  );
}

function MultiSelectStep({
  step,
  attempt,
  onChange,
  submitted,
}: {
  step: Extract<Step, { kind: 'multi-select' }>;
  attempt: number[];
  onChange: (ids: number[]) => void;
  submitted: boolean;
}) {
  const [suppressHoverId, setSuppressHoverId] = useState<number | null>(null);

  const toggle = (id: number) => {
    if (attempt.includes(id)) onChange(attempt.filter((x) => x !== id));
    else onChange([...attempt, id]);
    setSuppressHoverId(id);
  };

  const baseSelected =
    '[--depth-color:#aeb3bb] dark:[--depth-color:#4b5563] border-[#aeb3bb] bg-gray-200 dark:bg-gray-700 dark:border-gray-600';
  const selectedHover =
    ' hover:border-[#ef4444] hover:bg-white dark:hover:bg-gray-900 hover:[--depth-color:#b91c1c] [&_p]:hover:text-[#ef4444] [&_.dot]:hover:border-[#ef4444] [&_.dot]:hover:bg-[#ef4444]';

  return (
    <div className="space-y-6">
      <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#4b4b4b] dark:text-white text-center leading-tight">
        {step.prompt}
      </h3>

      <div className="space-y-3">
        {step.options.map((option) => {
          const isSelected = attempt.includes(option.id);
          const isCorrectOption = step.correctIds.includes(option.id);

          let stateClass =
            '[--depth-color:#e5e7eb] dark:[--depth-color:#111827] border-gray-200 dark:border-gray-900 hover:border-[#1472FF] hover:[--depth-color:#1472FF] [&_p]:hover:text-[#1472FF] [&_.dot]:hover:border-[#1472FF]';
          let boxClass = 'border-gray-300 dark:border-gray-900';
          let showCheck = false;
          let checkColor = 'text-white';

          if (submitted) {
            if (isCorrectOption && isSelected) {
              stateClass = '[--depth-color:#16a34a] border-[#16a34a] bg-[#22c55e] [&_p]:text-white';
              boxClass = 'bg-white border-white';
              showCheck = true;
              checkColor = 'text-[#16a34a]';
            } else if (isCorrectOption && !isSelected) {
              stateClass = '[--depth-color:#16a34a] border-[#16a34a]';
              boxClass = 'border-[#16a34a]';
            } else if (!isCorrectOption && isSelected) {
              stateClass = '[--depth-color:#b91c1c] border-red-700 bg-red-500 [&_p]:text-white';
              boxClass = 'bg-white border-white';
              showCheck = true;
              checkColor = 'text-red-600';
            } else {
              stateClass =
                '[--depth-color:#e5e7eb] dark:[--depth-color:#111827] border-gray-200 dark:border-gray-900 opacity-60';
              boxClass = 'border-gray-300 dark:border-gray-900';
            }
          } else if (isSelected) {
            stateClass =
              suppressHoverId === option.id
                ? baseSelected
                : baseSelected + selectedHover;
            boxClass = 'bg-[#4b4b4b] border-[#4b4b4b]';
            showCheck = true;
            checkColor = 'text-white';
          }

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => !submitted && toggle(option.id)}
              onMouseLeave={() => {
                if (suppressHoverId === option.id) setSuppressHoverId(null);
              }}
              className={`w-full text-left rounded-2xl ${depth.border} px-5 py-4 transition-all duration-150 [box-shadow:0_4px_0_0_var(--depth-color)] ${
                submitted
                  ? 'cursor-default'
                  : 'cursor-pointer active:translate-y-[2px] active:[box-shadow:0_2px_0_0_var(--depth-color)]'
              } ${stateClass}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`dot shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${boxClass}`}
                >
                  {showCheck && (
                    <svg
                      className={`w-4 h-4 ${checkColor}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={4}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                <p className="text-base md:text-lg font-medium text-[#4b4b4b] dark:text-gray-200">
                  {option.text}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {!submitted && (
        <p className="text-center text-sm text-[#777777] dark:text-gray-400">
          Elige las opciones correctas.
        </p>
      )}

      {submitted && (
        <p className="text-center text-sm text-[#777777] dark:text-gray-400">
          {renderInlineMarkdown(step.explanation)}
        </p>
      )}
    </div>
  );
}

function FillBlankStep({
  step,
  attempt,
  onChange,
  submitted,
}: {
  step: Extract<Step, { kind: 'fill-blank' }>;
  attempt: number | null;
  onChange: (v: number | null) => void;
  submitted: boolean;
}) {
  const [suppressSlotHover, setSuppressSlotHover] = useState(false);

  // Suppression is set right after clicking a token. We lift it as soon as
  // the pointer moves anywhere OUTSIDE the slot — the next time the user
  // re-enters the slot, the red "click to remove" hover will actually fire.
  useEffect(() => {
    if (!suppressSlotHover) return;
    const onPointerMove = (e: PointerEvent) => {
      const slot = document.querySelector('[data-slot="fill-blank"]');
      if (!slot) return;
      if (!slot.contains(e.target as Node)) {
        setSuppressSlotHover(false);
      }
    };
    window.addEventListener('pointermove', onPointerMove);
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, [suppressSlotHover]);

  const filled = attempt !== null ? step.tokens[attempt] : null;
  const correct = submitted && attempt === step.correctTokenIndex;

  let slotClass =
    '[--depth-color:#e5e7eb] dark:[--depth-color:#111827] border-dashed border-gray-300 dark:border-gray-900 bg-white dark:bg-gray-800 text-[#aeb3bb]';
  if (submitted) {
    if (correct) {
      slotClass =
        '[--depth-color:#16a34a] border-[#16a34a] bg-[#22c55e] text-white border-solid';
    } else if (attempt !== null) {
      slotClass =
        '[--depth-color:#b91c1c] border-red-700 bg-red-500 text-white border-solid';
    }
  } else if (filled !== null) {
    const base =
      '[--depth-color:#aeb3bb] border-[#aeb3bb] bg-gray-200 dark:bg-gray-800 dark:border-gray-900 text-[#4b4b4b] dark:text-gray-200 border-solid';
    const hover =
      ' hover:border-[#ef4444] hover:bg-white dark:hover:bg-gray-900 hover:text-[#ef4444] hover:[--depth-color:#b91c1c]';
    slotClass = suppressSlotHover ? base : base + hover;
  }

  return (
    <div className="space-y-8">
      {/* Sentence with inline blank — matches prompt styling of other exercises */}
      <h3 className="flex flex-wrap items-center justify-center gap-x-3 gap-y-3 text-2xl md:text-3xl font-extrabold tracking-tight text-[#4b4b4b] dark:text-white text-center leading-tight">
        <span>{step.sentenceBefore}</span>
        <button
          data-slot="fill-blank"
          type="button"
          disabled={submitted || attempt === null}
          onClick={() => {
            if (submitted || attempt === null) return;
            onChange(null);
          }}
          className={`inline-flex items-center min-w-[11rem] h-14 justify-center rounded-xl ${depth.border} px-5 transition-all duration-150 [box-shadow:0_4px_0_0_var(--depth-color)] ${slotClass} ${
            !submitted && attempt !== null
              ? 'cursor-pointer active:translate-y-[2px] active:[box-shadow:0_2px_0_0_var(--depth-color)]'
              : 'cursor-default'
          }`}
        >
          <span className="leading-none">{filled ?? '\u00A0'}</span>
        </button>
        <span>{step.sentenceAfter}</span>
      </h3>

      {/* Token pool */}
      <div className="flex flex-wrap justify-center gap-3">
        {step.tokens.map((token, i) => {
          const used = attempt === i;
          const disabled = submitted || used;

          let tokenClass =
            '[--depth-color:#e5e7eb] dark:[--depth-color:#111827] border-gray-200 dark:border-gray-900 bg-white dark:bg-gray-800 text-[#4b4b4b] dark:text-gray-200 hover:border-[#1472FF] hover:[--depth-color:#1472FF] hover:text-[#1472FF]';
          if (used) {
            tokenClass =
              '[--depth-color:#e5e7eb] dark:[--depth-color:#111827] border-gray-200 dark:border-gray-900 opacity-30 text-[#4b4b4b] dark:text-gray-200';
          } else if (submitted) {
            tokenClass =
              '[--depth-color:#e5e7eb] dark:[--depth-color:#111827] border-gray-200 dark:border-gray-900 opacity-60 text-[#4b4b4b] dark:text-gray-200';
          }

          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => {
                if (submitted || used) return;
                onChange(i);
                setSuppressSlotHover(true);
              }}
              className={`rounded-xl ${depth.border} px-4 py-2 text-base md:text-lg font-medium transition-all duration-150 [box-shadow:0_4px_0_0_var(--depth-color)] ${
                disabled
                  ? 'cursor-default'
                  : 'cursor-pointer active:translate-y-[2px] active:[box-shadow:0_2px_0_0_var(--depth-color)]'
              } ${tokenClass}`}
            >
              {token}
            </button>
          );
        })}
      </div>

      {submitted && (
        <p className="text-center text-sm text-[#777777] dark:text-gray-400">
          {renderInlineMarkdown(step.explanation)}
        </p>
      )}
    </div>
  );
}

function TapSequenceStep({
  prompt,
  items,
  correctOrder,
  explanation,
  attempt,
  onChange,
  submitted,
  itemSize,
}: {
  prompt: string;
  items: string[];
  correctOrder: number[];
  explanation: string;
  attempt: number[];
  onChange: (order: number[]) => void;
  submitted: boolean;
  itemSize: 'token' | 'block';
}) {
  const addToken = (i: number) => {
    if (submitted) return;
    if (attempt.includes(i)) return;
    onChange([...attempt, i]);
  };
  const removeAt = (pos: number) => {
    if (submitted) return;
    onChange(attempt.filter((_, i) => i !== pos));
  };

  const poolLayout =
    itemSize === 'block'
      ? 'flex flex-col gap-2'
      : 'flex flex-wrap gap-2 justify-center';
  const itemPadding = itemSize === 'block' ? 'px-5 py-4' : 'px-4 py-2';
  const itemAlign = itemSize === 'block' ? 'text-left w-full' : 'text-center';
  // Assembly starts small and grows as items are added. No reserved empty space.
  const assemblyMin = itemSize === 'block' ? 'min-h-[4rem]' : 'min-h-[3.5rem]';
  // Available items = items not yet used. Once selected, they disappear from the pool.
  const availableIndices = items
    .map((_, i) => i)
    .filter((i) => !attempt.includes(i));

  return (
    <div className="space-y-6">
      <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#4b4b4b] dark:text-white text-center leading-tight">
        {prompt}
      </h3>

      {/* Assembly area — container stays neutral always; items light individually */}
      <div
        style={{ ['--depth-color' as string]: '#e5e7eb' }}
        className={`rounded-2xl ${depth.border} border-dashed border-gray-300 dark:border-gray-900 bg-white dark:bg-gray-900 p-4 ${assemblyMin} transition-all duration-150`}
      >
        {attempt.length === 0 ? (
          <p className="text-sm text-[#aeb3bb] text-center py-6">
            Toca cada pieza en el orden correcto.
          </p>
        ) : (
          <div className={poolLayout}>
            {attempt.map((tokIdx, pos) => {
              const isCorrectPos = submitted && correctOrder[pos] === tokIdx;

              let stateClass =
                '[--depth-color:#e5e7eb] dark:[--depth-color:#111827] border-gray-200 dark:border-gray-900 bg-white dark:bg-gray-800 text-[#4b4b4b] dark:text-gray-200 hover:border-[#ef4444] hover:text-[#ef4444] hover:[--depth-color:#b91c1c]';
              if (submitted) {
                if (isCorrectPos) {
                  stateClass =
                    '[--depth-color:#16a34a] border-[#16a34a] bg-[#22c55e] text-white';
                } else {
                  stateClass =
                    '[--depth-color:#b91c1c] border-red-700 bg-red-500 text-white';
                }
              }

              return (
                <button
                  key={`${pos}-${tokIdx}`}
                  type="button"
                  onClick={() => removeAt(pos)}
                  disabled={submitted}
                  className={`rounded-xl ${depth.border} ${itemPadding} ${itemAlign} text-base md:text-lg font-medium transition-all duration-150 [box-shadow:0_4px_0_0_var(--depth-color)] ${
                    submitted
                      ? 'cursor-default'
                      : 'cursor-pointer active:translate-y-[2px] active:[box-shadow:0_2px_0_0_var(--depth-color)]'
                  } ${stateClass}`}
                >
                  {itemSize === 'block' && (
                    <span
                      className={`mr-2 font-extrabold ${
                        submitted ? 'text-white' : 'text-[#1472FF]'
                      }`}
                    >
                      {pos + 1}.
                    </span>
                  )}
                  {items[tokIdx]}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Pool — only items not yet selected. Once tapped, they disappear from
          here and appear in the assembly above. */}
      {availableIndices.length > 0 && (
        <div className={poolLayout}>
          {availableIndices.map((i) => {
            const text = items[i];
            const disabled = submitted;

            let tokenClass =
              '[--depth-color:#e5e7eb] dark:[--depth-color:#111827] border-gray-200 dark:border-gray-900 bg-white dark:bg-gray-800 text-[#4b4b4b] dark:text-gray-200 hover:border-[#1472FF] hover:[--depth-color:#1472FF] hover:text-[#1472FF]';
            if (submitted) {
              tokenClass =
                '[--depth-color:#e5e7eb] dark:[--depth-color:#111827] border-gray-200 dark:border-gray-900 opacity-60 text-[#4b4b4b] dark:text-gray-200';
            }

            return (
              <button
                key={i}
                type="button"
                disabled={disabled}
                onClick={() => addToken(i)}
                className={`rounded-xl ${depth.border} ${itemPadding} ${itemAlign} text-base md:text-lg font-medium transition-all duration-150 [box-shadow:0_4px_0_0_var(--depth-color)] ${
                  disabled
                    ? 'cursor-default'
                    : 'cursor-pointer active:translate-y-[2px] active:[box-shadow:0_2px_0_0_var(--depth-color)]'
                } ${tokenClass}`}
              >
                {text}
              </button>
            );
          })}
        </div>
      )}

      {submitted && (
        <p className="text-center text-sm text-[#777777] dark:text-gray-400">
          {renderInlineMarkdown(explanation)}
        </p>
      )}
    </div>
  );
}

function AiPromptStep({
  step,
  attempt,
  onChange,
  submitted,
}: {
  step: Extract<Step, { kind: 'ai-prompt' }>;
  attempt: string;
  onChange: (v: string) => void;
  submitted: boolean;
}) {
  const analysis = submitted ? analyzePrompt(attempt) : null;
  const scoreColor = analysis
    ? analysis.score >= 80
      ? '#22c55e'
      : analysis.score >= 50
        ? '#facc15'
        : '#ef4444'
    : '#e5e7eb';

  return (
    <div className="space-y-6">
      <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#4b4b4b] dark:text-white text-center leading-tight">
        {step.prompt}
      </h3>
      <p className="text-base text-[#777777] dark:text-gray-400 text-center">
        {step.instructions}
      </p>

      <div className="relative w-full bg-white dark:bg-gray-800 rounded-2xl border-2 transition-all duration-300 border-gray-300 dark:border-gray-900">
        <textarea
          value={attempt}
          onChange={(e) => onChange(e.target.value)}
          placeholder={step.placeholder}
          rows={6}
          disabled={submitted}
          className="w-full bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none focus:ring-0 font-light leading-relaxed px-4 pt-4 pb-2"
        />
        <div className="px-4 pb-2 flex justify-end">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {attempt.length}/500
          </p>
        </div>
      </div>

      {analysis && (
        <div
          style={{ ['--depth-color' as string]: '#e5e7eb' }}
          className={`rounded-2xl ${depth.border} border-gray-200 dark:border-gray-900 bg-white dark:bg-gray-900 p-5 space-y-3 [box-shadow:0_4px_0_0_var(--depth-color)]`}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#777777] dark:text-gray-400">
              análisis de la IA
            </span>
            <span className="text-2xl font-extrabold" style={{ color: scoreColor }}>
              {analysis.score}/100
            </span>
          </div>
          <div className="h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${analysis.score}%`, backgroundColor: scoreColor }}
            />
          </div>
          <p className="text-sm text-[#4b4b4b] dark:text-gray-300">{analysis.feedback}</p>
        </div>
      )}
    </div>
  );
}

/* ─── celebration slide ─── */

function CelebrationStep({
  emoji,
  title,
  body,
  section,
  correctSoFar,
  totalSoFar,
  streak,
  xpGained,
  passed = true,
}: {
  emoji: string;
  title: string;
  body: string;
  section?: string;
  correctSoFar: number;
  totalSoFar: number;
  streak: number;
  xpGained: number;
  passed?: boolean;
}) {
  // When the user did NOT pass the lesson, the final slide must NOT look
  // like a win: no confetti, no celebration copy, neutral emoji, score badge
  // in warning color. Otherwise the user may think they passed when they
  // actually need to retry. Keep "pass" path visually identical to before.
  const displayEmoji = passed ? emoji : '📚';
  const displayTitle = passed ? title : 'no pasaste todavía';
  const displayBody = passed
    ? body
    : 'Para pasar la lección necesitas al menos 80% de aciertos. Revisa los conceptos y reintenta — el hypercorrection effect hace que lo que fallaste hoy se te quede mejor mañana.';
  const accentColor = passed ? '#1472FF' : '#f59e0b'; // primary blue vs amber warning

  return (
    <div className="text-center space-y-6 relative">
      {passed && <ConfettiEffect count={60} pattern="radial" shape="circle" />}
      <motion.div
        className="text-8xl md:text-9xl leading-none"
        aria-hidden="true"
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: [0.3, 1.15, 1], opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {displayEmoji}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.35 }}
        className="space-y-2"
      >
        {section && (
          <p
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: accentColor }}
          >
            {section}
          </p>
        )}
        <Title className="!text-3xl md:!text-4xl">{displayTitle}</Title>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.3 }}
        className="flex flex-wrap justify-center gap-3"
      >
        <span
          className="rounded-full border-2 px-4 py-2 text-sm font-bold bg-white dark:bg-gray-900"
          style={{ borderColor: accentColor, color: accentColor }}
        >
          {passed ? '✓' : '✗'} {correctSoFar}/{totalSoFar}
        </span>
        {passed && (
          <>
            <span className="rounded-full border-2 border-[#1472FF] px-4 py-2 text-sm font-bold text-[#1472FF] bg-white dark:bg-gray-900">
              🔥 {DAILY_STREAK} días
            </span>
            <span className="rounded-full border-2 border-[#1472FF] px-4 py-2 text-sm font-bold text-[#1472FF] bg-white dark:bg-gray-900">
              +{xpGained} XP
            </span>
          </>
        )}
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.35 }}
      >
        <Body className="!text-lg text-[#777777] dark:text-gray-400">
          {displayBody}
        </Body>
      </motion.div>
    </div>
  );
}

/* ─── XP bar ─── */

const XP_MILESTONES = [0.25, 0.5, 0.75, 1];

function XpBar({
  xp,
  total,
  delta,
}: {
  xp: number;
  total: number;
  delta: { gain: number; id: number } | null;
}) {
  const pct = total === 0 ? 0 : Math.min(100, (xp / total) * 100);

  // Animated number ticker: count from previous xp to current xp over ~600ms
  const xpMotion = useMotionValue(xp);
  const xpRounded = useTransform(xpMotion, (v) => Math.round(v));
  const [displayXp, setDisplayXp] = useState(xp);
  useEffect(() => {
    const controls = animate(xpMotion, xp, {
      duration: 0.6,
      ease: 'easeOut',
    });
    const unsub = xpRounded.on('change', (v) => setDisplayXp(v));
    return () => {
      controls.stop();
      unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xp]);

  // Glow pulse: briefly highlight the bar when a new xp delta arrives
  const [glow, setGlow] = useState(false);
  useEffect(() => {
    if (delta === null) return;
    setGlow(true);
    const t = setTimeout(() => setGlow(false), 500);
    return () => clearTimeout(t);
  }, [delta?.id]);

  return (
    <div className="relative">
      <div
        className={`relative h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden transition-shadow duration-300 ${
          glow ? 'shadow-[0_0_18px_4px_rgba(34,197,94,0.55)]' : ''
        }`}
      >
        <motion.div
          className="h-full rounded-full bg-[#22c55e]"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
        {/* Milestone markers — small dark notches above 0% (exclusive of 100) */}
        {XP_MILESTONES.slice(0, -1).map((m) => {
          const reached = pct >= m * 100;
          return (
            <span
              key={m}
              className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-2 rounded-full transition-colors duration-300 ${
                reached ? 'bg-white/70' : 'bg-gray-300 dark:bg-gray-800'
              }`}
              style={{ left: `${m * 100}%` }}
              aria-hidden="true"
            />
          );
        })}
      </div>
      <div className="mt-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#777777] dark:text-gray-400">
        <span>xp</span>
        <span className="tabular-nums">
          {displayXp} / {total}
        </span>
      </div>
      <AnimatePresence>
        {delta !== null && (
          <motion.span
            key={`xp-delta-${delta.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: [0, 1, 1, 0], y: -24 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="absolute right-0 -top-3 text-sm font-extrabold text-[#22c55e]"
          >
            +{delta.gain} XP
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── true / false ─── */

function TrueFalseStep({
  step,
  attempt,
  onChange,
  submitted,
}: {
  step: Extract<Step, { kind: 'true-false' }>;
  attempt: boolean | null;
  onChange: (v: boolean) => void;
  submitted: boolean;
}) {
  const [suppressHover, setSuppressHover] = useState<boolean | null>(null);

  const baseSelected =
    '[--depth-color:#aeb3bb] dark:[--depth-color:#4b5563] border-[#aeb3bb] bg-gray-200 dark:bg-gray-700 dark:border-gray-600 text-[#4b4b4b] dark:text-gray-200';
  const selectedHover =
    ' hover:border-[#ef4444] hover:bg-white dark:hover:bg-gray-900 hover:[--depth-color:#b91c1c] hover:text-[#ef4444]';

  const renderOption = (value: boolean, label: string) => {
    const isSelected = attempt === value;
    const isCorrectOption = step.answer === value;

    let stateClass =
      '[--depth-color:#e5e7eb] dark:[--depth-color:#111827] border-gray-200 dark:border-gray-900 bg-white dark:bg-gray-800 text-[#4b4b4b] dark:text-gray-200 hover:border-[#1472FF] hover:[--depth-color:#1472FF] hover:text-[#1472FF]';
    if (submitted) {
      if (isCorrectOption) {
        stateClass =
          '[--depth-color:#16a34a] border-[#16a34a] bg-[#22c55e] text-white';
      } else if (isSelected) {
        stateClass =
          '[--depth-color:#b91c1c] border-red-700 bg-red-500 text-white';
      } else {
        stateClass =
          '[--depth-color:#e5e7eb] dark:[--depth-color:#111827] border-gray-200 dark:border-gray-900 opacity-60';
      }
    } else if (isSelected) {
      stateClass =
        suppressHover === value ? baseSelected : baseSelected + selectedHover;
    }

    return (
      <button
        type="button"
        aria-label={label}
        aria-pressed={isSelected}
        onClick={() => {
          if (submitted) return;
          onChange(value);
          setSuppressHover(value);
        }}
        onMouseLeave={() => {
          if (suppressHover === value) setSuppressHover(null);
        }}
        className={`min-w-[10rem] rounded-xl ${depth.border} px-8 py-4 transition-all duration-150 [box-shadow:0_4px_0_0_var(--depth-color)] text-base md:text-lg font-medium ${
          submitted
            ? 'cursor-default'
            : 'cursor-pointer active:translate-y-[2px] active:[box-shadow:0_2px_0_0_var(--depth-color)]'
        } ${stateClass}`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="space-y-8">
      <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#4b4b4b] dark:text-white text-center leading-tight">
        {step.statement}
      </h3>
      <div className="flex justify-center gap-4">
        {renderOption(true, 'Verdadero')}
        {renderOption(false, 'Falso')}
      </div>
      {submitted && (
        <p className="text-center text-sm text-[#777777] dark:text-gray-400">
          {renderInlineMarkdown(step.explanation)}
        </p>
      )}
    </div>
  );
}

/* ─── code completion ─── */

function CodeCompletionStep({
  step,
  attempt,
  onChange,
  submitted,
}: {
  step: Extract<Step, { kind: 'code-completion' }>;
  attempt: number | null;
  onChange: (v: number | null) => void;
  submitted: boolean;
}) {
  const filled = attempt !== null ? step.tokens[attempt] : null;
  const correct = submitted && attempt === step.correctTokenIndex;

  let slotClass =
    'border-dashed border-gray-400 dark:border-gray-900 bg-white dark:bg-gray-950 text-[#aeb3bb]';
  if (submitted) {
    if (correct) {
      slotClass =
        'border-[#16a34a] bg-[#22c55e] text-white border-solid';
    } else if (attempt !== null) {
      slotClass =
        'border-red-700 bg-red-500 text-white border-solid';
    }
  } else if (filled !== null) {
    slotClass =
      'border-[#1472FF] bg-white dark:bg-gray-950 text-[#1472FF] border-solid hover:border-[#ef4444] hover:text-[#ef4444]';
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#4b4b4b] dark:text-white text-center leading-tight">
        {step.prompt}
      </h3>

      <Card variant="neutral" padding="lg" className="overflow-x-auto">
        <pre className="font-mono text-sm md:text-base text-[#4b4b4b] dark:text-gray-200 whitespace-pre-wrap break-words leading-relaxed">
{step.codeBefore}
<button
  type="button"
  disabled={submitted || attempt === null}
  onClick={() => {
    if (submitted || attempt === null) return;
    onChange(null);
  }}
  aria-label={filled ? `espacio completado con ${filled}, toca para quitar` : 'espacio en blanco, elige un token abajo'}
  className={`inline-flex items-center justify-center rounded-xl border-2 px-2 py-0.5 mx-0.5 font-mono font-bold transition-all duration-150 align-baseline ${slotClass} ${
    !submitted && attempt !== null ? 'cursor-pointer' : 'cursor-default'
  }`}
>
  {filled ?? '____'}
</button>
{step.codeAfter}
        </pre>
      </Card>

      <div className="flex flex-wrap justify-center gap-3">
        {step.tokens.map((token, i) => {
          const used = attempt === i;
          const disabled = submitted || used;

          let tokenClass =
            '[--depth-color:#e5e7eb] dark:[--depth-color:#111827] border-gray-200 dark:border-gray-900 bg-white dark:bg-gray-800 text-[#4b4b4b] dark:text-gray-200 hover:border-[#1472FF] hover:[--depth-color:#1472FF] hover:text-[#1472FF]';
          if (used) {
            tokenClass =
              '[--depth-color:#e5e7eb] dark:[--depth-color:#111827] border-gray-200 dark:border-gray-900 opacity-30 text-[#4b4b4b] dark:text-gray-200';
          } else if (submitted) {
            tokenClass =
              '[--depth-color:#e5e7eb] dark:[--depth-color:#111827] border-gray-200 dark:border-gray-900 opacity-60 text-[#4b4b4b] dark:text-gray-200';
          }

          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => {
                if (submitted || used) return;
                onChange(i);
              }}
              className={`rounded-xl ${depth.border} px-4 py-2 font-mono text-sm md:text-base font-medium transition-all duration-150 [box-shadow:0_4px_0_0_var(--depth-color)] ${
                disabled
                  ? 'cursor-default'
                  : 'cursor-pointer active:translate-y-[2px] active:[box-shadow:0_2px_0_0_var(--depth-color)]'
              } ${tokenClass}`}
            >
              {token}
            </button>
          );
        })}
      </div>

      {submitted && (
        <p className="text-center text-sm text-[#777777] dark:text-gray-400">
          {renderInlineMarkdown(step.explanation)}
        </p>
      )}
    </div>
  );
}

/* ─── tap match ─── */

function TapMatchStep({
  step,
  attempt,
  onChange,
  submitted,
}: {
  step: Extract<Step, { kind: 'tap-match' }>;
  attempt: TapMatchAttempt;
  onChange: (a: TapMatchAttempt) => void;
  submitted: boolean;
}) {
  // Shuffle definitions once per mount. defOrder[displaySlot] = original pair index.
  const defOrder = useMemo(() => {
    const idx = step.pairs.map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    const isIdentity = idx.every((v, i) => v === i);
    if (isIdentity && idx.length > 1) {
      [idx[0], idx[1]] = [idx[1], idx[0]];
    }
    return idx;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.pairs.length]);

  // Helpers: find which pair (if any) a term/def is currently bound to
  const findPairByTerm = (termIdx: number) =>
    attempt.pairs.findIndex((p) => p.termIdx === termIdx);
  const findPairByDef = (defIdx: number) =>
    attempt.pairs.findIndex((p) => p.defIdx === defIdx);

  const onTermClick = (termIdx: number) => {
    if (submitted) return;
    // If the term is already bound, unbind it (let user re-pair)
    const existing = findPairByTerm(termIdx);
    if (existing >= 0) {
      onChange({
        ...attempt,
        pairs: attempt.pairs.filter((_, i) => i !== existing),
        selectedTerm: null,
        selectedDef: null,
      });
      return;
    }
    if (attempt.selectedDef !== null) {
      // Pair this term with the previously-selected def slot
      const defOriginal = defOrder[attempt.selectedDef];
      const newPairs = [
        ...attempt.pairs,
        { termIdx, defIdx: defOriginal },
      ];
      onChange({
        pairs: newPairs,
        selectedTerm: null,
        selectedDef: null,
      });
      return;
    }
    onChange({ ...attempt, selectedTerm: termIdx });
  };

  const onDefClick = (displayDefIdx: number) => {
    if (submitted) return;
    const defOriginal = defOrder[displayDefIdx];
    const existing = findPairByDef(defOriginal);
    if (existing >= 0) {
      // Unbind
      onChange({
        ...attempt,
        pairs: attempt.pairs.filter((_, i) => i !== existing),
        selectedTerm: null,
        selectedDef: null,
      });
      return;
    }
    if (attempt.selectedTerm !== null) {
      const newPairs = [
        ...attempt.pairs,
        { termIdx: attempt.selectedTerm, defIdx: defOriginal },
      ];
      onChange({
        pairs: newPairs,
        selectedTerm: null,
        selectedDef: null,
      });
      return;
    }
    onChange({ ...attempt, selectedDef: displayDefIdx });
  };

  // Class helpers — Tailwind-only, no inline styles.
  const classForBtn = (
    isPaired: boolean,
    isSelected: boolean,
    isCorrect?: boolean,
  ) => {
    if (isCorrect === true)
      return '[--depth-color:#16a34a] border-[#16a34a] bg-[#22c55e] text-white';
    if (isCorrect === false)
      return '[--depth-color:#b91c1c] border-red-700 bg-red-500 text-white';
    if (isPaired)
      return '[--depth-color:#aeb3bb] dark:[--depth-color:#4b5563] border-[#aeb3bb] bg-gray-200 dark:bg-gray-700 dark:border-gray-600 text-[#4b4b4b] dark:text-gray-200';
    if (isSelected)
      return '[--depth-color:#1472FF] border-[#1472FF] bg-gray-100 dark:bg-gray-900 text-[#1472FF]';
    return '[--depth-color:#e5e7eb] dark:[--depth-color:#111827] border-gray-200 dark:border-gray-900 bg-white dark:bg-gray-800 text-[#4b4b4b] dark:text-gray-200 hover:border-[#1472FF] hover:[--depth-color:#1472FF] hover:text-[#1472FF]';
  };

  // --- Arrow geometry ---
  // We measure positions off the grid container via a ref.
  const gridRef = useRef<HTMLDivElement>(null);
  const [arrows, setArrows] = useState<
    { x1: number; y1: number; x2: number; y2: number; correct?: boolean }[]
  >([]);

  const computeArrows = useCallback(() => {
    const grid = gridRef.current;
    if (!grid || attempt.pairs.length === 0) {
      setArrows([]);
      return;
    }
    const gridRect = grid.getBoundingClientRect();
    const btns = grid.querySelectorAll<HTMLElement>('[data-match-role]');
    // Map termIdx → element, defDisplayIdx → element
    const termEls = new Map<number, HTMLElement>();
    const defEls = new Map<number, HTMLElement>();
    btns.forEach((el) => {
      const role = el.dataset.matchRole;
      const idx = Number(el.dataset.matchIdx);
      if (role === 'term') termEls.set(idx, el);
      else defEls.set(idx, el);
    });

    const newArrows = attempt.pairs.map((p) => {
      const termEl = termEls.get(p.termIdx);
      // Find which displayDefIdx corresponds to defIdx = p.defIdx
      const displayIdx = defOrder.indexOf(p.defIdx);
      const defEl = defEls.get(displayIdx);
      if (!termEl || !defEl)
        return { x1: 0, y1: 0, x2: 0, y2: 0 };
      const tRect = termEl.getBoundingClientRect();
      const dRect = defEl.getBoundingClientRect();
      const correct = submitted ? p.termIdx === p.defIdx : undefined;
      const y1Raw = tRect.top + tRect.height / 2 - gridRect.top;
      const y2Raw = dRect.top + dRect.height / 2 - gridRect.top;
      // Snap to horizontal when elements are in the same row (< 10px diff)
      const snap = Math.abs(y1Raw - y2Raw) < 10;
      const yMid = (y1Raw + y2Raw) / 2;
      return {
        x1: tRect.right - gridRect.left,
        y1: snap ? yMid : y1Raw,
        x2: dRect.left - gridRect.left,
        y2: snap ? yMid : y2Raw,
        correct,
      };
    });
    setArrows(newArrows);
  }, [attempt.pairs, defOrder, submitted]);

  useEffect(() => {
    computeArrows();
  }, [computeArrows]);

  // Recompute on resize
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const ro = new ResizeObserver(() => computeArrows());
    ro.observe(grid);
    return () => ro.disconnect();
  }, [computeArrows]);

  const hasPairs = attempt.pairs.length > 0;
  const hasSelection =
    attempt.selectedTerm !== null || attempt.selectedDef !== null;
  const showDivider = !hasPairs && !hasSelection;

  return (
    <div className="space-y-6">
      <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#4b4b4b] dark:text-white text-center leading-tight">
        {step.prompt}
      </h3>

      <div className="relative">
        {/* Central vertical divider — centered in the 25% gap between the two columns */}
        <div
          aria-hidden="true"
          className={`absolute top-0 bottom-0 left-[37.5%] w-px bg-gray-200 dark:bg-gray-800 pointer-events-none transition-opacity duration-300 ${showDivider ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Arrow overlay SVG */}
        {arrows.length > 0 && (
          <svg
            aria-hidden="true"
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 1 }}
          >
            {arrows.map((a, idx) => {
              const color =
                a.correct === true
                  ? '#16a34a'
                  : a.correct === false
                    ? '#b91c1c'
                    : '#aeb3bb';
              return (
                <line
                  key={idx}
                  x1={a.x1 + 4}
                  y1={a.y1}
                  x2={a.x2 - 4}
                  y2={a.y2}
                  stroke={color}
                  strokeWidth={2}
                />
              );
            })}
          </svg>
        )}

        {/* Grid: 40% terms | 60% definitions */}
        <div
          ref={gridRef}
          className="grid grid-cols-[25%_50%] justify-between gap-y-3 items-stretch auto-rows-fr"
        >
          {step.pairs.map((pair, i) => {
            const displayDefIdx = i;
            const defOrigIdx = defOrder[displayDefIdx];

            const termPairIdx = findPairByTerm(i);
            const defPairIdx = findPairByDef(defOrigIdx);
            const termIsPaired = termPairIdx >= 0;
            const defIsPaired = defPairIdx >= 0;

            const termCorrect =
              submitted && termIsPaired
                ? attempt.pairs[termPairIdx].termIdx ===
                  attempt.pairs[termPairIdx].defIdx
                : undefined;
            const defCorrect =
              submitted && defIsPaired
                ? attempt.pairs[defPairIdx].termIdx ===
                  attempt.pairs[defPairIdx].defIdx
                : undefined;

            return (
              <Fragment key={`row-${i}`}>
                <button
                  type="button"
                  data-match-role="term"
                  data-match-idx={i}
                  aria-label={`término: ${pair.term}`}
                  aria-pressed={
                    attempt.selectedTerm === i || termIsPaired
                  }
                  disabled={submitted}
                  onClick={() => onTermClick(i)}
                  className={`w-full h-full min-h-[3.5rem] rounded-xl ${depth.border} px-3 py-3 text-center text-sm md:text-base font-bold flex items-center justify-center transition-all duration-150 [box-shadow:0_4px_0_0_var(--depth-color)] ${
                    submitted
                      ? 'cursor-default'
                      : 'cursor-pointer active:translate-y-[2px] active:[box-shadow:0_2px_0_0_var(--depth-color)]'
                  } ${classForBtn(termIsPaired, attempt.selectedTerm === i, termCorrect)}`}
                >
                  {pair.term}
                </button>

                <button
                  type="button"
                  data-match-role="def"
                  data-match-idx={displayDefIdx}
                  aria-label={`definición: ${step.pairs[defOrigIdx].def}`}
                  aria-pressed={
                    attempt.selectedDef === displayDefIdx || defIsPaired
                  }
                  disabled={submitted}
                  onClick={() => onDefClick(displayDefIdx)}
                  className={`w-full h-full min-h-[3.5rem] rounded-xl ${depth.border} px-4 py-3 text-center text-sm md:text-base font-medium flex items-center justify-center transition-all duration-150 [box-shadow:0_4px_0_0_var(--depth-color)] ${
                    submitted
                      ? 'cursor-default'
                      : 'cursor-pointer active:translate-y-[2px] active:[box-shadow:0_2px_0_0_var(--depth-color)]'
                  } ${classForBtn(defIsPaired, attempt.selectedDef === displayDefIdx, defCorrect)}`}
                >
                  <span className="leading-snug">
                    {step.pairs[defOrigIdx].def}
                  </span>
                </button>
              </Fragment>
            );
          })}
        </div>
      </div>

      {!submitted && (
        <p className="text-center text-sm text-[#777777] dark:text-gray-400">
          Forma los {step.pairs.length} pares, después toca comprobar.
        </p>
      )}

      {submitted && (
        <p className="text-center text-sm text-[#777777] dark:text-gray-400">
          {renderInlineMarkdown(step.explanation)}
        </p>
      )}
    </div>
  );
}

/* ─── streak badge ─── */

function StreakBadge({ count }: { count: number }) {
  return (
    <div
      className={`inline-flex items-center gap-2 h-[42px] px-4 rounded-xl bg-white dark:bg-gray-800 text-[#4b4b4b] dark:text-gray-300 border-gray-300 dark:border-gray-900 border-b-gray-300 dark:border-b-gray-900 ${depthBase}`}
      aria-label={`racha de ${count} días`}
    >
      <span className="text-lg leading-none" aria-hidden="true">
        🔥
      </span>
      <span className="text-sm font-bold tabular-nums">{count}</span>
    </div>
  );
}

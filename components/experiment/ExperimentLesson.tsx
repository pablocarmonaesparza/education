'use client';

import { useEffect, useMemo, useState } from 'react';
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
  matched: number[];
  selectedTerm: number | null;
  selectedDef: number | null;
  wrongAttempts: number;
};

type Step =
  | { kind: 'concept'; title: string; body: string; image?: string }
  | { kind: 'concept-visual'; title: string; body: string; visualLabel: string }
  | { kind: 'celebration'; emoji: string; title: string; body: string }
  | {
      kind: 'mcq';
      prompt: string;
      options: Option[];
      correctId: number;
      explanation: string;
    }
  | {
      kind: 'multi-select';
      prompt: string;
      options: Option[];
      correctIds: number[];
      explanation: string;
    }
  | {
      kind: 'true-false';
      prompt: string;
      statement: string;
      answer: boolean;
      explanation: string;
    }
  | {
      kind: 'fill-blank';
      prompt: string;
      sentenceBefore: string;
      sentenceAfter: string;
      tokens: string[];
      correctTokenIndex: number;
      explanation: string;
    }
  | {
      kind: 'code-completion';
      prompt: string;
      codeBefore: string;
      codeAfter: string;
      tokens: string[];
      correctTokenIndex: number;
      explanation: string;
    }
  | {
      kind: 'build-prompt';
      prompt: string;
      tokens: string[];
      correctOrder: number[];
      explanation: string;
    }
  | {
      kind: 'order-steps';
      prompt: string;
      steps: string[];
      correctOrder: number[];
      explanation: string;
    }
  | {
      kind: 'tap-match';
      prompt: string;
      pairs: { term: string; def: string }[];
      explanation: string;
    }
  | {
      kind: 'ai-prompt';
      prompt: string;
      instructions: string;
      placeholder: string;
    };

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
  matched: [],
  selectedTerm: null,
  selectedDef: null,
  wrongAttempts: 0,
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
      return (attempt as TapMatchAttempt).matched.length === step.pairs.length;
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
      const a = attempt as TapMatchAttempt;
      // Scored by final state: all pairs matched counts as correct.
      // wrongAttempts is tracked for UX feedback but does not fail the exercise.
      return a.matched.length === step.pairs.length;
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

/* ─── lesson data ─── */

const STEPS: Step[] = [
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
  },
  {
    kind: 'fill-blank',
    prompt: 'completa la oración',
    sentenceBefore: 'Un agente RAG',
    sentenceAfter: 'información antes de responder.',
    tokens: ['inventa', 'recupera', 'ignora', 'traduce'],
    correctTokenIndex: 1,
    explanation: 'Recuperar (retrieval) es el paso R de RAG.',
  },
  {
    kind: 'concept-visual',
    title: 'el flujo básico',
    body: 'El usuario pregunta, el agente busca en una base de conocimiento y responde citando lo que encontró.',
    visualLabel: 'diagrama del flujo RAG',
  },
  {
    kind: 'true-false',
    prompt: 'verdadero o falso',
    statement:
      'Subir la temperatura del modelo siempre reduce las alucinaciones.',
    answer: false,
    explanation:
      'Falso: mayor temperatura aumenta la variabilidad y tiende a fabricar más, no menos.',
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
  },
  {
    kind: 'tap-match',
    prompt: 'empareja cada concepto con su definición',
    pairs: [
      { term: 'retrieval', def: 'buscar fragmentos relevantes en una base de datos.' },
      { term: 'augmentation', def: 'inyectar ese contexto dentro del prompt.' },
      { term: 'generation', def: 'producir la respuesta final con el modelo.' },
      { term: 'grounding', def: 'atar la respuesta a la evidencia recuperada.' },
    ],
    explanation:
      'Las tres letras de RAG más grounding resumen toda la arquitectura del agente.',
  },
  {
    kind: 'celebration',
    emoji: '🎉',
    title: '¡vas por buen camino!',
    body: 'Ya dominas los conceptos base. Sigamos con la parte práctica.',
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
  },
  {
    kind: 'build-prompt',
    prompt: 'arma un prompt de sistema',
    tokens: [
      'cita las fuentes.',
      'eres un asistente.',
      'responde solo si',
      'hay evidencia recuperada.',
    ],
    correctOrder: [1, 2, 3, 0],
    explanation: 'Rol → condición → fallback → requisito de citas.',
  },
  {
    kind: 'ai-prompt',
    prompt: 'escribe tu propio prompt',
    instructions:
      'Escribe un prompt de sistema para un asistente RAG que responda solo con base en la información recuperada y cite sus fuentes.',
    placeholder: 'Eres un asistente que...',
  },
];

/* ─── main component ─── */

export default function ExperimentLesson() {
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

  const step = STEPS[index];
  const isLast = index === STEPS.length - 1;
  const interactive = isInteractive(step);
  const needsCheck = interactive && !submitted;
  const complete = interactive ? isAttemptComplete(step, attempt) : true;
  const ctaDisabled = needsCheck && !complete;
  const ctaLabel = needsCheck ? 'comprobar' : isLast ? 'terminar' : 'continuar';

  const handleExit = () => router.push('/');

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
          setStreak((s) => s + 1);
          setCtaBounce(true);
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
      setShowResult(true);
      return;
    }
    const next = index + 1;
    setIndex(next);
    setMaxVisited((m) => Math.max(m, next));
    resetStateForStep(next);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      {/* Top bar: exit + back + segmented progress + forward + lives */}
      <header className="relative px-4 py-4">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <IconButton
            variant="outline"
            aria-label="Salir de la lección"
            onClick={handleExit}
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
        </div>
        <div className="mx-auto max-w-2xl flex items-center gap-3">
          <IconButton
            variant="outline"
            aria-label="Etapa anterior"
            onClick={handleBack}
            disabled={index === 0}
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
          <SegmentedProgress total={STEPS.length} current={index} />
          <IconButton
            variant="outline"
            aria-label="Etapa siguiente"
            onClick={handleForward}
            disabled={index >= maxVisited || ctaDisabled || needsCheck}
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
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {streak >= 2 && <StreakBadge count={streak} />}
          <div
            className={`inline-flex items-center gap-2 h-[42px] px-4 rounded-xl bg-white dark:bg-gray-800 text-[#4b4b4b] dark:text-gray-300 border-gray-300 dark:border-gray-900 border-b-gray-300 dark:border-b-gray-900 ${depthBase} origin-center transition-transform duration-200 ${livesPulse ? 'scale-125' : 'scale-100'}`}
            aria-label={HAS_UNLIMITED_LIVES ? 'vidas ilimitadas' : `${lives} vidas`}
          >
            <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21s-7-4.5-9.5-9C.5 8 3 4 6.5 4c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3C21 4 23.5 8 21.5 12 19 16.5 12 21 12 21z" />
            </svg>
            {HAS_UNLIMITED_LIVES ? (
              <span className="text-2xl font-bold leading-none translate-y-[2px]" aria-hidden="true">
                ∞
              </span>
            ) : (
              <span className="text-sm font-bold tabular-nums">{lives}</span>
            )}
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
            <ConceptVisualStep
              title={step.title}
              body={step.body}
              visualLabel={step.visualLabel}
            />
          )}
          {step.kind === 'celebration' && (
            <CelebrationStep
              emoji={step.emoji}
              title={step.title}
              body={step.body}
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

      {/* Bottom CTA */}
      <footer className="px-4 py-6">
        <div className="mx-auto max-w-2xl flex justify-end">
          <div
            className={`inline-block transition-transform duration-200 ${ctaBounce ? 'scale-110' : 'scale-100'}`}
          >
            <Button variant="primary" size="lg" onClick={handleCta} disabled={ctaDisabled}>
              {ctaLabel}
            </Button>
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
}: {
  passed: boolean;
  accuracy: number;
  correctCount: number;
  totalMcq: number;
  onRetry: () => void;
  onExit: () => void;
}) {
  const percent = Math.round(accuracy * 100);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/40 dark:bg-white/10 backdrop-blur-sm">
      {passed && <ConfettiEffect count={120} pattern="radial" shape="circle" />}
      <Card variant="neutral" padding="lg" className="relative z-[110] w-full max-w-md">
        <div className="text-center space-y-5">
          <Title className="!text-3xl">
            {passed ? 'lección completada' : 'repetir lección'}
          </Title>
          <Body className="text-[#777777] dark:text-gray-400">
            Acertaste {correctCount} de {totalMcq} ejercicios ({percent}%).
            {passed ? ' ¡Buen trabajo!' : ' Necesitas al menos 80% para avanzar.'}
          </Body>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button variant={passed ? 'outline' : 'primary'} size="lg" onClick={onRetry}>
              repetir
            </Button>
            {passed && (
              <Button variant="primary" size="lg" onClick={onExit}>
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
            i <= current ? 'bg-[#1472FF]' : 'bg-gray-200 dark:bg-gray-800'
          }`}
        />
      ))}
    </div>
  );
}

/* ─── step renderers ─── */

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
      <Body className="!text-lg text-[#777777] dark:text-gray-400">{body}</Body>
    </div>
  );
}

function ConceptVisualStep({
  title,
  body,
  visualLabel,
}: {
  title: string;
  body: string;
  visualLabel: string;
}) {
  return (
    <div className="space-y-6">
      <Title className="!text-2xl md:!text-3xl text-center">{title}</Title>
      <Card
        variant="neutral"
        padding="lg"
        className="aspect-[16/9] flex items-center justify-center"
      >
        <p className="text-xs font-bold uppercase tracking-wider text-[#777777] dark:text-gray-400">
          {visualLabel}
        </p>
      </Card>
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
    '[--depth-color:#aeb3bb] border-[#aeb3bb] bg-gray-200 dark:bg-gray-800 dark:border-gray-600';
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
            '[--depth-color:#e5e7eb] border-gray-200 dark:border-gray-700 hover:border-[#1472FF] hover:[--depth-color:#1472FF] [&_p]:hover:text-[#1472FF]';
          if (submitted) {
            if (isCorrectOption) {
              stateClass = '[--depth-color:#16a34a] border-[#16a34a] bg-[#22c55e] [&_p]:text-white';
            } else if (isSelected) {
              stateClass = '[--depth-color:#b91c1c] border-red-700 bg-red-500 [&_p]:text-white';
            } else {
              stateClass = '[--depth-color:#e5e7eb] border-gray-200 dark:border-gray-700 opacity-60';
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
          {step.explanation}
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
    '[--depth-color:#aeb3bb] border-[#aeb3bb] bg-gray-200 dark:bg-gray-800 dark:border-gray-600';
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
            '[--depth-color:#e5e7eb] border-gray-200 dark:border-gray-700 hover:border-[#1472FF] hover:[--depth-color:#1472FF] [&_p]:hover:text-[#1472FF] [&_.dot]:hover:border-[#1472FF]';
          let boxClass = 'border-gray-300 dark:border-gray-600';
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
                '[--depth-color:#e5e7eb] border-gray-200 dark:border-gray-700 opacity-60';
              boxClass = 'border-gray-300 dark:border-gray-600';
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
          elige las opciones correctas
        </p>
      )}

      {submitted && (
        <p className="text-center text-sm text-[#777777] dark:text-gray-400">
          {step.explanation}
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
    '[--depth-color:#e5e7eb] border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#aeb3bb]';
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
      '[--depth-color:#aeb3bb] border-[#aeb3bb] bg-gray-200 dark:bg-gray-800 dark:border-gray-600 text-[#4b4b4b] dark:text-gray-200 border-solid';
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
            '[--depth-color:#e5e7eb] border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#4b4b4b] dark:text-gray-200 hover:border-[#1472FF] hover:[--depth-color:#1472FF] hover:text-[#1472FF]';
          if (used) {
            tokenClass =
              '[--depth-color:#e5e7eb] border-gray-200 dark:border-gray-700 opacity-30 text-[#4b4b4b] dark:text-gray-200';
          } else if (submitted) {
            tokenClass =
              '[--depth-color:#e5e7eb] border-gray-200 dark:border-gray-700 opacity-60 text-[#4b4b4b] dark:text-gray-200';
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
          {step.explanation}
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
  const assemblyMin = itemSize === 'block' ? 'min-h-[14rem]' : 'min-h-[5.5rem]';

  return (
    <div className="space-y-6">
      <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#4b4b4b] dark:text-white text-center leading-tight">
        {prompt}
      </h3>

      {/* Assembly area — container stays neutral always; items light individually */}
      <div
        style={{ ['--depth-color' as string]: '#e5e7eb' }}
        className={`rounded-2xl ${depth.border} border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 ${assemblyMin} transition-all duration-150`}
      >
        {attempt.length === 0 ? (
          <p className="text-sm text-[#aeb3bb] text-center py-6">
            toca cada pieza en el orden correcto
          </p>
        ) : (
          <div className={poolLayout}>
            {attempt.map((tokIdx, pos) => {
              const isCorrectPos = submitted && correctOrder[pos] === tokIdx;

              let stateClass =
                '[--depth-color:#e5e7eb] border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#4b4b4b] dark:text-gray-200 hover:border-[#ef4444] hover:text-[#ef4444] hover:[--depth-color:#b91c1c]';
              if (submitted) {
                if (isCorrectPos) {
                  stateClass =
                    '[--depth-color:#16a34a] border-[#16a34a] bg-[#22c55e] text-white';
                } else {
                  stateClass =
                    '[--depth-color:#e5e7eb] border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#4b4b4b] dark:text-gray-200 opacity-70';
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
                        submitted && isCorrectPos ? 'text-white' : 'text-[#1472FF]'
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

      {/* Token pool */}
      <div className={poolLayout}>
        {items.map((text, i) => {
          const used = attempt.includes(i);
          const disabled = used || submitted;

          let tokenClass =
            '[--depth-color:#e5e7eb] border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#4b4b4b] dark:text-gray-200 hover:border-[#1472FF] hover:[--depth-color:#1472FF] hover:text-[#1472FF]';
          if (used) {
            tokenClass =
              '[--depth-color:#e5e7eb] border-gray-200 dark:border-gray-700 opacity-30 text-[#4b4b4b] dark:text-gray-200';
          } else if (submitted) {
            tokenClass =
              '[--depth-color:#e5e7eb] border-gray-200 dark:border-gray-700 opacity-60 text-[#4b4b4b] dark:text-gray-200';
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

      {submitted && (
        <p className="text-center text-sm text-[#777777] dark:text-gray-400">
          {explanation}
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

      <Textarea
        variant="flat"
        value={attempt}
        onChange={(e) => onChange(e.target.value)}
        placeholder={step.placeholder}
        rows={6}
        disabled={submitted}
      />

      {analysis && (
        <div
          style={{ ['--depth-color' as string]: '#e5e7eb' }}
          className={`rounded-2xl ${depth.border} border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 space-y-3 [box-shadow:0_4px_0_0_var(--depth-color)]`}
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
}: {
  emoji: string;
  title: string;
  body: string;
}) {
  return (
    <div className="text-center space-y-6">
      <div className="text-8xl md:text-9xl leading-none" aria-hidden="true">
        {emoji}
      </div>
      <Title className="!text-3xl md:!text-4xl">{title}</Title>
      <Body className="!text-lg text-[#777777] dark:text-gray-400">{body}</Body>
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
    '[--depth-color:#aeb3bb] border-[#aeb3bb] bg-gray-200 dark:bg-gray-800 dark:border-gray-600 text-[#4b4b4b] dark:text-gray-200';
  const selectedHover =
    ' hover:border-[#ef4444] hover:bg-white dark:hover:bg-gray-900 hover:[--depth-color:#b91c1c] hover:text-[#ef4444]';

  const renderOption = (value: boolean, label: string, icon: string) => {
    const isSelected = attempt === value;
    const isCorrectOption = step.answer === value;

    let stateClass =
      '[--depth-color:#e5e7eb] border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#4b4b4b] dark:text-gray-200 hover:border-[#1472FF] hover:[--depth-color:#1472FF] hover:text-[#1472FF]';
    if (submitted) {
      if (isCorrectOption) {
        stateClass =
          '[--depth-color:#16a34a] border-[#16a34a] bg-[#22c55e] text-white';
      } else if (isSelected) {
        stateClass =
          '[--depth-color:#b91c1c] border-red-700 bg-red-500 text-white';
      } else {
        stateClass =
          '[--depth-color:#e5e7eb] border-gray-200 dark:border-gray-700 opacity-60';
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
        className={`flex-1 rounded-2xl ${depth.border} p-6 md:p-8 transition-all duration-150 [box-shadow:0_4px_0_0_var(--depth-color)] ${
          submitted
            ? 'cursor-default'
            : 'cursor-pointer active:translate-y-[2px] active:[box-shadow:0_2px_0_0_var(--depth-color)]'
        } ${stateClass}`}
      >
        <div className="flex flex-col items-center gap-3">
          <span className="text-5xl font-extrabold leading-none" aria-hidden="true">
            {icon}
          </span>
          <span className="text-base md:text-lg font-extrabold uppercase tracking-wide">
            {label}
          </span>
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#4b4b4b] dark:text-white text-center leading-tight">
        {step.prompt}
      </h3>
      <Card variant="neutral" padding="lg">
        <p className="text-lg md:text-xl font-medium text-[#4b4b4b] dark:text-gray-200 text-center italic leading-relaxed">
          “{step.statement}”
        </p>
      </Card>
      <div className="flex gap-4">
        {renderOption(true, 'verdadero', '✓')}
        {renderOption(false, 'falso', '✗')}
      </div>
      {submitted && (
        <p className="text-center text-sm text-[#777777] dark:text-gray-400">
          {step.explanation}
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
    'border-dashed border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-950 text-[#aeb3bb]';
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
            '[--depth-color:#e5e7eb] border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#4b4b4b] dark:text-gray-200 hover:border-[#1472FF] hover:[--depth-color:#1472FF] hover:text-[#1472FF]';
          if (used) {
            tokenClass =
              '[--depth-color:#e5e7eb] border-gray-200 dark:border-gray-700 opacity-30 text-[#4b4b4b] dark:text-gray-200';
          } else if (submitted) {
            tokenClass =
              '[--depth-color:#e5e7eb] border-gray-200 dark:border-gray-700 opacity-60 text-[#4b4b4b] dark:text-gray-200';
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
          {step.explanation}
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
  // Shuffle definitions once per mount. Using a simple deterministic rotation
  // keeps render stable across re-renders inside StrictMode double-invokes.
  const defOrder = useMemo(() => {
    const idx = step.pairs.map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    // Guarantee at least one displacement so the pairing is not trivial.
    const isIdentity = idx.every((v, i) => v === i);
    if (isIdentity && idx.length > 1) {
      [idx[0], idx[1]] = [idx[1], idx[0]];
    }
    return idx;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.pairs.length]);

  const [wrongFlash, setWrongFlash] = useState<{ term: number; def: number } | null>(null);

  useEffect(() => {
    if (!wrongFlash) return;
    const t = setTimeout(() => setWrongFlash(null), 450);
    return () => clearTimeout(t);
  }, [wrongFlash]);

  const onTermClick = (termIdx: number) => {
    if (submitted) return;
    if (attempt.matched.includes(termIdx)) return;
    if (attempt.selectedDef !== null) {
      const pairIdx = defOrder[attempt.selectedDef];
      if (termIdx === pairIdx) {
        onChange({
          matched: [...attempt.matched, termIdx],
          selectedTerm: null,
          selectedDef: null,
          wrongAttempts: attempt.wrongAttempts,
        });
      } else {
        setWrongFlash({ term: termIdx, def: attempt.selectedDef });
        onChange({
          matched: attempt.matched,
          selectedTerm: null,
          selectedDef: null,
          wrongAttempts: attempt.wrongAttempts + 1,
        });
      }
    } else {
      onChange({ ...attempt, selectedTerm: termIdx });
    }
  };

  const onDefClick = (defIdx: number) => {
    if (submitted) return;
    const pairIdx = defOrder[defIdx];
    if (attempt.matched.includes(pairIdx)) return;
    if (attempt.selectedTerm !== null) {
      if (attempt.selectedTerm === pairIdx) {
        onChange({
          matched: [...attempt.matched, pairIdx],
          selectedTerm: null,
          selectedDef: null,
          wrongAttempts: attempt.wrongAttempts,
        });
      } else {
        setWrongFlash({ term: attempt.selectedTerm, def: defIdx });
        onChange({
          matched: attempt.matched,
          selectedTerm: null,
          selectedDef: null,
          wrongAttempts: attempt.wrongAttempts + 1,
        });
      }
    } else {
      onChange({ ...attempt, selectedDef: defIdx });
    }
  };

  const classForTerm = (termIdx: number) => {
    const isMatched = attempt.matched.includes(termIdx);
    const isSelected = attempt.selectedTerm === termIdx;
    const isWrong = wrongFlash?.term === termIdx;

    if (isMatched) {
      return '[--depth-color:#16a34a] border-[#16a34a] bg-[#22c55e] text-white cursor-default';
    }
    if (isWrong) {
      return '[--depth-color:#b91c1c] border-red-700 bg-red-500 text-white';
    }
    if (isSelected) {
      return '[--depth-color:#1472FF] border-[#1472FF] bg-white dark:bg-gray-800 text-[#1472FF]';
    }
    return '[--depth-color:#e5e7eb] border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#4b4b4b] dark:text-gray-200 hover:border-[#1472FF] hover:[--depth-color:#1472FF] hover:text-[#1472FF]';
  };

  const classForDef = (defIdx: number) => {
    const pairIdx = defOrder[defIdx];
    const isMatched = attempt.matched.includes(pairIdx);
    const isSelected = attempt.selectedDef === defIdx;
    const isWrong = wrongFlash?.def === defIdx;

    if (isMatched) {
      return '[--depth-color:#16a34a] border-[#16a34a] bg-[#22c55e] text-white cursor-default';
    }
    if (isWrong) {
      return '[--depth-color:#b91c1c] border-red-700 bg-red-500 text-white';
    }
    if (isSelected) {
      return '[--depth-color:#1472FF] border-[#1472FF] bg-white dark:bg-gray-800 text-[#1472FF]';
    }
    return '[--depth-color:#e5e7eb] border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#4b4b4b] dark:text-gray-200 hover:border-[#1472FF] hover:[--depth-color:#1472FF] hover:text-[#1472FF]';
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#4b4b4b] dark:text-white text-center leading-tight">
        {step.prompt}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Terms column */}
        <div className="space-y-3">
          {step.pairs.map((pair, i) => {
            const isMatched = attempt.matched.includes(i);
            const isSelected = attempt.selectedTerm === i;
            return (
              <button
                key={`term-${i}`}
                type="button"
                aria-label={`término: ${pair.term}`}
                aria-pressed={isSelected || isMatched}
                disabled={submitted || isMatched}
                onClick={() => onTermClick(i)}
                className={`w-full rounded-xl ${depth.border} px-4 py-4 text-center text-base font-bold transition-all duration-150 [box-shadow:0_4px_0_0_var(--depth-color)] ${
                  submitted || isMatched
                    ? 'cursor-default'
                    : 'cursor-pointer active:translate-y-[2px] active:[box-shadow:0_2px_0_0_var(--depth-color)]'
                } ${classForTerm(i)}`}
              >
                {pair.term}
              </button>
            );
          })}
        </div>

        {/* Defs column (shuffled) */}
        <div className="space-y-3">
          {defOrder.map((pairIdx, defIdx) => {
            const isMatched = attempt.matched.includes(pairIdx);
            const isSelected = attempt.selectedDef === defIdx;
            return (
              <button
                key={`def-${defIdx}`}
                type="button"
                aria-label={`definición: ${step.pairs[pairIdx].def}`}
                aria-pressed={isSelected || isMatched}
                disabled={submitted || isMatched}
                onClick={() => onDefClick(defIdx)}
                className={`w-full rounded-xl ${depth.border} px-4 py-4 text-left text-sm md:text-base font-medium transition-all duration-150 [box-shadow:0_4px_0_0_var(--depth-color)] ${
                  submitted || isMatched
                    ? 'cursor-default'
                    : 'cursor-pointer active:translate-y-[2px] active:[box-shadow:0_2px_0_0_var(--depth-color)]'
                } ${classForDef(defIdx)}`}
              >
                {step.pairs[pairIdx].def}
              </button>
            );
          })}
        </div>
      </div>

      {!submitted && (
        <p className="text-center text-sm text-[#777777] dark:text-gray-400">
          toca un término y luego su definición
        </p>
      )}

      {/* Live region for screen readers on wrong pair attempts */}
      <div role="status" aria-live="polite" className="sr-only">
        {wrongFlash ? 'emparejamiento incorrecto, intenta otra vez.' : ''}
      </div>

      {submitted && (
        <p className="text-center text-sm text-[#777777] dark:text-gray-400">
          {step.explanation}
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
      aria-label={`racha de ${count} aciertos seguidos`}
    >
      <span className="text-lg leading-none" aria-hidden="true">
        🔥
      </span>
      <span className="text-sm font-bold tabular-nums">x{count}</span>
    </div>
  );
}

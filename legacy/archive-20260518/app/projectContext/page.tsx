'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import OnboardingNavbar from '@/components/onboarding/OnboardingNavbar';
import Button from '@/components/ui/Button';
import { Spinner } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { upsertIntakeDraft, loadLatestDraftForRehydrate } from '@/lib/onboarding/persistIntake';

// 5 preguntas reemplazan las 20 anteriores. Las 20 originales estaban
// calibradas para founders (sales experience, pricing, launches, etc) y
// no aplican al mercado real de Itera (LATAM no-técnico, mayormente
// empleados que quieren no quedarse fuera de la curva IA). Estas 5
// cubren los ejes que el LLM realmente necesita para personalizar:
// contexto, tiempo disponible, familiaridad con IA, nivel técnico,
// objetivo. El resto la IA lo infiere del prompt del usuario.
const sections = [
  {
    id: 'context',
    name: 'tu contexto',
    questions: [
      {
        id: 'context',
        question: '¿esto es para tu trabajo o un proyecto personal?',
        labels: [
          'solo quiero aprender',
          'trabajo en una empresa',
          'freelance / consultoría',
          'mi propio negocio activo',
          'estoy lanzando algo nuevo',
        ],
      },
      {
        id: 'time_available',
        question: '¿cuánto tiempo a la semana puedes dedicar?',
        labels: ['1-2 horas', '3-5 horas', '5-10 horas', '10-15 horas', '+15 horas'],
      },
    ],
  },
  {
    id: 'level_goal',
    name: 'tu nivel y objetivo',
    questions: [
      {
        id: 'ai_familiarity',
        question: '¿qué tan familiarizado estás con chatgpt, claude o herramientas similares?',
        labels: [
          'nunca las he usado',
          'las he probado',
          'uso ocasional',
          'uso frecuente',
          'uso avanzado diario',
        ],
      },
      {
        id: 'technical_level',
        question: '¿cuál es tu nivel técnico?',
        labels: [
          'nada técnico',
          'hojas de cálculo / no-code',
          'scripts básicos',
          'programo seguido',
          'desarrollo profesional',
        ],
      },
      {
        id: 'goal',
        question: '¿qué quieres lograr en los próximos 3 meses?',
        labels: [
          'explorar y entender qué es ia',
          'automatizar tareas de mi trabajo',
          'construir un proyecto / herramienta',
          'lanzar un producto',
          'escalar algo que ya tengo',
        ],
      },
    ],
  },
];

// Flatten questions for easy indexing
const allQuestions = sections.flatMap(section => 
  section.questions.map(q => ({ ...q, sectionId: section.id, sectionName: section.name }))
);

// Helper to get section index from question index
const getSectionIndex = (questionIndex: number): number => {
  let count = 0;
  for (let i = 0; i < sections.length; i++) {
    count += sections[i].questions.length;
    if (questionIndex < count) return i;
  }
  return sections.length - 1;
};

// Helper to get question index within its section
const getQuestionIndexInSection = (questionIndex: number): number => {
  let count = 0;
  for (let i = 0; i < sections.length; i++) {
    if (questionIndex < count + sections[i].questions.length) {
      return questionIndex - count;
    }
    count += sections[i].questions.length;
  }
  return 0;
};

interface QuestionResponse {
  question: string;
  value: number;
  label: string;
  section: string;
}

export default function ProjectContextPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isRehydrating, setIsRehydrating] = useState(true);
  const router = useRouter();

  // Check if project idea exists. Si se perdió sessionStorage (recarga,
  // cambio de tab) pero hay draft activo en DB, rehidratamos desde ahí antes
  // de rebotar al paso anterior.
  useEffect(() => {
    let cancelled = false;
    const ensure = async () => {
      if (sessionStorage.getItem('projectIdea')) {
        setIsRehydrating(false);
        return;
      }

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/auth/login?redirectedFrom=/projectContext');
        return;
      }
      const draft = await loadLatestDraftForRehydrate(supabase, user.id);
      if (cancelled) return;

      if (!draft?.projectIdea) {
        router.replace('/projectDescription');
        return;
      }

      sessionStorage.setItem('intakeResponseId', draft.id);
      sessionStorage.setItem('projectIdea', draft.projectIdea);
      if (draft.courseMode === 'full') sessionStorage.setItem('courseMode', 'full');
      else sessionStorage.removeItem('courseMode');

      if (draft.questionnaire) {
        sessionStorage.setItem(
          'projectContext',
          JSON.stringify(draft.questionnaire)
        );
        const hydrated: Record<string, number> = {};
        for (const [key, value] of Object.entries(draft.questionnaire)) {
          if (
            value &&
            typeof value === 'object' &&
            'value' in value &&
            typeof (value as { value: unknown }).value === 'number'
          ) {
            hydrated[key] = (value as { value: number }).value;
          }
        }
        if (Object.keys(hydrated).length > 0) setAnswers(hydrated);
      }

      setIsRehydrating(false);
    };
    void ensure();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const currentQuestion = allQuestions[currentIndex];
  const currentSectionIndex = getSectionIndex(currentIndex);
  const currentSection = sections[currentSectionIndex];
  const questionIndexInSection = getQuestionIndexInSection(currentIndex);
  const currentValue = answers[currentQuestion.id] ?? 3; // Default to middle

  const handleSliderChange = (value: number) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = () => {
    // Save current answer if not already saved
    if (answers[currentQuestion.id] === undefined) {
      setAnswers(prev => ({ ...prev, [currentQuestion.id]: 3 }));
    }

    if (currentIndex < allQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      finishQuestionnaire();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      router.back();
    }
  };

  const persistAndGoToPaywall = async (
    responses: Record<string, QuestionResponse>
  ) => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login?redirectedFrom=/projectContext');
        return;
      }

      const existingId = sessionStorage.getItem('intakeResponseId') || undefined;
      const result = await upsertIntakeDraft(
        supabase,
        user.id,
        { questionnaire: responses, step: 'questionnaire_complete' },
        existingId
      );

      if ('error' in result) {
        setSaveError('No pudimos guardar tus respuestas. Intenta de nuevo.');
        setIsSaving(false);
        return;
      }

      sessionStorage.setItem('intakeResponseId', result.id);
      sessionStorage.setItem('projectContext', JSON.stringify(responses));
      router.push('/paywall');
    } catch {
      setSaveError('Error inesperado. Intenta de nuevo.');
      setIsSaving(false);
    }
  };

  const finishQuestionnaire = () => {
    // Build responses with full context
    const responses: Record<string, QuestionResponse> = {};

    allQuestions.forEach(q => {
      const value = answers[q.id] ?? 3;
      responses[q.id] = {
        question: q.question,
        value: value,
        label: q.labels[value - 1],
        section: q.sectionName,
      };
    });

    void persistAndGoToPaywall(responses);
  };

  const handleSkip = () => {
    // Persistimos lo que haya (aunque sea parcial) para no perderlo.
    const responses: Record<string, QuestionResponse> = {};
    allQuestions.forEach(q => {
      const value = answers[q.id];
      if (value === undefined) return;
      responses[q.id] = {
        question: q.question,
        value,
        label: q.labels[value - 1],
        section: q.sectionName,
      };
    });
    void persistAndGoToPaywall(responses);
  };

  const progress = ((currentIndex + 1) / allQuestions.length) * 100;
  const currentLabel = currentQuestion.labels[currentValue - 1];
  
  // Calculate starting index for each section
  const getSectionStartIndex = (sectionIdx: number): number => {
    let start = 0;
    for (let i = 0; i < sectionIdx; i++) {
      start += sections[i].questions.length;
    }
    return start;
  };

  if (isRehydrating) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-800 flex flex-col">
        <OnboardingNavbar />
        <main className="flex-1 flex items-center justify-center">
          <Spinner />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-800 flex flex-col">
      <OnboardingNavbar />

      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-12">
        <div className="w-full max-w-2xl mx-auto">
          {saveError && (
            <div className="mb-6 mx-auto max-w-md p-3 bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-800 rounded-2xl text-center">
              <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                {saveError}
              </p>
            </div>
          )}
          {/* Section Name - Always visible at top */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSection.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="text-center mb-4"
            >
              <h2 className="text-2xl md:text-3xl font-extrabold text-ink dark:text-white tracking-tight lowercase">
                {currentSection.name.toLowerCase()}
              </h2>
            </motion.div>
          </AnimatePresence>

          {/* Progress counter */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="text-sm text-ink-muted dark:text-gray-500">
              {currentIndex + 1} de {allQuestions.length} para personalizar tu curso
            </span>
            <span className="text-sm text-gray-300 dark:text-gray-600">•</span>
            <span className="text-sm text-ink-muted dark:text-gray-500">
              ~{Math.ceil((allQuestions.length - currentIndex) * 0.2)} min
            </span>
          </div>

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="mb-12"
            >
              <h2 className="text-xl md:text-2xl font-bold text-ink dark:text-white text-center mb-10 leading-relaxed">
                {currentQuestion.question}
              </h2>
              
              {/* Slider Container */}
              <div className="max-w-md mx-auto px-4">
                {/* Labels - extremes only */}
                <div className="flex justify-between mb-4">
                  <span className="text-xs text-ink-muted dark:text-gray-500 max-w-[120px] text-left leading-tight">
                    {currentQuestion.labels[0]}
                  </span>
                  <span className="text-xs text-ink-muted dark:text-gray-500 max-w-[120px] text-right leading-tight">
                    {currentQuestion.labels[4]}
                  </span>
                </div>

                {/* Slider Track with depth effect */}
                <div className="relative h-12 flex items-center">
                  {/* Background Track with depth */}
                  <div
                    className="absolute w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full"
                    style={{ boxShadow: '0 2px 0 0 #d1d5db' }}
                  />

                  {/* Filled Track */}
                  <div
                    className="absolute h-3 bg-primary rounded-full transition-all duration-150"
                    style={{
                      width: `${((currentValue - 1) / 4) * 100}%`,
                      boxShadow: '0 2px 0 0 #0E5FCC'
                    }}
                  />

                  {/* Step Markers with depth effect */}
                  <div className="absolute w-full flex justify-between px-0">
                    {[1, 2, 3, 4, 5].map((step) => (
                      <button
                        key={step}
                        onClick={() => handleSliderChange(step)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                          currentValue === step
                            ? 'bg-primary text-white scale-110 shadow-[0_3px_0_0_#0E5FCC]'
                            : currentValue > step
                              ? 'bg-primary text-white shadow-[0_3px_0_0_#0E5FCC]'
                              : 'bg-gray-200 dark:bg-gray-700 text-ink-muted dark:text-gray-400 shadow-[0_3px_0_0_#d1d5db] dark:shadow-[0_3px_0_0_#374151] hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        {step}
                      </button>
                    ))}
                  </div>

                  {/* Hidden Range Input for dragging */}
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={currentValue}
                    onChange={(e) => handleSliderChange(parseInt(e.target.value))}
                    onMouseDown={() => setIsDragging(true)}
                    onMouseUp={() => setIsDragging(false)}
                    onTouchStart={() => setIsDragging(true)}
                    onTouchEnd={() => setIsDragging(false)}
                    className="absolute w-full h-12 opacity-0 cursor-pointer z-10"
                  />
                </div>

                {/* Current Value Label - now shows the actual label for the value */}
                <div className="text-center mt-8">
                  <span className={`inline-block px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                    isDragging
                      ? 'bg-primary text-white shadow-[0_3px_0_0_#0E5FCC]'
                      : 'bg-gray-100 dark:bg-gray-800 text-ink dark:text-gray-300 shadow-[0_3px_0_0_#d1d5db] dark:shadow-[0_3px_0_0_#111827]'
                  }`}>
                    {currentLabel}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              size="lg"
              rounded2xl
              onClick={handlePrevious}
              className="flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
              </svg>
              Anterior
            </Button>

            <Button
              variant="primary"
              size="lg"
              rounded2xl
              onClick={handleNext}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              {isSaving
                ? 'Guardando…'
                : currentIndex === allQuestions.length - 1
                  ? 'Crear mi curso'
                  : 'Siguiente'}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </div>

          {/* Section-based dots indicator with depth effect */}
          <div className="flex justify-center items-center gap-3 mt-8">
            {sections.map((section, sectionIdx) => {
              const isCurrentSection = sectionIdx === currentSectionIndex;
              const sectionStartIdx = getSectionStartIndex(sectionIdx);
              const sectionAnswered = section.questions.every(q => answers[q.id] !== undefined);
              const sectionPartial = section.questions.some(q => answers[q.id] !== undefined);

              return (
                <div key={section.id} className="flex items-center gap-1">
                  {isCurrentSection ? (
                    // Expanded view for current section
                    section.questions.map((q, qIdx) => {
                      const globalIdx = sectionStartIdx + qIdx;
                      const isCurrentQuestion = globalIdx === currentIndex;
                      const isAnswered = answers[q.id] !== undefined;

                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrentIndex(globalIdx)}
                          className={`h-3 rounded-full transition-all duration-300 ${
                            isCurrentQuestion
                              ? 'w-8 bg-primary shadow-[0_2px_0_0_#0E5FCC]'
                              : isAnswered
                                ? 'w-3 bg-primary shadow-[0_2px_0_0_#0E5FCC]'
                                : 'w-3 bg-gray-200 dark:bg-gray-700 shadow-[0_2px_0_0_#d1d5db] dark:shadow-[0_2px_0_0_#374151] hover:bg-gray-300'
                          }`}
                        />
                      );
                    })
                  ) : (
                    // Collapsed view for other sections
                    <button
                      onClick={() => setCurrentIndex(sectionStartIdx)}
                      className={`h-3 rounded-full transition-all duration-300 ${
                        sectionAnswered
                          ? 'w-4 bg-green-500 shadow-[0_2px_0_0_#16a34a]'
                          : sectionPartial
                            ? 'w-4 bg-primary/50 shadow-[0_2px_0_0_#0E5FCC]/50'
                            : 'w-4 bg-gray-200 dark:bg-gray-700 shadow-[0_2px_0_0_#d1d5db] dark:shadow-[0_2px_0_0_#374151] hover:bg-gray-300'
                      }`}
                      title={section.name}
                    />
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </main>
    </div>
  );
}

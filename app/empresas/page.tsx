'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import OnboardingNavbar from '@/components/onboarding/OnboardingNavbar';
import Button from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { createClient } from '@/lib/supabase/client';

// 12 preguntas, 3 secciones de 4. Mismo formato que /projectContext pero
// reframeadas a B2B: contexto de empresa, necesidad, forma del programa.
// Standalone — no toca Supabase, no persiste, no rutea a paywall.
const sections = [
  {
    id: 'company',
    name: 'tu empresa',
    questions: [
      {
        id: 'team_size',
        question: '¿De qué tamaño es tu equipo o empresa?',
        labels: ['1-10', '11-50', '51-200', '201-1000', '+1000'],
      },
      {
        id: 'function',
        question: '¿Desde qué área llegas a Itera?',
        labels: ['operaciones', 'ventas', 'marketing', 'producto / tech', 'rrhh / l&d'],
      },
      {
        id: 'ai_adoption',
        question: '¿Qué tan adoptada está la ia en tu equipo hoy?',
        labels: ['nadie la usa', 'usuarios aislados', 'algunos equipos', 'mayoría experimenta', 'en producción'],
      },
      {
        id: 'decision_maker',
        question: '¿Quién decide la compra de capacitación en tu empresa?',
        labels: ['yo', 'mi jefe directo', 'comité / rrhh', 'dirección general', 'aún no está claro'],
      },
    ],
  },
  {
    id: 'need',
    name: 'la necesidad',
    questions: [
      {
        id: 'urgency',
        question: '¿Qué tan crítica es la capacitación en ia este año?',
        labels: ['no prioritario', 'nice to have', 'importante', 'urgente', 'lo pidió dirección'],
      },
      {
        id: 'people_to_train',
        question: '¿A cuántas personas necesitas capacitar?',
        labels: ['1-5', '6-20', '21-50', '51-200', '+200'],
      },
      {
        id: 'timeline',
        question: '¿En cuánto tiempo necesitas resultados concretos?',
        labels: ['sin prisa', '6+ meses', '3-6 meses', '1-3 meses', 'este trimestre'],
      },
      {
        id: 'previous_attempts',
        question: '¿Han intentado capacitar a su equipo en ia antes?',
        labels: ['no hemos intentado', 'una vez, sin éxito', 'varios intentos flojos', 'tenemos algo activo pero no convence', 'queremos reemplazarlo'],
      },
    ],
  },
  {
    id: 'program',
    name: 'forma del programa',
    questions: [
      {
        id: 'team_technical',
        question: '¿Qué tan técnico es el equipo a capacitar?',
        labels: ['nada técnico', 'algunos perfiles técnicos', 'mixto', 'mayoría técnicos', 'todos ingenieros'],
      },
      {
        id: 'modality',
        question: '¿Qué modalidad les acomoda?',
        labels: ['100% asincrónico', 'asincrónico + sesiones en vivo', 'cohortes con coach', 'workshops presenciales', 'aún no sabemos'],
      },
      {
        id: 'customization',
        question: '¿Necesitan casos de uso específicos a su industria?',
        labels: ['genérico está bien', 'algunos ejemplos sectoriales', 'casos personalizados', 'casos + datos reales', 'programa hecho a medida'],
      },
      {
        id: 'reporting',
        question: '¿Qué nivel de medición de progreso necesitan?',
        labels: ['no requiere', 'reportes ocasionales', 'métricas mensuales', 'dashboard en vivo', 'integrado con su hr'],
      },
    ],
  },
];

const allQuestions = sections.flatMap((section) =>
  section.questions.map((q) => ({ ...q, sectionId: section.id, sectionName: section.name })),
);

const getSectionIndex = (questionIndex: number): number => {
  let count = 0;
  for (let i = 0; i < sections.length; i++) {
    count += sections[i].questions.length;
    if (questionIndex < count) return i;
  }
  return sections.length - 1;
};

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

const getSectionStartIndex = (sectionIdx: number): number => {
  let start = 0;
  for (let i = 0; i < sectionIdx; i++) {
    start += sections[i].questions.length;
  }
  return start;
};

interface QuestionResponse {
  question: string;
  value: number;
  label: string;
  section: string;
}

type Stage = 'questions' | 'contact' | 'done';

export default function EmpresasPage() {
  const [stage, setStage] = useState<Stage>('questions');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [contact, setContact] = useState({
    name: '',
    email: '',
    company: '',
    notes: '',
  });
  const [contactError, setContactError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Pre-fill name + email cuando el usuario llega desde el dashboard. El link
  // del sidebar pasa ?ref=dashboard, lo leemos del search param y consultamos
  // la sesión para llenar los campos. Reduce fricción en el momento dorado:
  // alguien que YA usa Itera y quiere extender al equipo. Si no hay sesión o
  // el ref no es 'dashboard', el form queda en blanco como antes.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('ref') !== 'dashboard') return;

    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (cancelled || !user) return;
        const { data: profile } = await supabase
          .from('users')
          .select('name, email')
          .eq('id', user.id)
          .maybeSingle();
        if (cancelled) return;
        const name = profile?.name || user.user_metadata?.name || '';
        const email = profile?.email || user.email || '';
        setContact((prev) => ({
          ...prev,
          name: prev.name || name,
          email: prev.email || email,
        }));
      } catch {
        // silently ignore — pre-fill es nice-to-have, no rompe el flow
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // currentIndex está acotado por handleNext (no incrementa más allá de
  // allQuestions.length - 1) y allQuestions es const al top-level, así que
  // currentQuestion nunca es undefined dentro del render del cuestionario.
  // Acceso directo (sin optional chaining) por consistencia con el resto del archivo.
  const currentQuestion = allQuestions[currentIndex];
  const currentSectionIndex = getSectionIndex(currentIndex);
  const currentSection = sections[currentSectionIndex];
  const currentValue = answers[currentQuestion.id] ?? 3;
  const currentLabel = currentQuestion.labels[currentValue - 1];

  const handleSliderChange = (value: number) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = () => {
    if (answers[currentQuestion.id] === undefined) {
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: 3 }));
    }

    if (currentIndex < allQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setStage('contact');
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      router.back();
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setContactError(null);

    if (!contact.name.trim() || !contact.email.trim() || !contact.company.trim()) {
      setContactError('por favor completa nombre, correo y empresa.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())) {
      setContactError('ese correo no se ve bien, revísalo.');
      return;
    }

    // Snapshot de las respuestas del cuestionario para enviarlas con el lead.
    // PII (nombre, correo, empresa) viaja al endpoint y se persiste detrás de
    // RLS service_role-only en `enterprise_leads`. Nunca se loguea en consola.
    const responses: Record<string, QuestionResponse> = {};
    allQuestions.forEach((q) => {
      const value = answers[q.id] ?? 3;
      responses[q.id] = {
        question: q.question,
        value,
        label: q.labels[value - 1],
        section: q.sectionName,
      };
    });

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/empresas-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contact.name.trim(),
          email: contact.email.trim(),
          company: contact.company.trim(),
          notes: contact.notes.trim() || undefined,
          questionnaire: responses,
        }),
      });

      if (!res.ok) {
        // 429 (rate limit) le da copy distinto. El resto cae al genérico.
        if (res.status === 429) {
          setContactError(
            'demasiados envíos. espera un minuto e intenta de nuevo.',
          );
        } else {
          setContactError(
            'no pudimos guardar tu solicitud. intenta de nuevo en un momento.',
          );
        }
        setIsSubmitting(false);
        return;
      }

      setStage('done');
    } catch {
      setContactError('error de conexión. revisa tu internet e intenta de nuevo.');
      setIsSubmitting(false);
    }
  };

  // ── Stage: contacto ──────────────────────────────────────────────────
  if (stage === 'contact') {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-800 flex flex-col">
        <OnboardingNavbar />
        <main className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="w-full max-w-md mx-auto"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-extrabold text-ink dark:text-white mb-3 tracking-tight lowercase">
                gracias por el contexto
              </h1>
              <p className="text-base text-ink-muted dark:text-gray-400 leading-relaxed">
                con esto armamos una propuesta a la medida de tu equipo. déjanos un
                correo y te contactamos.
              </p>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-gray-400 mb-2 block">
                  nombre
                </label>
                <Input
                  type="text"
                  value={contact.name}
                  onChange={(e) => setContact({ ...contact, name: e.target.value })}
                  placeholder="ana garcía"
                  maxLength={120}
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-gray-400 mb-2 block">
                  correo de trabajo
                </label>
                <Input
                  type="email"
                  value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                  placeholder="ana@empresa.com"
                  maxLength={254}
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-gray-400 mb-2 block">
                  empresa
                </label>
                <Input
                  type="text"
                  value={contact.company}
                  onChange={(e) => setContact({ ...contact, company: e.target.value })}
                  placeholder="acme s.a. de c.v."
                  maxLength={200}
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-gray-400 mb-2 block">
                  algo que quieras agregar (opcional)
                </label>
                <Textarea
                  value={contact.notes}
                  onChange={(e) => setContact({ ...contact, notes: e.target.value })}
                  rows={3}
                  placeholder="contexto adicional, urgencias, restricciones..."
                  maxLength={1000}
                  className="resize-none"
                />
              </div>

              {contactError && (
                <div className="flex justify-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-full">
                    <p className="text-xs text-red-700 dark:text-red-400 font-medium">
                      {contactError}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  rounded2xl
                  onClick={() => setStage('questions')}
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                  </svg>
                  atrás
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  rounded2xl
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'enviando…' : 'agendar demo'}
                </Button>
              </div>
            </form>
          </motion.div>
        </main>
      </div>
    );
  }

  // ── Stage: thank you ─────────────────────────────────────────────────
  if (stage === 'done') {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-800 flex flex-col">
        <OnboardingNavbar />
        <main className="flex-1 flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="w-full max-w-md mx-auto text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-completado flex items-center justify-center shadow-[0_4px_0_0_#16a34a]">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-ink dark:text-white mb-3 tracking-tight lowercase">
              recibido
            </h1>
            <p className="text-base text-ink-muted dark:text-gray-400 leading-relaxed mb-8">
              registramos tu interés. te escribimos al correo que dejaste en cuanto
              tengamos una propuesta concreta para tu equipo.
            </p>
            <Button
              variant="outline"
              size="lg"
              rounded2xl
              onClick={() => router.push('/')}
            >
              volver al inicio
            </Button>
          </motion.div>
        </main>
      </div>
    );
  }

  // ── Stage: cuestionario ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white dark:bg-gray-800 flex flex-col">
      <OnboardingNavbar />

      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-12">
        <div className="w-full max-w-2xl mx-auto">
          {/* Section name */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSection.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="text-center mb-4"
            >
              <h2 className="text-2xl md:text-3xl font-extrabold text-ink dark:text-white tracking-tight lowercase">
                {currentSection.name}
              </h2>
            </motion.div>
          </AnimatePresence>

          {/* Progress counter */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="text-sm text-ink-muted dark:text-gray-500">
              {currentIndex + 1} de {allQuestions.length} para diseñar tu programa
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

              {/* Slider */}
              <div className="max-w-md mx-auto px-4">
                <div className="flex justify-between mb-4">
                  <span className="text-xs text-ink-muted dark:text-gray-500 max-w-[120px] text-left leading-tight">
                    {currentQuestion.labels[0]}
                  </span>
                  <span className="text-xs text-ink-muted dark:text-gray-500 max-w-[120px] text-right leading-tight">
                    {currentQuestion.labels[4]}
                  </span>
                </div>

                <div className="relative h-12 flex items-center">
                  <div
                    className="absolute w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full"
                    style={{ boxShadow: '0 2px 0 0 #d1d5db' }}
                  />
                  <div
                    className="absolute h-3 bg-primary rounded-full transition-all duration-150"
                    style={{
                      width: `${((currentValue - 1) / 4) * 100}%`,
                      boxShadow: '0 2px 0 0 #0E5FCC',
                    }}
                  />

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

                <div className="text-center mt-8">
                  <span
                    className={`inline-block px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                      isDragging
                        ? 'bg-primary text-white shadow-[0_3px_0_0_#0E5FCC]'
                        : 'bg-gray-100 dark:bg-gray-800 text-ink dark:text-gray-300 shadow-[0_3px_0_0_#d1d5db] dark:shadow-[0_3px_0_0_#111827]'
                    }`}
                  >
                    {currentLabel}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Nav buttons */}
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
              anterior
            </Button>

            <Button
              variant="primary"
              size="lg"
              rounded2xl
              onClick={handleNext}
              className="flex items-center gap-2"
            >
              {currentIndex === allQuestions.length - 1 ? 'continuar' : 'siguiente'}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </div>

          {/* Section dots */}
          <div className="flex justify-center items-center gap-3 mt-8">
            {sections.map((section, sectionIdx) => {
              const isCurrentSection = sectionIdx === currentSectionIndex;
              const sectionStartIdx = getSectionStartIndex(sectionIdx);
              const sectionAnswered = section.questions.every((q) => answers[q.id] !== undefined);
              const sectionPartial = section.questions.some((q) => answers[q.id] !== undefined);

              return (
                <div key={section.id} className="flex items-center gap-1">
                  {isCurrentSection ? (
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
                    <button
                      onClick={() => setCurrentIndex(sectionStartIdx)}
                      className={`h-3 rounded-full transition-all duration-300 ${
                        sectionAnswered
                          ? 'w-4 bg-completado shadow-[0_2px_0_0_#16a34a]'
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

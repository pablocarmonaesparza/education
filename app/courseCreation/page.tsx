'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { loadLatestDraftForRehydrate } from '@/lib/onboarding/persistIntake';
import OnboardingNavbar from '@/components/onboarding/OnboardingNavbar';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';

const SOFT_DEADLINE_MS = 180_000; // 3 min — umbral "está tardando más de lo normal"
const HARD_DEADLINE_MS = 360_000; // 6 min — error final con retry

const ONBOARDING_SESSION_KEYS = [
  'projectIdea',
  'projectContext',
  'courseMode',
  'intakeResponseId',
  'preferredPlan',
];

function clearOnboardingSessionState() {
  if (typeof window === 'undefined') return;
  for (const key of ONBOARDING_SESSION_KEYS) sessionStorage.removeItem(key);
}

type PhaseLabel =
  | 'Analizando tu proyecto'
  | 'Buscando contenido relevante'
  | 'Seleccionando módulos'
  | 'Personalizando tu ruta'
  | 'Finalizando';

export default function CourseCreationPage() {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>(
    'Nuestra IA está diseñando tu ruta de aprendizaje'
  );
  const [runToken, setRunToken] = useState(0); // bump para reintentar
  const router = useRouter();
  const hasStartedRef = useRef(false);

  const startGeneration = useCallback(async () => {
    const supabase = createClient();

    // Rehidratar sessionStorage desde DB si el user entra aquí tras una
    // recarga / cambio de tab. Si ya hay generated_path en el último intake,
    // no reempezamos: vamos directo al dashboard.
    if (!sessionStorage.getItem('projectIdea')) {
      const { data: { user: sessionUser } } = await supabase.auth.getUser();
      if (!sessionUser) {
        router.push('/auth/login?redirectedFrom=/courseCreation');
        return () => {};
      }

      const { data: lastIntake } = await supabase
        .from('intake_responses')
        .select('generated_path')
        .eq('user_id', sessionUser.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      const gp = (lastIntake?.generated_path as { _error?: boolean } | null) || null;
      if (gp && !gp._error) {
        router.replace('/dashboard');
        return () => {};
      }

      const draft = await loadLatestDraftForRehydrate(supabase, sessionUser.id);
      if (!draft?.projectIdea) {
        router.push('/projectDescription');
        return () => {};
      }

      // El full course salta la encuesta por diseño. Para el modo personalized
      // exigimos questionnaire completo: si no está, mandamos a /projectContext
      // para que el user complete antes de disparar la generación.
      if (
        draft.courseMode !== 'full' &&
        draft.step !== 'questionnaire_complete'
      ) {
        sessionStorage.setItem('intakeResponseId', draft.id);
        sessionStorage.setItem('projectIdea', draft.projectIdea);
        sessionStorage.removeItem('courseMode');
        router.replace('/projectContext');
        return () => {};
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
      }
    }

    const projectIdea = sessionStorage.getItem('projectIdea');
    const courseMode = sessionStorage.getItem('courseMode');
    const isFullCourse = courseMode === 'full';

    if (!projectIdea && !isFullCourse) {
      router.push('/projectDescription');
      return () => {};
    }

    let progressInterval: ReturnType<typeof setInterval> | null = null;
    let pollInterval: ReturnType<typeof setInterval> | null = null;
    let softTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let hardTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let aborted = false;

    const cleanup = () => {
      aborted = true;
      if (progressInterval) clearInterval(progressInterval);
      if (pollInterval) clearInterval(pollInterval);
      if (softTimeoutId) clearTimeout(softTimeoutId);
      if (hardTimeoutId) clearTimeout(hardTimeoutId);
    };

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login?redirectedFrom=/courseCreation');
        return cleanup;
      }

      // Si venimos de un error anterior, limpiamos el _error del draft antes
      // de reintentar para que el polling no lo detecte como fallo viejo.
      await supabase
        .from('intake_responses')
        .update({ generated_path: null })
        .eq('user_id', user.id)
        .not('generated_path', 'is', null)
        .filter('generated_path->_error', 'eq', true);

      const projectContextRaw = sessionStorage.getItem('projectContext');
      const questionnaireAnswers = projectContextRaw
        ? JSON.parse(projectContextRaw)
        : {};

      // Ruta "curso completo": request síncrono al endpoint full.
      if (isFullCourse) {
        const abortController = new AbortController();
        const fetchTimeout = setTimeout(() => abortController.abort(), 30000);
        const fullResponse = await fetch('/api/generate-course-full', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: abortController.signal,
          body: JSON.stringify({
            user_id: user.id,
            user_email: user.email,
            user_name: user.user_metadata?.name || 'Usuario',
            timestamp: new Date().toISOString(),
          }),
        });
        clearTimeout(fetchTimeout);

        if (!fullResponse.ok) {
          const errorData = await fullResponse.json().catch(() => ({}));
          throw new Error(errorData?.error || 'Error al preparar el curso completo');
        }

        let fullProgress = 0;
        progressInterval = setInterval(() => {
          if (aborted) return;
          fullProgress = Math.min(fullProgress + 8, 100);
          setProgress(fullProgress);
          if (fullProgress >= 100 && progressInterval) {
            clearInterval(progressInterval);
            clearOnboardingSessionState();
            setTimeout(() => router.push('/dashboard'), 400);
          }
        }, 60);
        return cleanup;
      }

      // Ruta personalizada: dispara job async + polling.
      const response = await fetch('/api/generate-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          user_email: user.email,
          user_name: user.user_metadata?.name || 'Usuario',
          project_idea: projectIdea,
          questionnaire: questionnaireAnswers,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error || 'Error al generar el curso');
      }

      // Progreso simulado — sube hasta 85% y se queda ahí hasta que el poll
      // confirma. Al confirmar saltamos a 100%.
      let progressValue = 0;
      progressInterval = setInterval(() => {
        if (aborted) return;
        progressValue = Math.min(progressValue + 1.1, 85);
        setProgress(Math.round(progressValue));
        if (progressValue >= 85 && progressInterval) {
          clearInterval(progressInterval);
        }
      }, 2000);

      const checkCompletion = async (): Promise<'done' | 'error' | 'pending'> => {
        const { data } = await supabase
          .from('intake_responses')
          .select('generated_path')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (!data || !data.generated_path) return 'pending';
        if ((data.generated_path as { _error?: boolean })._error) return 'error';
        return 'done';
      };

      pollInterval = setInterval(async () => {
        if (aborted) return;
        const status = await checkCompletion();
        if (status === 'done') {
          cleanup();
          setProgress(100);
          clearOnboardingSessionState();
          setTimeout(() => router.push('/dashboard'), 1000);
        } else if (status === 'error') {
          cleanup();
          setError(
            'Nuestro generador tuvo un problema. Reintenta en un momento.'
          );
        }
      }, 3000);

      softTimeoutId = setTimeout(() => {
        if (aborted) return;
        setStatusMessage(
          'Está tardando un poco más de lo normal. Seguimos trabajando, no cierres la página.'
        );
      }, SOFT_DEADLINE_MS);

      hardTimeoutId = setTimeout(() => {
        if (aborted) return;
        cleanup();
        setError(
          'La generación se tardó demasiado. Probablemente fue una sobrecarga temporal — reintenta.'
        );
      }, HARD_DEADLINE_MS);
    } catch (err: unknown) {
      cleanup();
      const message =
        err instanceof Error ? err.message : 'Ocurrió un error. Intenta de nuevo.';
      setError(message);
    }

    return cleanup;
  }, [router]);

  useEffect(() => {
    if (hasStartedRef.current && runToken === 0) return;
    hasStartedRef.current = true;

    let cleanupFn: (() => void) | undefined;
    let mounted = true;

    startGeneration().then((cleanup) => {
      if (!mounted && cleanup) cleanup();
      else cleanupFn = cleanup;
    });

    return () => {
      mounted = false;
      if (cleanupFn) cleanupFn();
    };
  }, [startGeneration, runToken]);

  const handleRetry = () => {
    setError(null);
    setProgress(0);
    setStatusMessage('Nuestra IA está diseñando tu ruta de aprendizaje');
    setRunToken((n) => n + 1);
  };

  const phases: Array<{ threshold: number; label: PhaseLabel }> = [
    { threshold: 20, label: 'Analizando tu proyecto' },
    { threshold: 40, label: 'Buscando contenido relevante' },
    { threshold: 60, label: 'Seleccionando módulos' },
    { threshold: 80, label: 'Personalizando tu ruta' },
    { threshold: 95, label: 'Finalizando' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-800 flex flex-col">
      <OnboardingNavbar />

      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-12">
        <div className="w-full max-w-lg mx-auto text-center">
          {error ? (
            <div
              className="rounded-2xl"
              style={{ boxShadow: '0 4px 0 0 #fca5a5' }}
            >
              <div className="bg-red-50 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700 rounded-2xl p-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-100 dark:bg-red-900/50 flex items-center justify-center shadow-[0_3px_0_0_#fca5a5]">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-extrabold text-ink dark:text-white mb-2 lowercase">
                  algo salió mal
                </h2>
                <p className="text-ink-muted dark:text-gray-400 mb-6">{error}</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button
                    variant="primary"
                    size="lg"
                    rounded2xl
                    onClick={handleRetry}
                  >
                    Reintentar
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    rounded2xl
                    onClick={() => router.push('/projectDescription')}
                  >
                    Cambiar mi idea
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div
                  className="absolute inset-0 bg-primary rounded-2xl animate-pulse"
                  style={{ boxShadow: '0 4px 0 0 #0E5FCC' }}
                />
                <div className="absolute inset-2 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center">
                  <span className="text-4xl animate-bounce">🤖</span>
                </div>
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold text-ink dark:text-white mb-3 tracking-tight lowercase">
                creando tu curso personalizado
              </h1>
              <p className="text-ink-muted dark:text-gray-400 mb-10">
                {statusMessage}
              </p>

              <div className="mb-10">
                <ProgressBar
                  value={progress}
                  size="lg"
                  color="primary"
                  durationMs={500}
                />
                <p className="text-sm font-bold text-primary mt-3">{progress}%</p>
              </div>

              <div className="space-y-4 text-left max-w-sm mx-auto">
                {phases.map((step) => (
                  <div
                    key={step.threshold}
                    className={`flex items-center gap-3 transition-opacity duration-300 ${
                      progress >= step.threshold ? 'opacity-100' : 'opacity-30'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold transition-all ${
                        progress >= step.threshold
                          ? 'bg-green-500 shadow-[0_2px_0_0_#16a34a]'
                          : 'bg-gray-200 dark:bg-gray-700 shadow-[0_2px_0_0_#d1d5db] dark:shadow-[0_2px_0_0_#374151]'
                      }`}
                    >
                      {progress >= step.threshold ? '✓' : ''}
                    </div>
                    <span className="text-sm text-ink dark:text-gray-300 font-medium">
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-ink-muted dark:text-gray-500 mt-10">
                Esto puede tomar 2-3 minutos. No cierres esta página.
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

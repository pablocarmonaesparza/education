'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import OnboardingNavbar from '@/components/onboarding/OnboardingNavbar';

export default function CourseCreationPage() {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const startCourseGeneration = async () => {
      // Get project idea from sessionStorage
      const projectIdea = sessionStorage.getItem('projectIdea');
      
      if (!projectIdea) {
        router.push('/projectDescription');
        return;
      }

      let progressInterval: NodeJS.Timeout | null = null;
      let pollInterval: NodeJS.Timeout | null = null;
      let timeoutId: NodeJS.Timeout | null = null;

      const cleanup = () => {
        if (progressInterval) clearInterval(progressInterval);
        if (pollInterval) clearInterval(pollInterval);
        if (timeoutId) clearTimeout(timeoutId);
      };

      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push('/auth/login');
          return;
        }

        // Get questionnaire answers from sessionStorage
        const projectContextRaw = sessionStorage.getItem('projectContext');
        const questionnaireAnswers = projectContextRaw ? JSON.parse(projectContextRaw) : {};

        // Start course generation
        const response = await fetch('/api/generate-course', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
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

        // Simulated progress
        let progressValue = 0;
        progressInterval = setInterval(() => {
          progressValue = Math.min(progressValue + 1.1, 85);
          setProgress(Math.round(progressValue));
          
          if (progressValue >= 85 && progressInterval) {
            clearInterval(progressInterval);
          }
        }, 2000);

        // Check completion
        const checkCompletion = async (): Promise<boolean> => {
          const { data } = await supabase
            .from('intake_responses')
            .select('generated_path')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          return !!(data && data.generated_path);
        };

        pollInterval = setInterval(async () => {
          const completed = await checkCompletion();

          if (completed) {
            cleanup();
            setProgress(100);
            sessionStorage.removeItem('projectIdea');

            setTimeout(() => {
              router.push('/dashboard');
            }, 1000);
          }
        }, 3000);

        timeoutId = setTimeout(() => {
          cleanup();
          setError('La generación está tomando más tiempo del esperado. Por favor recarga la página.');
        }, 240000);

      } catch (err: any) {
        cleanup();
        setError(err.message || 'Ocurrió un error. Intenta de nuevo.');
      }
    };

    startCourseGeneration();
  }, [router, supabase]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      <OnboardingNavbar />

      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-12">
        <div className="w-full max-w-lg mx-auto text-center">
          {error ? (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl p-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Algo salió mal</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
              <button
                onClick={() => router.push('/projectDescription')}
                className="px-6 py-3 rounded-full font-semibold text-sm text-white bg-gradient-to-r from-[#1472FF] to-[#5BA0FF] hover:from-[#0E5FCC] hover:to-[#1472FF] transition-all"
              >
                Intentar de nuevo
              </button>
            </div>
          ) : (
            <>
              {/* Animated Icon */}
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-[#1472FF] to-[#5BA0FF] rounded-full animate-pulse"></div>
                <div className="absolute inset-2 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center">
                  <span className="text-4xl animate-bounce">🤖</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Creando tu curso personalizado
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-10">
                Nuestra IA está diseñando tu ruta de aprendizaje
              </p>

              {/* Progress Bar */}
              <div className="mb-10">
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#1472FF] to-[#5BA0FF] h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm font-medium text-[#1472FF] mt-3">{progress}%</p>
              </div>

              {/* Loading Steps */}
              <div className="space-y-4 text-left max-w-sm mx-auto">
                {[
                  { threshold: 20, label: 'Analizando tu proyecto' },
                  { threshold: 40, label: 'Buscando contenido relevante' },
                  { threshold: 60, label: 'Seleccionando módulos' },
                  { threshold: 80, label: 'Personalizando tu ruta' },
                  { threshold: 95, label: 'Finalizando' },
                ].map((step) => (
                  <div
                    key={step.threshold}
                    className={`flex items-center gap-3 transition-opacity duration-300 ${
                      progress >= step.threshold ? 'opacity-100' : 'opacity-30'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${
                      progress >= step.threshold ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'
                    }`}>
                      {progress >= step.threshold ? '✓' : ''}
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{step.label}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-400 dark:text-gray-500 mt-10">
                Esto puede tomar 2-3 minutos. No cierres esta página.
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}


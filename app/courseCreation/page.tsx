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
            <div
              className="rounded-2xl"
              style={{ boxShadow: '0 4px 0 0 #fca5a5' }}
            >
              <div className="bg-red-50 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700 rounded-2xl p-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-100 dark:bg-red-900/50 flex items-center justify-center shadow-[0_3px_0_0_#fca5a5]">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-xl font-extrabold text-[#4b4b4b] dark:text-white mb-2 lowercase">algo salió mal</h2>
                <p className="text-[#777777] dark:text-gray-400 mb-6">{error}</p>
                <button
                  onClick={() => router.push('/projectDescription')}
                  className="px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-wide text-white bg-[#1472FF] border-b-4 border-[#0E5FCC] hover:bg-[#1265e0] active:border-b-0 active:mt-1 transition-all duration-150"
                >
                  Intentar de nuevo
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Animated Icon with depth */}
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div
                  className="absolute inset-0 bg-[#1472FF] rounded-2xl animate-pulse"
                  style={{ boxShadow: '0 4px 0 0 #0E5FCC' }}
                />
                <div className="absolute inset-2 bg-white dark:bg-gray-950 rounded-xl flex items-center justify-center">
                  <span className="text-4xl animate-bounce">🤖</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#4b4b4b] dark:text-white mb-3 tracking-tight lowercase">
                creando tu curso personalizado
              </h1>
              <p className="text-[#777777] dark:text-gray-400 mb-10">
                Nuestra IA está diseñando tu ruta de aprendizaje
              </p>

              {/* Progress Bar with depth effect */}
              <div className="mb-10">
                <div
                  className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden"
                  style={{ boxShadow: '0 3px 0 0 #d1d5db' }}
                >
                  <div
                    className="bg-[#1472FF] h-4 rounded-xl transition-all duration-500 ease-out"
                    style={{
                      width: `${progress}%`,
                      boxShadow: progress > 0 ? '0 3px 0 0 #0E5FCC' : 'none',
                      borderRadius: progress >= 100 ? '0.75rem' : '0.75rem 0 0 0.75rem'
                    }}
                  />
                </div>
                <p className="text-sm font-bold text-[#1472FF] mt-3">{progress}%</p>
              </div>

              {/* Loading Steps with depth effect */}
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
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold transition-all ${
                      progress >= step.threshold
                        ? 'bg-green-500 shadow-[0_2px_0_0_#16a34a]'
                        : 'bg-gray-200 dark:bg-gray-700 shadow-[0_2px_0_0_#d1d5db] dark:shadow-[0_2px_0_0_#374151]'
                    }`}>
                      {progress >= step.threshold ? '✓' : ''}
                    </div>
                    <span className="text-sm text-[#4b4b4b] dark:text-gray-300 font-medium">{step.label}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-[#777777] dark:text-gray-500 mt-10">
                Esto puede tomar 2-3 minutos. No cierres esta página.
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}


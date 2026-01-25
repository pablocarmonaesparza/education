'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import OnboardingNavbar from '@/components/onboarding/OnboardingNavbar';

export default function IntakePage() {
  const [projectIdea, setProjectIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleCreateCourse = async () => {
    if (!projectIdea.trim() || projectIdea.trim().length < 100) {
      setError('Por favor describe tu idea con al menos 100 caracteres antes de continuar');
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0);

    let progressInterval: NodeJS.Timeout | null = null;
    let pollInterval: NodeJS.Timeout | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    const cleanup = () => {
      if (progressInterval) clearInterval(progressInterval);
      if (pollInterval) clearInterval(pollInterval);
      if (timeoutId) clearTimeout(timeoutId);
      progressInterval = null;
      pollInterval = null;
      timeoutId = null;
    };

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('No estás autenticado');
      }

      console.log('Starting course generation...');

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
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Error al iniciar la generación del curso.';
        
        try {
          const errorData = await response.json();
          console.error('Error starting generation:', errorData);
          
          if (errorData?.error) {
            errorMessage = errorData.error;
          } else if (errorData?.message) {
            errorMessage = errorData.message;
          } else if (typeof errorData === 'string') {
            errorMessage = errorData;
          } else if (response.status === 401) {
            errorMessage = 'No estás autenticado. Por favor inicia sesión.';
          } else if (response.status === 403) {
            errorMessage = 'No tienes permiso para realizar esta acción.';
          } else if (response.status === 500) {
            errorMessage = 'Error en el servidor. Por favor intenta de nuevo.';
          }
        } catch (jsonError) {
          console.error('Error parsing error response:', jsonError);
          errorMessage = response.statusText || `Error ${response.status}: No se pudo obtener más información.`;
        }
        
        cleanup();
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Generation started:', result);

      let progressValue = 0;
      progressInterval = setInterval(() => {
        progressValue = Math.min(progressValue + 1.1, 85);
        setProgress(Math.round(progressValue));
        
        if (progressValue >= 85) {
          if (progressInterval) clearInterval(progressInterval);
          progressInterval = null;
        }
      }, 2000);

      const checkCompletion = async (): Promise<{ completed: boolean; error?: string }> => {
        try {
          const { data, error } = await supabase
            .from('intake_responses')
            .select('generated_path, responses')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (error && error.code !== 'PGRST116') {
            console.error('Error checking completion:', error);
            return { completed: false, error: 'Error al verificar el progreso' };
          }

          if (data && data.generated_path) {
            console.log('Course generation completed!');
            return { completed: true };
          }

          if (data && !data.generated_path) {
            console.log('Still processing...');
            return { completed: false };
          }

          return { completed: false };
        } catch (err: any) {
          console.error('Error in checkCompletion:', err);
          return { completed: false, error: err.message };
        }
      };

      pollInterval = setInterval(async () => {
        const result = await checkCompletion();

        if (result.error) {
          cleanup();
          setError(result.error);
          setLoading(false);
          setProgress(0);
          return;
        }

        if (result.completed) {
          cleanup();
          setProgress(100);

          setTimeout(() => {
            router.push('/dashboard');
            router.refresh();
          }, 1000);
        }
      }, 3000);

      timeoutId = setTimeout(() => {
        cleanup();
        setError('La generación está tomando más tiempo del esperado. Por favor recarga la página.');
        setLoading(false);
        setProgress(0);
      }, 240000);

    } catch (err: any) {
      cleanup();
      setError(err.message || 'Ocurrió un error al crear tu curso. Intenta de nuevo.');
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <OnboardingNavbar />

      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-12">
        <div className="w-full max-w-2xl mx-auto">
        {!loading ? (
          <>
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#4b4b4b] dark:text-white mb-4 tracking-tight">
                qué quieres construir
              </h1>
              <p className="text-lg text-[#777777] dark:text-gray-400 max-w-lg mx-auto">
                Describe tu idea y crearemos tu curso personalizado.
              </p>
            </div>

            <div className="mb-8">
              <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-950 hover:border-gray-300 dark:hover:border-gray-600 focus-within:border-[#1472FF] transition-all duration-300">
                  <label className="block text-sm font-bold text-[#4b4b4b] dark:text-white mb-2">
                    Cuéntanos sobre tu proyecto
                  </label>

                  <textarea
                    value={projectIdea}
                    onChange={(e) => {
                      setProjectIdea(e.target.value);
                      setError(null);
                    }}
                    placeholder="Ejemplo: Quiero crear un chatbot para atención al cliente que integre con WhatsApp y use IA para dar respuestas inteligentes a las preguntas más comunes..."
                    rows={4}
                    className="w-full min-h-[80px] bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none font-light leading-relaxed"
                  />

                  {error && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-xs text-red-700 font-medium">{error}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                    <p className={`text-sm font-medium ${
                      projectIdea.length >= 100
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}>
                      {projectIdea.length > 0 
                        ? projectIdea.length < 100
                          ? `${projectIdea.length} / 100 caracteres (mínimo)`
                          : `${projectIdea.length} caracteres ✓`
                        : "Mínimo 100 caracteres"}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>IA analizará tu proyecto</span>
                    </div>
                  </div>
                </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleCreateCourse}
                disabled={!projectIdea.trim() || projectIdea.trim().length < 100}
                className="px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wide text-white bg-[#1472FF] border-b-4 border-[#0E5FCC] hover:bg-[#1265e0] active:border-b-0 active:mt-1 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-b-4 disabled:mt-0 flex items-center gap-2"
              >
                CREAR MI CURSO PERSONALIZADO
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-[#1472FF] to-[#5BA0FF] rounded-full animate-pulse"></div>
              <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                <span className="text-4xl animate-bounce">🤖</span>
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-[#4b4b4b] dark:text-white mb-3 tracking-tight">
              creando tu curso personalizado
            </h2>
            <p className="text-[#777777] dark:text-gray-400 mb-10">
              Nuestra IA está diseñando tu ruta de aprendizaje
            </p>

            <div className="mb-10">
              <div className="w-full bg-gray-100 dark:bg-gray-900 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-[#1472FF] h-4 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm font-bold text-[#1472FF] mt-3">{progress}%</p>
            </div>

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
                    progress >= step.threshold ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    {progress >= step.threshold ? '✓' : ''}
                  </div>
                  <span className="text-sm text-gray-700">{step.label}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-400 mt-10">
              Esto puede tomar 2-3 minutos. No cierres esta página.
            </p>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}

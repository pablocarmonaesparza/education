'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const [projectIdea, setProjectIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleCreateCourse = async () => {
    if (!projectIdea.trim() || projectIdea.trim().length < 200) {
      setError('Por favor describe tu idea con al menos 200 caracteres antes de continuar');
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
      // Obtener el usuario actual
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('No estás autenticado');
      }

      // Iniciar el procesamiento primero
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
          
          // Intentar obtener el mensaje de error de diferentes formas
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
          // Si no se puede parsear el JSON, usar el status text
          console.error('Error parsing error response:', jsonError);
          errorMessage = response.statusText || `Error ${response.status}: No se pudo obtener más información.`;
        }
        
        cleanup();
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Generation started:', result);

      // Progreso simulado para ~2.5 minutos (150 segundos)
      // 1.1% cada 2 segundos = ~77 intervalos = ~154 segundos para llegar a 85%
      let progressValue = 0;
      progressInterval = setInterval(() => {
        progressValue = Math.min(progressValue + 1.1, 85);
        setProgress(Math.round(progressValue));
        
        if (progressValue >= 85) {
          if (progressInterval) clearInterval(progressInterval);
          progressInterval = null;
        }
      }, 2000); // Cada 2 segundos

      // Hacer polling cada 3 segundos para ver si ya terminó o si hay errores
      const checkCompletion = async (): Promise<{ completed: boolean; error?: string }> => {
        try {
          const { data, error } = await supabase
            .from('intake_responses')
            .select('generated_path, responses')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error('Error checking completion:', error);
            return { completed: false, error: 'Error al verificar el progreso' };
          }

          // Si tiene generated_path, ya terminó
          if (data && data.generated_path) {
            console.log('Course generation completed!');
            return { completed: true };
          }

          // Verificar si hay una entrada reciente sin generated_path (aún procesando)
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

      // Polling: revisar cada 3 segundos (más frecuente)
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

          // Esperar un momento para mostrar 100%
          setTimeout(() => {
            router.push('/dashboard');
            router.refresh();
          }, 1000);
        }
      }, 3000); // Cada 3 segundos

      // Timeout de seguridad: si después de 4 minutos no terminó, mostrar error
      timeoutId = setTimeout(() => {
        cleanup();
        setError('La generación está tomando más tiempo del esperado. Por favor recarga la página.');
        setLoading(false);
        setProgress(0);
      }, 240000); // 4 minutos

    } catch (err: any) {
      cleanup();
      setError(err.message || 'Ocurrió un error al crear tu curso. Intenta de nuevo.');
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-white overflow-hidden">
      {/* Background decoration - Similar to How It Works section */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#1472FF]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20 md:py-24">
        {!loading ? (
          <>
            {/* Header */}
            <div className="text-center mb-12 md:mb-14">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 md:mb-8 leading-tight">
                ¿Qué Quieres Construir?
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto font-light mb-6 md:mb-8">
                Describe tu idea y crearemos tu curso personalizado.
              </p>
            </div>

            {/* Interactive Text Field - Similar to How It Works */}
            <div className="max-w-xl mx-auto">
              <div className="relative">
                {/* Text Field Container */}
                <div className="relative bg-white rounded-xl p-3 md:p-4 shadow-lg border-2 border-gray-200 hover:border-gray-300 transition-all duration-300">
                  {/* Label */}
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cuéntanos sobre tu proyecto
                  </label>

                  {/* Textarea */}
                  <textarea
                    value={projectIdea}
                    onChange={(e) => {
                      setProjectIdea(e.target.value);
                      setError(null);
                    }}
                    placeholder="Ejemplo: Quiero crear un chatbot para atención al cliente que integre con WhatsApp y use IA para dar respuestas inteligentes a las preguntas más comunes..."
                    rows={4}
                    className="w-full min-h-[80px] bg-white text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none font-light leading-relaxed"
                  />

                  {/* Error */}
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

                  {/* Character count */}
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                    <p className={`text-sm font-medium ${
                      projectIdea.length >= 200
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}>
                      {projectIdea.length > 0 
                        ? projectIdea.length < 200
                          ? `${projectIdea.length} / 200 caracteres (mínimo)`
                          : `${projectIdea.length} caracteres`
                        : "Mínimo 200 caracteres"}
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
            </div>

            {/* CTA Button */}
            <div className="mt-12 md:mt-14 text-center">
              <button
                onClick={handleCreateCourse}
                disabled={!projectIdea.trim() || projectIdea.trim().length < 200}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-base md:text-lg text-white bg-gradient-to-r from-[#1472FF] to-[#5BA0FF] hover:from-[#0E5FCC] hover:to-[#1472FF] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Crear mi curso personalizado
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          // Loading State
          <div className="max-w-2xl mx-auto w-full">
            <div className="bg-white shadow-2xl rounded-2xl p-8 md:p-12">
              <div className="text-center">
                {/* Animated Icon */}
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#1472FF] to-[#0E5FCC] rounded-full animate-pulse"></div>
                  <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                    <span className="text-4xl animate-bounce">🤖</span>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                  Creando tu curso personalizado...
                </h2>
                <p className="text-gray-600 mb-8">
                  Nuestra IA está analizando tu proyecto y diseñando tu ruta de aprendizaje
                </p>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#1472FF] to-[#0E5FCC] h-4 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
                  </div>
                </div>
                <p className="text-sm font-semibold text-[#1472FF] mt-2">{progress}%</p>
              </div>

              {/* Loading Steps */}
              <div className="space-y-3 text-left max-w-md mx-auto">
                <div className={`flex items-center gap-3 transition-opacity ${progress >= 20 ? 'opacity-100' : 'opacity-30'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${progress >= 20 ? 'bg-green-500' : 'bg-gray-300'}`}>
                    {progress >= 20 ? '✓' : '○'}
                  </div>
                  <span className="text-sm text-gray-700">Analizando tu idea de proyecto</span>
                </div>
                <div className={`flex items-center gap-3 transition-opacity ${progress >= 40 ? 'opacity-100' : 'opacity-30'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${progress >= 40 ? 'bg-green-500' : 'bg-gray-300'}`}>
                    {progress >= 40 ? '✓' : '○'}
                  </div>
                  <span className="text-sm text-gray-700">Consultando base de conocimiento</span>
                </div>
                <div className={`flex items-center gap-3 transition-opacity ${progress >= 60 ? 'opacity-100' : 'opacity-30'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${progress >= 60 ? 'bg-green-500' : 'bg-gray-300'}`}>
                    {progress >= 60 ? '✓' : '○'}
                  </div>
                  <span className="text-sm text-gray-700">Seleccionando módulos relevantes</span>
                </div>
                <div className={`flex items-center gap-3 transition-opacity ${progress >= 80 ? 'opacity-100' : 'opacity-30'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${progress >= 80 ? 'bg-green-500' : 'bg-gray-300'}`}>
                    {progress >= 80 ? '✓' : '○'}
                  </div>
                  <span className="text-sm text-gray-700">Generando tu ruta personalizada</span>
                </div>
                <div className={`flex items-center gap-3 transition-opacity ${progress >= 95 ? 'opacity-100' : 'opacity-30'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${progress >= 95 ? 'bg-green-500' : 'bg-gray-300'}`}>
                    {progress >= 95 ? '✓' : '○'}
                  </div>
                  <span className="text-sm text-gray-700">Finalizando tu curso</span>
                </div>
              </div>

              <p className="text-xs text-gray-400 mt-8">
                Esto puede tomar de 2 a 3 minutos. Por favor, no cierres esta página...
              </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

              <div className="text-center">
                {/* Animated Icon */}
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#1472FF] to-[#0E5FCC] rounded-full animate-pulse"></div>
                  <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                    <span className="text-4xl animate-bounce">🤖</span>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                  Creando tu curso personalizado...
                </h2>
                <p className="text-gray-600 mb-8">
                  Nuestra IA está analizando tu proyecto y diseñando tu ruta de aprendizaje
                </p>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#1472FF] to-[#0E5FCC] h-4 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
                  </div>
                </div>
                <p className="text-sm font-semibold text-[#1472FF] mt-2">{progress}%</p>
              </div>

              {/* Loading Steps */}
              <div className="space-y-3 text-left max-w-md mx-auto">
                <div className={`flex items-center gap-3 transition-opacity ${progress >= 20 ? 'opacity-100' : 'opacity-30'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${progress >= 20 ? 'bg-green-500' : 'bg-gray-300'}`}>
                    {progress >= 20 ? '✓' : '○'}
                  </div>
                  <span className="text-sm text-gray-700">Analizando tu idea de proyecto</span>
                </div>
                <div className={`flex items-center gap-3 transition-opacity ${progress >= 40 ? 'opacity-100' : 'opacity-30'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${progress >= 40 ? 'bg-green-500' : 'bg-gray-300'}`}>
                    {progress >= 40 ? '✓' : '○'}
                  </div>
                  <span className="text-sm text-gray-700">Consultando base de conocimiento</span>
                </div>
                <div className={`flex items-center gap-3 transition-opacity ${progress >= 60 ? 'opacity-100' : 'opacity-30'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${progress >= 60 ? 'bg-green-500' : 'bg-gray-300'}`}>
                    {progress >= 60 ? '✓' : '○'}
                  </div>
                  <span className="text-sm text-gray-700">Seleccionando módulos relevantes</span>
                </div>
                <div className={`flex items-center gap-3 transition-opacity ${progress >= 80 ? 'opacity-100' : 'opacity-30'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${progress >= 80 ? 'bg-green-500' : 'bg-gray-300'}`}>
                    {progress >= 80 ? '✓' : '○'}
                  </div>
                  <span className="text-sm text-gray-700">Generando tu ruta personalizada</span>
                </div>
                <div className={`flex items-center gap-3 transition-opacity ${progress >= 95 ? 'opacity-100' : 'opacity-30'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${progress >= 95 ? 'bg-green-500' : 'bg-gray-300'}`}>
                    {progress >= 95 ? '✓' : '○'}
                  </div>
                  <span className="text-sm text-gray-700">Finalizando tu curso</span>
                </div>
              </div>

              <p className="text-xs text-gray-400 mt-8">
                Esto puede tomar de 2 a 3 minutos. Por favor, no cierres esta página...
              </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

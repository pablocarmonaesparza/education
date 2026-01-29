'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingNavbar from '@/components/onboarding/OnboardingNavbar';

export default function ProjectDescriptionPage() {
  const [projectIdea, setProjectIdea] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleContinue = () => {
    if (!projectIdea.trim() || projectIdea.trim().length < 100) {
      setError('Por favor describe tu idea con al menos 100 caracteres');
      return;
    }

    // Save to sessionStorage for next steps
    sessionStorage.setItem('projectIdea', projectIdea);

    // Navigate to optional context page
    router.push('/projectContext');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <OnboardingNavbar />

      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-12">
        <div className="w-full max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#4b4b4b] dark:text-white mb-4 tracking-tight lowercase">
              cuéntanos sobre tu proyecto
            </h1>
            <p className="text-base text-[#777777] dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
              Describe qué quieres construir y crearemos un curso personalizado para ti.
            </p>
          </div>

          {/* Text Area with depth effect */}
          <div className="mb-8">
            <div
              className="rounded-2xl"
              style={{
                boxShadow: error
                  ? '0 4px 0 0 #fca5a5'
                  : '0 4px 0 0 #d1d5db'
              }}
            >
              <div className={`relative w-full bg-white dark:bg-gray-900 rounded-2xl border-2 transition-all duration-300 ${
                error ? "border-red-300 dark:border-red-500" : "border-gray-200 dark:border-gray-950 focus-within:border-[#1472FF]"
              }`}>
                <textarea
                  value={projectIdea}
                  onChange={(e) => {
                    setProjectIdea(e.target.value);
                    setError(null);
                  }}
                  placeholder="Describe tu idea y haremos un curso personalizado para ti."
                  rows={2}
                  className="w-full bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none focus:ring-0 font-light leading-relaxed px-4 py-3"
                />

                {/* Character count */}
                <div className="px-4 pb-2 flex justify-end">
                  <p className={`text-xs font-medium ${
                    projectIdea.length >= 100 ? "text-green-500" : "text-gray-400 dark:text-gray-500"
                  }`}>
                    {projectIdea.length}/100
                  </p>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex justify-center mt-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-full">
                  <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-red-700 dark:text-red-400 font-medium">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          <div className="mb-10">
            <p className="text-sm text-[#777777] dark:text-gray-400 mb-3 text-center">¿Necesitas inspiración? Aquí algunas ideas:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                { label: 'Chatbot de atención al cliente', description: 'Quiero crear un chatbot que responda preguntas frecuentes de mis clientes sobre horarios, precios y disponibilidad de productos automáticamente.' },
                { label: 'Automatización de reportes', description: 'Necesito automatizar la generación de reportes semanales que extraiga datos de mis ventas y los envíe por correo a mi equipo.' },
                { label: 'Asistente de ventas con IA', description: 'Quiero un asistente inteligente que califique leads, sugiera productos y ayude a mi equipo de ventas a cerrar más tratos.' },
                { label: 'Generador de contenido', description: 'Necesito una herramienta que genere publicaciones para redes sociales, blogs y emails de marketing usando inteligencia artificial.' },
                { label: 'Bot para WhatsApp', description: 'Quiero integrar un bot en WhatsApp Business que atienda consultas, tome pedidos y programe citas de forma automática.' },
                { label: 'Análisis de datos con IA', description: 'Necesito analizar grandes volúmenes de datos de clientes para identificar patrones de compra y predecir tendencias de ventas.' },
              ].map((suggestion) => (
                <button
                  key={suggestion.label}
                  onClick={() => setProjectIdea(suggestion.description)}
                  className="px-4 py-2 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-950 text-[#777777] dark:text-gray-400 hover:border-[#1472FF] hover:text-[#1472FF] transition-all shadow-[0_2px_0_0_#e5e7eb] dark:shadow-[0_2px_0_0_#374151] hover:shadow-[0_2px_0_0_#1472FF]"
                >
                  {suggestion.label}
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => router.back()}
              className="px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-wide bg-gray-100 dark:bg-gray-900 text-[#4b4b4b] dark:text-white border-b-4 border-gray-300 dark:border-gray-950 hover:bg-gray-200 dark:hover:bg-gray-700 active:border-b-0 active:mt-1 transition-all duration-150 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
              </svg>
              Anterior
            </button>

            <button
              onClick={handleContinue}
              disabled={projectIdea.length < 100}
              className="px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-wide text-white bg-[#1472FF] border-b-4 border-[#0E5FCC] hover:bg-[#0E5FCC] active:border-b-0 active:mt-1 transition-all duration-150 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-b-4 disabled:mt-0"
            >
              Siguiente
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingNavbar from '@/components/onboarding/OnboardingNavbar';
import Button from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { upsertIntakeDraft } from '@/lib/onboarding/persistIntake';

export default function ProjectDescriptionPage() {
  // Pre-populate from `pendingProjectIdea` if the user arrived here via the
  // landing ProjectInputSection. SessionStorage wins for email signup;
  // cookie is a fallback for OAuth flows where sessionStorage gets wiped
  // on the round-trip to the provider. Consume-and-clear so a second visit
  // doesn't re-populate stale input.
  //
  // Defensive reads: sessionStorage puede throw en Safari modo privado o
  // cuando el storage está bloqueado. decodeURIComponent puede throw si la
  // cookie llegó malformada (`%E0%A4%A` etc). Cualquiera de los dos crashea
  // el render del page entero si no se aísla.
  const [projectIdea, setProjectIdea] = useState(() => {
    if (typeof window === 'undefined') return '';
    let fromSession: string | null = null;
    let cookieRaw: string | null = null;
    try {
      fromSession = sessionStorage.getItem('pendingProjectIdea');
    } catch {
      fromSession = null;
    }
    try {
      const cookieMatch = document.cookie.match(
        /(?:^|;\s*)pendingProjectIdea=([^;]+)/
      );
      cookieRaw = cookieMatch ? cookieMatch[1] : null;
    } catch {
      cookieRaw = null;
    }
    // Unconditionally clear both sources so a second visit doesn't
    // re-populate from whichever one was left behind.
    if (fromSession !== null || cookieRaw) {
      try {
        sessionStorage.removeItem('pendingProjectIdea');
      } catch {
        // ignore — storage might be blocked
      }
      try {
        document.cookie = 'pendingProjectIdea=; path=/; max-age=0';
      } catch {
        // ignore
      }
    }
    if (fromSession) return fromSession;
    if (cookieRaw) {
      try {
        return decodeURIComponent(cookieRaw);
      } catch {
        return '';
      }
    }
    return '';
  });
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const persistAndGo = async (idea: string, mode: 'personalized' | 'full') => {
    setIsSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login?redirectedFrom=/projectDescription');
        return;
      }

      const existingId = sessionStorage.getItem('intakeResponseId') || undefined;
      const result = await upsertIntakeDraft(
        supabase,
        user.id,
        { projectIdea: idea, courseMode: mode, step: 'description' },
        existingId
      );

      if ('error' in result) {
        setError('No pudimos guardar tu idea. Intenta de nuevo.');
        setIsSaving(false);
        return;
      }

      sessionStorage.setItem('intakeResponseId', result.id);
      sessionStorage.setItem('projectIdea', idea);
      if (mode === 'full') sessionStorage.setItem('courseMode', 'full');
      else sessionStorage.removeItem('courseMode');

      router.push('/projectContext');
    } catch {
      setError('Error inesperado. Intenta de nuevo.');
      setIsSaving(false);
    }
  };

  // Cap del textarea. Sin esto, alguien puede pegar megabytes y termina en
  // Supabase JSON + en el prompt que mandamos a OpenAI (token amplifier +
  // costo). 1200 es lo que ya valida /api/validate-idea, así que mantenemos
  // el contrato consistente cliente↔server.
  const IDEA_MAX_CHARS = 1200;
  const IDEA_MIN_CHARS = 100;

  const handleContinue = () => {
    const trimmed = projectIdea.trim();
    if (!trimmed || trimmed.length < IDEA_MIN_CHARS) {
      setError(`Por favor describe tu idea con al menos ${IDEA_MIN_CHARS} caracteres`);
      return;
    }
    if (trimmed.length > IDEA_MAX_CHARS) {
      setError(`Tu idea es demasiado larga. Máximo ${IDEA_MAX_CHARS} caracteres.`);
      return;
    }
    void persistAndGo(projectIdea, 'personalized');
  };

  const handleFullCourse = () => {
    void persistAndGo('Curso completo de Itera', 'full');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-800 flex flex-col">
      <OnboardingNavbar />

      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-12">
        <div className="w-full max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-ink dark:text-white mb-4 tracking-tight lowercase">
              cuéntanos sobre tu proyecto
            </h1>
            <p className="text-base text-ink-muted dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
              Describe qué quieres construir y crearemos un curso personalizado para ti.
            </p>
          </div>

          {/* Text Area with depth effect */}
          <div className="mb-8">
            <div
              className={`rounded-2xl ${
                error
                  ? 'shadow-[0_4px_0_0_#fca5a5] dark:shadow-[0_4px_0_0_#7f1d1d]'
                  : 'shadow-[0_4px_0_0_#d1d5db] dark:shadow-[0_4px_0_0_#111827]'
              }`}
            >
              <div className={`relative w-full bg-white dark:bg-gray-800 rounded-2xl border-2 transition-all duration-300 ${
                error ? "border-red-300 dark:border-red-500" : "border-gray-200 dark:border-gray-900 focus-within:border-primary"
              }`}>
                <textarea
                  value={projectIdea}
                  onChange={(e) => {
                    // Hard cap a IDEA_MAX_CHARS aunque maxLength del HTML
                    // limita el typing — defense in depth contra paste de
                    // contenido que el browser permita (algunos respetan
                    // maxLength solo en typing, no en paste).
                    const next = e.target.value.slice(0, IDEA_MAX_CHARS);
                    setProjectIdea(next);
                    setError(null);
                  }}
                  placeholder="Describe tu idea y haremos un curso personalizado para ti."
                  rows={2}
                  maxLength={IDEA_MAX_CHARS}
                  className="w-full bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none focus:ring-0 font-light leading-relaxed px-4 py-3"
                />

                {/* Character count */}
                <div className="px-4 pb-2 flex justify-end">
                  <p className={`text-xs font-medium ${
                    projectIdea.length > IDEA_MAX_CHARS - 100
                      ? "text-yellow-600 dark:text-yellow-400"
                      : projectIdea.length >= IDEA_MIN_CHARS
                        ? "text-green-500"
                        : "text-gray-400 dark:text-gray-500"
                  }`}>
                    {projectIdea.length}/{IDEA_MIN_CHARS}
                    {projectIdea.length > IDEA_MAX_CHARS - 100 && ` (máx ${IDEA_MAX_CHARS})`}
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
            <p className="text-sm text-ink-muted dark:text-gray-400 mb-3 text-center">¿Necesitas inspiración? Aquí algunas ideas:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                // Mezcla rebalanceada: ~70% empleados (chips 1-4) + ~30%
                // founder/negocio (chips 5-6). Antes estaba 100% founder y
                // dejaba fuera al mercado real de Itera (LATAM no-técnico
                // mayormente empleados aprendiendo IA para su trabajo).
                { label: 'Automatizar reportes en Excel', description: 'Quiero automatizar reportes que hago semanalmente en Excel. Sacar datos de varias hojas, formatearlos y mandarlos por correo a mi jefe sin tener que repetir el mismo proceso manual cada lunes.' },
                { label: 'Redactar emails y propuestas', description: 'Quiero redactar correos profesionales, propuestas comerciales y respuestas a clientes mucho más rápido. Que la IA me ayude a estructurar, mejorar el tono y adaptar al contexto.' },
                { label: 'Resumir reuniones y notas', description: 'Tengo muchas reuniones cada semana y pierdo tiempo escribiendo notas y resúmenes. Quiero usar IA para transcribir, resumir puntos clave y sacar action items automáticamente.' },
                { label: 'Investigar competencia y mercado', description: 'Necesito investigar competencia, tendencias y mercado para mi área de trabajo. Que la IA me ayude a sintetizar información de varias fuentes y producir reportes accionables para mi equipo.' },
                { label: 'Construir un chatbot para mi negocio', description: 'Quiero crear un chatbot que responda preguntas frecuentes de mis clientes sobre horarios, precios y disponibilidad de productos automáticamente, integrado a mi web o WhatsApp.' },
                { label: 'Generar contenido para redes', description: 'Necesito una herramienta que genere publicaciones para redes sociales, blogs y emails de marketing usando inteligencia artificial, alineada al tono de mi marca.' },
              ].map((suggestion) => (
                <Button
                  key={suggestion.label}
                  variant="outline"
                  size="sm"
                  onClick={() => setProjectIdea(suggestion.description)}
                >
                  {suggestion.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              size="lg"
              rounded2xl
              onClick={() => router.back()}
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
              onClick={handleContinue}
              disabled={projectIdea.length < 100 || isSaving}
              className="flex items-center gap-2"
            >
              {isSaving ? 'Guardando…' : 'Siguiente'}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </div>

          {/* Full course shortcut — sin personalizar, recorrido cronológico completo.
              Variant `ghost` lo hace claramente botón (padding + hover) sin
              pelear visualmente con el primary "Siguiente" de arriba. */}
          <div className="flex justify-center mt-8">
            <Button
              variant="ghost"
              size="md"
              rounded2xl
              onClick={handleFullCourse}
              disabled={isSaving}
            >
              o tomar el curso completo
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

'use client';

/**
 * Hero section — el flujo "un curso a partir de tu idea":
 *   1. el usuario escribe (o elige un chip de sugerencia)
 *   2. al hacer submit guardamos la idea en sessionStorage + cookie
 *      (la cookie sobrevive al redirect de OAuth, sessionStorage cubre el
 *      caso email/pass donde quedamos en la misma pestaña)
 *   3. abrimos AuthModal en signup; tras registro/login el resto del
 *      onboarding lee `pendingProjectIdea` y arma la ruta personalizada.
 *
 * Encima de HeroShader (canvas de bolitas con repulsión + shockwaves).
 * El wrapper de contenido es `pointer-events-none` para que el shader
 * siga recibiendo mouse/click en áreas vacías; los elementos interactivos
 * (textarea, chips, CTA) re-habilitan pointer-events para sí mismos.
 */
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthForm from '@/components/auth/AuthForm';
import Button from '@/components/ui/Button';
import { depth } from '@/lib/design-tokens';
import HeroShader from './HeroShader';
import NextSectionIndicator from './NextSectionIndicator';

const MIN_CHARACTERS = 100;
const MAX_CHARACTERS = 1000;

const suggestionOptions = [
  {
    id: 1,
    label: 'Chatbot de atención al cliente',
    icon: '💬',
    description:
      'Quiero crear un chatbot inteligente que responda preguntas frecuentes de mis clientes sobre horarios, precios y disponibilidad de productos. Debe integrarse con WhatsApp y poder escalar conversaciones complejas a un agente humano cuando sea necesario.',
  },
  {
    id: 2,
    label: 'Automatización de procesos',
    icon: '⚙️',
    description:
      'Necesito automatizar el proceso de facturación de mi empresa. Actualmente todo se hace manual en Excel y quiero que automáticamente se generen facturas, se envíen por correo y se registren en mi sistema contable cuando se confirma una venta.',
  },
  {
    id: 3,
    label: 'Análisis de datos con IA',
    icon: '📊',
    description:
      'Quiero analizar los datos de ventas de mi negocio para identificar patrones y predecir tendencias. Tengo información histórica de 3 años y me gustaría visualizar dashboards automáticos y recibir alertas cuando hay anomalías.',
  },
  {
    id: 4,
    label: 'E-commerce inteligente',
    icon: '🛒',
    description:
      'Quiero crear una tienda en línea que use IA para recomendar productos personalizados a cada cliente basándose en su historial de navegación y compras. También necesito que optimice automáticamente los precios según la demanda.',
  },
  {
    id: 5,
    label: 'Asistente virtual',
    icon: '🤖',
    description:
      'Necesito un asistente virtual para mi equipo de trabajo que pueda agendar reuniones, resumir documentos largos, responder preguntas sobre políticas internas de la empresa y ayudar a redactar correos profesionales.',
  },
];

export default function NewHeroSection() {
  const [idea, setIdea] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const ideaIsValid =
    idea.trim().length >= MIN_CHARACTERS && idea.trim().length <= MAX_CHARACTERS;
  const ideaIsTooLong = idea.length > MAX_CHARACTERS;

  // Auto-resize del textarea: cubre tanto cuando el usuario escribe como
  // cuando seleccionamos un chip que rellena `idea` programáticamente.
  // Cap suave en 240px para que no empuje el chevron fuera del viewport.
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 240)}px`;
  }, [idea]);

  const handleIdeaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARACTERS) {
      setIdea(value);
      // Si el texto deja de coincidir con el chip seleccionado, deseleccionarlo.
      const matchingOption = suggestionOptions.find(
        (opt) => opt.description === value,
      );
      if (!matchingOption) {
        setSelectedOption(null);
      }
    }
  };

  const handleGenerateCourse = () => {
    if (!ideaIsValid) return;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pendingProjectIdea', idea.trim());
      // Cookie también — el callback de OAuth en el server no ve sessionStorage.
      document.cookie = `pendingProjectIdea=${encodeURIComponent(idea.trim())}; path=/; max-age=3600; SameSite=Lax`;
    }
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen w-full overflow-hidden flex items-center justify-center bg-white dark:bg-gray-800"
    >
      {/* Shader interactivo de fondo */}
      <HeroShader />

      {/* Contenido sobre el shader. El wrapper es `pointer-events-none` para
          que el shader reciba mouse/click en áreas vacías; el textarea, chips
          y CTA re-habilitan pointer-events sobre sí mismos. */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full max-md:px-3 pointer-events-none">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-8 max-w-2xl mx-auto max-md:mb-6"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-ink dark:text-white leading-tight tracking-tight max-md:text-3xl">
            un curso a partir de tu idea
          </h1>
        </motion.div>

        {/* Textarea + chips + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-xl mx-auto w-full pointer-events-auto"
        >
          <div
            className={`relative w-full bg-white dark:bg-gray-800 rounded-2xl border-2 border-b-4 transition-all duration-300 ${
              ideaIsTooLong
                ? 'border-red-300 dark:border-red-500 border-b-red-300 dark:border-b-red-500'
                : 'border-gray-300 dark:border-gray-900 border-b-gray-300 dark:border-b-gray-900'
            }`}
          >
            <textarea
              ref={textareaRef}
              id="project-idea"
              value={idea}
              onChange={handleIdeaChange}
              onFocus={() => setShowOptions(true)}
              onBlur={() => setShowOptions(false)}
              placeholder="Describe tu idea y haremos un curso personalizado para ti."
              className="w-full bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none focus:ring-0 font-light leading-relaxed px-4 pt-4 pb-2 max-md:px-3 max-md:min-h-[120px]"
              rows={3}
            />

            {/* Contador de caracteres */}
            <div className="px-4 pb-2 flex justify-end">
              <p
                className={`text-xs font-medium ${
                  idea.length >= MIN_CHARACTERS
                    ? 'text-green-500'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {idea.length}/{MIN_CHARACTERS}
              </p>
            </div>
          </div>

          {/* Error de límite excedido */}
          {ideaIsTooLong && (
            <div className="flex justify-center mt-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-full">
                <svg
                  className="w-4 h-4 text-red-600 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-xs text-red-700 dark:text-red-400 font-medium">
                  Has excedido el límite de {MAX_CHARACTERS} caracteres.
                </p>
              </div>
            </div>
          )}

          {/* Chips de sugerencia — aparecen en focus, escapan en blur */}
          <AnimatePresence>
            {showOptions && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="overflow-hidden"
              >
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-3 font-medium">
                  O elige una idea para inspirarte
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {suggestionOptions.map((option, index) => (
                    <motion.button
                      key={option.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      onMouseDown={(e) => {
                        // preventDefault: que el click en el chip NO haga blur
                        // del textarea (sino los chips desaparecen antes de
                        // que se procese el click).
                        e.preventDefault();
                        setSelectedOption(option.id);
                        setIdea(option.description);
                        textareaRef.current?.focus();
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-medium ${depth.border} ${depth.bottom} transition-all duration-150 flex items-center gap-1.5 max-md:py-2.5 max-md:min-h-[44px] max-md:touch-manipulation ${
                        selectedOption === option.id
                          ? 'bg-primary text-white border-primary border-b-primary-dark'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 border-b-gray-300 dark:border-b-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700'
                      } ${depth.active}`}
                    >
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex justify-center"
          >
            <Button
              variant="primary"
              depth="bottom"
              size="none"
              rounded2xl
              onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
              }}
              onClick={handleGenerateCourse}
              disabled={!ideaIsValid}
              className="inline-flex items-center justify-center gap-3 px-10 py-4 text-base max-md:gap-2 max-md:px-6 max-md:py-3.5 max-md:text-sm max-md:min-h-[48px] max-md:touch-manipulation max-md:w-full"
            >
              Generar mi curso
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Chain de scroll: hero → cursos */}
      <NextSectionIndicator targetId="cursos" label="Cursos" />

      {/* Auth Modal — se abre cuando el usuario hace submit con idea válida */}
      <AnimatePresence mode="wait">
        {showAuthModal && (
          <motion.div
            key="auth-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm max-md:p-3 max-md:overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md z-10 max-md:max-h-[90dvh] max-md:my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-900 relative max-md:overflow-y-auto max-md:max-h-[90dvh]">
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors z-20"
                  aria-label="Cerrar"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <AuthForm mode={authMode} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

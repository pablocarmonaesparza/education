'use client';

/**
 * NewHeroSectionAlt — variante para /homeAlt.
 *
 * Diferencias vs NewHeroSection:
 *   - Imagen full-bleed (`/images/hero-beach.png`) reemplaza al HeroShader.
 *   - Overlay oscuro para que el texto blanco resalte.
 *   - Hook contrarian: "no pases más tiempo viendo playas creadas con ia. úsala."
 *   - Sub honesto sin "300% más" inventado.
 *   - Chips reescritos: lenguaje cotidiano, sin emojis, primera persona.
 *
 * El resto del comportamiento (validación, auth modal, cookies de OAuth) es
 * idéntico al hero original.
 */
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import AuthForm from '@/components/auth/AuthForm';
import Button from '@/components/ui/Button';
import { depth } from '@/lib/design-tokens';
import NextSectionIndicator from './NextSectionIndicator';

const MIN_CHARACTERS = 100;
const MAX_CHARACTERS = 1000;

const suggestionOptions = [
  {
    id: 1,
    label: 'responder mensajes más rápido',
    description:
      'Quiero un sistema que me ayude a responder los mensajes y consultas de mis clientes de forma rápida y consistente, sin tener que escribir lo mismo cien veces. Que entienda el contexto, sepa cuándo escalar a mí y aprenda de las respuestas que ya doy.',
  },
  {
    id: 2,
    label: 'automatizar tareas repetitivas',
    description:
      'Tengo tareas administrativas que hago cada semana —generar reportes, registrar movimientos, mover datos entre hojas— y quiero automatizarlas. Necesito que se conecten entre sí mis herramientas (correo, hojas de cálculo, sistema contable) sin pagar a un programador.',
  },
  {
    id: 3,
    label: 'escribir y resumir mejor con IA',
    description:
      'Escribo mucho —correos, documentos, propuestas, resúmenes de juntas— y quiero usar IA para hacerlo más rápido y con mejor tono. Que entienda mi forma de escribir, mi negocio y los términos que uso, no que suene a robot genérico.',
  },
  {
    id: 4,
    label: 'entender mis datos sin programar',
    description:
      'Tengo datos de ventas y clientes en hojas de cálculo y no sé sacarles valor. Quiero hacer preguntas en español ("qué producto se vendió más en marzo") y que me responda con análisis y gráficas, sin tener que aprender a programar ni contratar un analista.',
  },
  {
    id: 5,
    label: 'tener un asistente personal',
    description:
      'Necesito un asistente virtual para mí o mi equipo que ayude a agendar reuniones, resumir documentos largos, recordar pendientes, redactar correos y responder preguntas sobre nuestras políticas internas. Algo que se sienta hecho a la medida.',
  },
];

export default function NewHeroSectionAlt() {
  const [idea, setIdea] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const ideaIsValid =
    idea.trim().length >= MIN_CHARACTERS && idea.trim().length <= MAX_CHARACTERS;
  const ideaIsTooLong = idea.length > MAX_CHARACTERS;

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
      document.cookie = `pendingProjectIdea=${encodeURIComponent(idea.trim())}; path=/; max-age=3600; SameSite=Lax`;
    }
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  return (
    <section
      id="hero"
      className="relative isolate min-h-screen w-full overflow-hidden flex items-center justify-center"
    >
      {/* Imagen full-bleed de fondo. priority=true para LCP — es lo primero
          que ve el usuario en /homeAlt. */}
      <Image
        src="/images/hero-beach.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center z-0"
      />

      {/* Solo degradado inferior para transición suave a la siguiente sección.
          Empieza en el último 25% de la altura del hero. */}
      <div
        className="absolute inset-x-0 bottom-0 top-3/4 bg-gradient-to-b from-transparent to-white z-0 pointer-events-none"
        aria-hidden
      />

      {/* Contenido sobre la imagen. */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full max-md:px-3">
        {/* Title — texto en blanco encima del overlay.
            "úsala." en línea aparte para remate visual. */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-8 max-w-3xl mx-auto max-md:mb-6"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.05] tracking-tight max-md:text-3xl">
            no pases más tiempo viendo playas creadas con ia.
            <br className="hidden md:block" />
            <span className="text-primary"> úsala.</span>
          </h1>
        </motion.div>

        {/* Textarea + chips + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-xl mx-auto w-full"
        >
          <div
            className={`relative w-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl border-2 border-b-4 transition-all duration-300 ${
              ideaIsTooLong
                ? 'border-red-300 border-b-red-300'
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
              placeholder="empieza a crear tu idea hoy"
              className="w-full bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none focus:ring-0 font-light leading-relaxed px-4 pt-4 pb-2 max-md:px-3 max-md:min-h-[120px]"
              rows={3}
            />

            {/* Contador */}
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
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-full">
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
                <p className="text-xs text-red-700 font-medium">
                  Has excedido el límite de {MAX_CHARACTERS} caracteres.
                </p>
              </div>
            </div>
          )}

          {/* Chips de sugerencia — sin emojis, lenguaje cotidiano */}
          <AnimatePresence>
            {showOptions && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="overflow-hidden"
              >
                <p className="text-xs text-white/80 text-center mb-3 font-medium">
                  o elige una idea para inspirarte
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {suggestionOptions.map((option, index) => (
                    <motion.button
                      key={option.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSelectedOption(option.id);
                        setIdea(option.description);
                        textareaRef.current?.focus();
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-medium ${depth.border} ${depth.bottom} transition-all duration-150 max-md:py-2.5 max-md:min-h-[44px] max-md:touch-manipulation ${
                        selectedOption === option.id
                          ? 'bg-primary text-white border-primary border-b-primary-dark'
                          : 'bg-white/95 text-gray-700 border-gray-200 border-b-gray-300 hover:bg-white'
                      } ${depth.active}`}
                    >
                      {option.label}
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
              generar mi curso
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

          {/* Trust signal — reemplaza el "300% más" sin número fake */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center text-sm text-white/85 mt-6 max-w-md mx-auto leading-relaxed"
          >
            una de las habilidades mejor pagadas del 2026.
            <br className="hidden md:block" />
            aprende a aplicarla, no a verla.
          </motion.p>
        </motion.div>
      </div>

      {/* Chain de scroll */}
      <NextSectionIndicator targetId="cursos" label="Cursos" />

      {/* Auth Modal */}
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

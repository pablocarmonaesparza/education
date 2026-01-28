"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import AuthForm from "@/components/auth/AuthForm";

const MIN_CHARACTERS = 100;
const MAX_CHARACTERS = 1000;

const suggestionOptions = [
  { 
    id: 1, 
    label: "Chatbot de atención al cliente", 
    icon: "💬",
    description: "Quiero crear un chatbot inteligente que responda preguntas frecuentes de mis clientes sobre horarios, precios y disponibilidad de productos. Debe integrarse con WhatsApp y poder escalar conversaciones complejas a un agente humano cuando sea necesario."
  },
  { 
    id: 2, 
    label: "Automatización de procesos", 
    icon: "⚙️",
    description: "Necesito automatizar el proceso de facturación de mi empresa. Actualmente todo se hace manual en Excel y quiero que automáticamente se generen facturas, se envíen por correo y se registren en mi sistema contable cuando se confirma una venta."
  },
  { 
    id: 3, 
    label: "Análisis de datos con IA", 
    icon: "📊",
    description: "Quiero analizar los datos de ventas de mi negocio para identificar patrones y predecir tendencias. Tengo información histórica de 3 años y me gustaría visualizar dashboards automáticos y recibir alertas cuando hay anomalías."
  },
  { 
    id: 4, 
    label: "E-commerce inteligente", 
    icon: "🛒",
    description: "Quiero crear una tienda en línea que use IA para recomendar productos personalizados a cada cliente basándose en su historial de navegación y compras. También necesito que optimice automáticamente los precios según la demanda."
  },
  { 
    id: 5, 
    label: "Asistente virtual", 
    icon: "🤖",
    description: "Necesito un asistente virtual para mi equipo de trabajo que pueda agendar reuniones, resumir documentos largos, responder preguntas sobre políticas internas de la empresa y ayudar a redactar correos profesionales."
  },
];

export default function NewHeroSection() {
  const [idea, setIdea] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const [isDark, setIsDark] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Detect dark mode
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Fixed height textarea - no auto-expand

  const handleIdeaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARACTERS) {
      setIdea(value);
      // Clear selected option if user manually edits
      const matchingOption = suggestionOptions.find(opt => opt.description === value);
      if (!matchingOption) {
        setSelectedOption(null);
      }
    }
  };

  const handleGenerateCourse = () => {
    if (!idea.trim() || idea.trim().length < MIN_CHARACTERS || idea.trim().length > MAX_CHARACTERS) return;

    // Guardar la idea inmediatamente sin validación (la validación se hará después del registro)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pendingProjectIdea', idea.trim());
      // También guardar en cookie para OAuth (el servidor no puede acceder a sessionStorage)
      document.cookie = `pendingProjectIdea=${encodeURIComponent(idea.trim())}; path=/; max-age=3600; SameSite=Lax`;
    }
    
    // Mostrar el modal de autenticación inmediatamente
    setAuthMode("signup");
    setShowAuthModal(true);
  };

  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20 pb-20 max-md:pt-16 max-md:pb-16 max-md:px-3">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full max-md:px-3">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-8 max-w-2xl mx-auto max-md:mb-6"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#4b4b4b] dark:text-white leading-tight tracking-tight max-md:text-3xl">
            un curso a partir de tu idea
          </h1>
        </motion.div>

        {/* Interactive Text Field */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-xl mx-auto w-full"
        >
          {/* Textarea wrapper with counter and depth effect */}
          <div
            className="rounded-2xl"
            style={{
              boxShadow: idea.length > MAX_CHARACTERS
                ? '0 4px 0 0 #fca5a5'
                : isDark ? '0 4px 0 0 #4b5563' : '0 4px 0 0 #d1d5db'
            }}
          >
              <div className={`relative w-full textarea-dark-bg rounded-2xl border-2 transition-all duration-300 ${
                    idea.length > MAX_CHARACTERS ? "border-red-300 dark:border-red-500" : "textarea-dark-border"
                  }`}>
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

              {/* Character count */}
              <div className="px-4 pb-2 flex justify-end">
                <p className={`text-xs font-medium ${
                  idea.length >= MIN_CHARACTERS ? "text-green-500" : "text-gray-500 dark:text-gray-400"
                }`}>
                  {idea.length}/{MIN_CHARACTERS}
                </p>
              </div>
            </div>
          </div>

          {/* Character Limit Error - Centered */}
          {idea.length > MAX_CHARACTERS && (
            <div className="flex justify-center mt-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-full">
                <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-red-700 dark:text-red-400 font-medium">
                  Has excedido el límite de {MAX_CHARACTERS} caracteres.
                </p>
              </div>
            </div>
          )}

          {/* Suggestion Options - Appear when focused, stay visible */}
          <AnimatePresence>
            {showOptions && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
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
                        e.preventDefault(); // Prevent textarea blur
                        setSelectedOption(option.id);
                        setIdea(option.description);
                        textareaRef.current?.focus();
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border-2 border-b-4 transition-all duration-150 flex items-center gap-1.5 max-md:py-2.5 max-md:min-h-[44px] max-md:touch-manipulation ${
                        selectedOption === option.id
                          ? "bg-[#1472FF] text-white border-[#1472FF] border-b-[#0E5FCC]"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 border-b-gray-300 dark:border-b-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
                      } active:border-b-2 active:mt-0.5`}
                    >
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex justify-center"
          >
            <button
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent textarea blur
              }}
              onClick={handleGenerateCourse}
              disabled={!idea.trim() || idea.trim().length < MIN_CHARACTERS || idea.trim().length > MAX_CHARACTERS}
              className="inline-flex items-center justify-center gap-3 px-10 py-4 rounded-2xl font-bold text-white text-base uppercase tracking-wide bg-[#1472FF] border-b-4 border-[#0E5FCC] hover:bg-[#1265e0] active:border-b-0 active:mt-1 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-b-4 disabled:mt-0 max-md:gap-2 max-md:px-6 max-md:py-3.5 max-md:text-sm max-md:min-h-[48px] max-md:touch-manipulation max-md:w-full"
            >
              Generar mi curso
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </motion.div>
        </motion.div>

      </div>

      {/* Next section indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden md:block"
      >
        <button
          onClick={() => {
            const element = document.getElementById("how-it-works");
            if (element) {
              element.scrollIntoView({ behavior: "smooth" });
            }
          }}
          className="flex flex-col items-center gap-1 cursor-pointer group"
        >
          <span className="text-sm font-semibold tracking-wide text-black/40 dark:text-white/40 group-hover:text-black/60 dark:group-hover:text-white/60 transition-colors">
            Cómo Funciona
          </span>
          <motion.svg
            className="w-5 h-5 text-black/40 dark:text-white/40 group-hover:text-black/60 dark:group-hover:text-white/60 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </motion.svg>
        </button>
      </motion.div>

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
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                // Limpiar la idea guardada si el usuario cierra el modal sin completar
                if (typeof window !== 'undefined') {
                  sessionStorage.removeItem('pendingProjectIdea');
                  // También limpiar la cookie
                  document.cookie = 'pendingProjectIdea=; path=/; max-age=0';
                }
                setShowAuthModal(false);
              }}
              className="absolute inset-0"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md z-10 max-md:max-h-[90dvh] max-md:my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Auth Form */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-600 relative max-md:overflow-y-auto max-md:max-h-[90dvh]">
                {/* Close Button - Inside the card */}
              <button
                  onClick={() => {
                    // Limpiar la idea guardada si el usuario cierra el modal sin completar
                    if (typeof window !== 'undefined') {
                      sessionStorage.removeItem('pendingProjectIdea');
                      // También limpiar la cookie
                      document.cookie = 'pendingProjectIdea=; path=/; max-age=0';
                    }
                    setShowAuthModal(false);
                  }}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors z-20"
                aria-label="Cerrar"
              >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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

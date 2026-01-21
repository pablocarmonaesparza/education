"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import dynamic from "next/dynamic";

const AuthForm = dynamic(() => import("@/components/auth/AuthForm"), {
  ssr: false,
  loading: () => (
    <div className="p-8 flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1472FF]"></div>
    </div>
  ),
});

const MIN_CHARACTERS = 100;
const MAX_CHARACTERS = 1000;

// Floating decorative elements
const FloatingElement = ({ children, delay = 0, duration = 3, className = "" }: { 
  children: React.ReactNode; 
  delay?: number; 
  duration?: number;
  className?: string;
}) => (
  <motion.div
    className={className}
    animate={{ 
      y: [0, -15, 0],
      rotate: [0, 5, -5, 0]
    }}
    transition={{ 
      duration, 
      repeat: Infinity, 
      ease: "easeInOut",
      delay 
    }}
  >
    {children}
  </motion.div>
);

export default function NewHeroSection() {
  const [idea, setIdea] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleIdeaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARACTERS) {
      setIdea(value);
      if (validationError) setValidationError(null);
    }
  };

  const handleGenerateCourse = async () => {
    if (!idea.trim() || idea.trim().length < MIN_CHARACTERS || idea.trim().length > MAX_CHARACTERS) return;

    setIsValidating(true);
    setValidationError(null);

    try {
      const response = await fetch("/api/validate-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: idea.trim() }),
      });

      const contentType = response.headers.get("content-type");
      let data;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        throw new Error("Error al conectar con el servicio.");
      }

      if (!response.ok) {
        throw new Error(data?.reason || data?.error || "Error en el servidor");
      }

      if (!data.valid) {
        setValidationError(data.reason || "Describe mejor tu proyecto.");
      } else {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('pendingProjectIdea', idea.trim());
          document.cookie = `pendingProjectIdea=${encodeURIComponent(idea.trim())}; path=/; max-age=3600; SameSite=Lax`;
        }
        setAuthMode("signup");
        setShowAuthModal(true);
      }
    } catch (error: any) {
      setValidationError(error.message || "Hubo un error. Intenta de nuevo.");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-[#1472FF] via-[#0E5FCC] to-[#1472FF] overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div 
          className="absolute top-1/2 -right-32 w-[500px] h-[500px] bg-[#5BA0FF]/20 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], y: [0, -50, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div 
          className="absolute -bottom-32 left-1/3 w-80 h-80 bg-white/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 7, repeat: Infinity }}
        />
      </div>

      {/* Floating decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <FloatingElement delay={0} className="absolute top-20 left-[10%]">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
        </FloatingElement>
        
        <FloatingElement delay={0.5} duration={4} className="absolute top-32 right-[15%]">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </FloatingElement>

        <FloatingElement delay={1} duration={3.5} className="absolute bottom-32 left-[8%]">
          <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </FloatingElement>

        <FloatingElement delay={1.5} duration={4.5} className="absolute bottom-40 right-[12%]">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        </FloatingElement>

        <FloatingElement delay={2} duration={5} className="absolute top-1/2 left-[5%]">
          <div className="w-10 h-10 bg-white/30 backdrop-blur rounded-full" />
        </FloatingElement>

        <FloatingElement delay={0.8} duration={3.8} className="absolute top-40 left-[30%]">
          <div className="w-6 h-6 bg-yellow-400 rounded-full shadow-lg" />
        </FloatingElement>

        <FloatingElement delay={1.2} duration={4.2} className="absolute bottom-60 right-[25%]">
          <div className="w-8 h-8 bg-white/40 rounded-lg rotate-45" />
        </FloatingElement>
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 pt-32 pb-20 min-h-screen flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-8"
          >
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white/90 text-sm font-medium">Cursos personalizados con IA</span>
          </motion.div>

          {/* Main headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-6">
            Aprende IA
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-200 to-white">
              Construyendo
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            Describe tu proyecto y creamos un curso personalizado solo para ti. 
            Sin relleno, sin rodeos.
          </p>
        </motion.div>

        {/* Input card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full max-w-2xl"
        >
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl">
            <label className="block text-gray-700 font-bold text-lg mb-3">
              ¿Qué quieres construir?
            </label>
            
            <textarea
              ref={textareaRef}
              value={idea}
              onChange={handleIdeaChange}
              placeholder="Quiero crear un chatbot para atención al cliente que se integre con WhatsApp y pueda responder preguntas sobre mis productos..."
              className="w-full h-32 p-4 text-gray-800 bg-gray-50 rounded-2xl border-2 border-gray-200 focus:border-[#1472FF] focus:ring-0 focus:outline-none resize-none transition-colors text-base"
            />

            <div className="flex items-center justify-between mt-3 mb-4">
              <span className="text-sm text-gray-500">
                Mínimo {MIN_CHARACTERS} caracteres
              </span>
              <span className={`text-sm font-bold ${idea.length >= MIN_CHARACTERS ? 'text-green-500' : 'text-gray-400'}`}>
                {idea.length}/{MIN_CHARACTERS}
              </span>
            </div>

            {validationError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
              >
                {validationError}
              </motion.div>
            )}

            <button
              onClick={handleGenerateCourse}
              disabled={idea.trim().length < MIN_CHARACTERS || isValidating}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-200 ${
                idea.trim().length >= MIN_CHARACTERS && !isValidating
                  ? 'bg-[#1472FF] text-white border-b-4 border-[#0E5FCC] hover:bg-[#1472FF]/90 active:border-b-0 active:mt-1 cursor-pointer'
                  : 'bg-gray-200 text-gray-400 border-b-4 border-gray-300 cursor-not-allowed'
              }`}
            >
              {isValidating ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Analizando tu idea...
                </span>
              ) : (
                'Generar mi curso personalizado'
              )}
            </button>

            <p className="text-center text-gray-500 text-sm mt-4">
              ¿Ya tienes cuenta?{' '}
              <button
                onClick={() => { setAuthMode("login"); setShowAuthModal(true); }}
                className="text-[#1472FF] font-bold hover:underline"
              >
                Inicia sesión
              </button>
            </p>
          </div>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-6 mt-12 text-white/60 text-sm"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>400+ micro-videos</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Rutas personalizadas</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Comienza gratis</span>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-white/60"
        >
          <span className="text-xs font-medium uppercase tracking-wider">Descubre más</span>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </motion.div>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (typeof window !== 'undefined') {
                  sessionStorage.removeItem('pendingProjectIdea');
                  document.cookie = 'pendingProjectIdea=; path=/; max-age=0';
                }
                setShowAuthModal(false);
              }}
              className="absolute inset-0"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl relative">
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      sessionStorage.removeItem('pendingProjectIdea');
                      document.cookie = 'pendingProjectIdea=; path=/; max-age=0';
                    }
                    setShowAuthModal(false);
                  }}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors z-20"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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

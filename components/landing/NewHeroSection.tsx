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

export default function NewHeroSection() {
  const [idea, setIdea] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleIdeaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARACTERS) {
      setIdea(value);
      if (validationError) {
        setValidationError(null);
      }
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
        throw new Error("Error al conectar con el servicio. Por favor intenta más tarde.");
      }

      if (!response.ok) {
        throw new Error(data?.reason || data?.error || `Error en el servidor`);
      }

      if (!data.valid) {
        setValidationError(data.reason || "La idea no es clara. Por favor, describe mejor tu proyecto.");
      } else {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('pendingProjectIdea', idea.trim());
          document.cookie = `pendingProjectIdea=${encodeURIComponent(idea.trim())}; path=/; max-age=3600; SameSite=Lax`;
        }
        setAuthMode("signup");
        setShowAuthModal(true);
      }
    } catch (error: any) {
      setValidationError(error.message || "Hubo un error. Por favor intenta de nuevo.");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-950 overflow-hidden pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full max-w-4xl">
        
        {/* Main Content - Duolingo Style */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          
          {/* Left Side - Text & Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 text-center lg:text-left"
          >
            {/* Duolingo-style headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#1472FF] leading-tight mb-4">
              aprende ia.
              <br />
              <span className="text-gray-900 dark:text-white">construye tu proyecto.</span>
            </h1>
            
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto lg:mx-0">
              Cursos personalizados de IA y automatización. 
              <span className="text-[#1472FF] font-semibold"> Describe tu idea</span> y creamos el curso perfecto para ti.
            </p>

            {/* Textarea - Duolingo card style */}
            <div className="max-w-md mx-auto lg:mx-0">
              <div className={`relative bg-white dark:bg-gray-800 rounded-2xl border-2 border-b-4 transition-all duration-200 ${
                validationError 
                  ? "border-red-300 dark:border-red-500" 
                  : isFocused 
                    ? "border-[#1472FF] border-b-[#0E5FCC]" 
                    : "border-gray-200 dark:border-gray-600 border-b-gray-300 dark:border-b-gray-500"
              }`}>
                <textarea
                  ref={textareaRef}
                  value={idea}
                  onChange={handleIdeaChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Quiero crear un chatbot para mi negocio de..."
                  className="w-full bg-transparent text-base text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:outline-none px-4 py-4 rounded-2xl"
                  rows={3}
                />
                <div className="px-4 pb-3 flex justify-between items-center">
                  <span className="text-xs text-gray-400">Mínimo {MIN_CHARACTERS} caracteres</span>
                  <span className={`text-xs font-bold ${
                    idea.length >= MIN_CHARACTERS ? "text-[#1472FF]" : "text-gray-400"
                  }`}>
                    {idea.length}/{MIN_CHARACTERS}
                  </span>
                </div>
              </div>

              {/* Error Message */}
              {validationError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 px-4 py-2 bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-800 rounded-xl"
                >
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">{validationError}</p>
                </motion.div>
              )}

              {/* CTA Button - Duolingo 3D style */}
              <motion.button
                onClick={handleGenerateCourse}
                disabled={!idea.trim() || !!validationError || isValidating || idea.trim().length < MIN_CHARACTERS}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full mt-4 px-8 py-4 rounded-2xl font-bold text-lg uppercase tracking-wide transition-all duration-200 ${
                  idea.trim().length >= MIN_CHARACTERS && !validationError && !isValidating
                    ? "bg-[#1472FF] text-white border-b-4 border-[#0E5FCC] hover:bg-[#1472FF]/90 active:border-b-2 active:mt-[6px]"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-b-4 border-gray-300 dark:border-gray-600 cursor-not-allowed"
                }`}
              >
                {isValidating ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Validando...
                  </span>
                ) : (
                  "Comenzar gratis"
                )}
              </motion.button>

              {/* Secondary link */}
              <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                ¿Ya tienes cuenta?{" "}
                <button 
                  onClick={() => {
                    setAuthMode("login");
                    setShowAuthModal(true);
                  }}
                  className="text-[#1472FF] font-bold hover:underline"
                >
                  Inicia sesión
                </button>
              </p>
            </div>
          </motion.div>

          {/* Right Side - Illustration placeholder */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 hidden lg:flex items-center justify-center"
          >
            {/* Decorative elements - Duolingo style */}
            <div className="relative w-80 h-80">
              {/* Main circle */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#1472FF]/20 to-[#5BA0FF]/20 rounded-full" />
              
              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-4 right-8 w-16 h-16 bg-[#1472FF] rounded-2xl flex items-center justify-center"
              >
                <span className="text-3xl">🤖</span>
              </motion.div>
              
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute bottom-8 left-4 w-14 h-14 bg-[#FFB020] rounded-2xl flex items-center justify-center"
              >
                <span className="text-2xl">⚡</span>
              </motion.div>
              
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-1/2 left-8 w-12 h-12 bg-[#22C55E] rounded-2xl flex items-center justify-center"
              >
                <span className="text-xl">📚</span>
              </motion.div>
              
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                className="absolute bottom-16 right-4 w-14 h-14 bg-[#A855F7] rounded-2xl flex items-center justify-center"
              >
                <span className="text-2xl">🚀</span>
              </motion.div>

              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-3xl border-4 border-[#1472FF] border-b-8 flex items-center justify-center">
                  <span className="text-5xl">🎯</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block"
        >
          <button
            onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
            className="flex flex-col items-center gap-2 text-gray-400 hover:text-[#1472FF] transition-colors"
          >
            <span className="text-sm font-bold uppercase tracking-wider">Descubre más</span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </button>
        </motion.div>
      </div>

      {/* Auth Modal */}
      <AnimatePresence mode="wait">
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
              <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 border-b-4 relative">
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

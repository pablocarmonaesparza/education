"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";

const AuthForm = dynamic(() => import("@/components/auth/AuthForm"), {
  ssr: false,
  loading: () => (
    <div className="p-8 flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1472FF]"></div>
    </div>
  ),
});

const MIN_CHARACTERS = 200;
const MAX_CHARACTERS = 1000;

export default function NewHeroSection() {
  const [idea, setIdea] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [idea]);

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idea: idea.trim() }),
      });

      const contentType = response.headers.get("content-type");
      let data;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error("Respuesta del servidor no es JSON:", text);
        
        // Si la respuesta es HTML (página de error), es un error del servidor
        if (text.includes("<!DOCTYPE html>") || text.includes("<html>")) {
          throw new Error("Error de configuración del servidor. Por favor contacta al soporte.");
        }
        
        throw new Error("Error al conectar con el servicio de validación. Por favor intenta más tarde.");
      }

      if (!response.ok) {
        // Extraer el mensaje de error del JSON si existe
        const errorMessage = data?.reason || data?.error || `Error en el servidor (${response.status})`;
        throw new Error(errorMessage);
      }

      if (!data.valid) {
        setValidationError(data.reason || "La idea no tiene sentido. Por favor, describe mejor tu proyecto.");
      } else {
        setAuthMode("signup");
        setShowAuthModal(true);
      }
    } catch (error: any) {
      console.error("Error validating idea:", error);
      setValidationError(error.message || "Hubo un error al validar tu idea. Por favor intenta de nuevo.");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-950 overflow-hidden">
      {/* Background decoration - Subtle */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#1472FF]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20 md:py-24 pt-32 md:pt-40">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-10 md:mb-12 max-w-xl mx-auto"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
            Un curso a partir de tu idea.
          </h1>
        </motion.div>

        {/* Interactive Text Field */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-xl mx-auto"
        >
          <div className="max-w-xl mx-auto">
            {/* Textarea wrapper with counter */}
            <div className={`relative w-full bg-white dark:bg-gray-900 rounded-3xl border-2 transition-all duration-300 ${
                  validationError || idea.length > MAX_CHARACTERS ? "border-red-300 dark:border-red-500" : "border-gray-200 dark:border-gray-700"
                }`}>
              <textarea
                ref={textareaRef}
                id="project-idea"
                value={idea}
                onChange={handleIdeaChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Describe tu idea y haremos un curso personalizado para ti."
                className="w-full bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none focus:ring-0 font-light leading-relaxed p-4 pb-2 overflow-hidden"
                rows={1}
                style={{ minHeight: '56px', height: '56px' }}
              />

              {/* Character count - Inside wrapper, below text */}
              <div className="px-4 pb-3 text-right">
                <p className="text-xs text-gray-400 dark:text-gray-500 font-light">
                  Mínimo {idea.length}/{MIN_CHARACTERS} caracteres
                </p>
              </div>
            </div>

            {/* Validation Error - Centered */}
            {(validationError || idea.length > MAX_CHARACTERS) && (
              <div className="flex justify-center mt-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-full">
                  <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-red-700 dark:text-red-400 font-medium">
                    {idea.length > MAX_CHARACTERS
                      ? `Has excedido el límite de ${MAX_CHARACTERS} caracteres.`
                      : validationError}
                  </p>
                </div>
              </div>
            )}

          </div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 text-center"
          >
            <button
              onClick={handleGenerateCourse}
              disabled={!idea.trim() || !!validationError || isValidating || idea.trim().length < MIN_CHARACTERS || idea.trim().length > MAX_CHARACTERS}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-white navbar-button-gradient hover:opacity-90 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              Generar demo de mi curso
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
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
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
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
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 dark:hover:text-gray-400 transition-colors z-20"
                aria-label="Cerrar"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Auth Form */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <AuthForm mode={authMode} />

                {/* Toggle between login/signup */}
                <div className="px-8 pb-6 text-center border-t border-gray-200 dark:border-gray-700 pt-6">
                  <button
                    onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#1472FF] transition-colors"
                  >
                    {authMode === "login" ? (
                      <>¿No tienes cuenta? <span className="font-semibold text-[#1472FF]">Regístrate gratis</span></>
                    ) : (
                      <>¿Ya tienes cuenta? <span className="font-semibold text-[#1472FF]">Inicia sesión</span></>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

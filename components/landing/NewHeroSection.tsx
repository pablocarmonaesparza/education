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

  // Fixed height textarea - no auto-expand

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
        // Guardar la idea en sessionStorage para recuperarla después del login/signup
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('pendingProjectIdea', idea.trim());
          // También guardar en cookie para OAuth (el servidor no puede acceder a sessionStorage)
          document.cookie = `pendingProjectIdea=${encodeURIComponent(idea.trim())}; path=/; max-age=3600; SameSite=Lax`;
        }
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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
            <div className={`relative w-full bg-white dark:bg-gray-900 rounded-2xl border-2 transition-all duration-300 ${
                  validationError || idea.length > MAX_CHARACTERS ? "border-red-300 dark:border-red-500" : "border-gray-200 dark:border-gray-700 focus-within:border-[#1472FF]"
                }`}>
              <textarea
                ref={textareaRef}
                id="project-idea"
                value={idea}
                onChange={handleIdeaChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Describe tu idea y haremos un curso personalizado para ti."
                className="w-full bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none focus:ring-0 font-light leading-relaxed px-4 py-3"
                rows={2}
              />

              {/* Character count */}
              <div className="px-4 pb-2 flex justify-end">
                <p className={`text-xs font-medium ${
                  idea.length >= MIN_CHARACTERS ? "text-green-500" : "text-gray-400 dark:text-gray-500"
                }`}>
                  {idea.length}/{MIN_CHARACTERS}
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
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
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
              className="relative w-full max-w-md z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Auth Form */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 relative">
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

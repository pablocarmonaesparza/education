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

export default function HowItWorksSection() {
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
      // Limpiar cualquier error cuando el usuario escribe
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
        // Si no es JSON, probablemente sea un error del servidor que devuelve HTML
        const text = await response.text();
        console.error("Respuesta del servidor no es JSON:", text);
        throw new Error("Error al conectar con el servicio de validación.");
      }

      if (!response.ok) {
        throw new Error(data.reason || data.error || "Error en el servidor");
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
    <section id="how-it-works" className="relative min-h-screen flex flex-col items-center justify-center bg-white overflow-hidden">
      {/* Background decoration - Subtle */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#1472FF]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20 md:py-24">
        {/* Section Header - Lomma style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-14"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 md:mb-8 leading-tight">
            ¿Cómo Funciona?
          </h2>
        </motion.div>

        {/* Interactive Text Field */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto"
        >
          <div className="max-w-xl mx-auto">
            {/* Textarea wrapper with counter */}
            <div className={`relative w-full bg-white rounded-3xl border-2 transition-all duration-300 ${
                  validationError || idea.length > MAX_CHARACTERS ? "border-red-300" : "border-gray-200"
                }`}>
              <textarea
                ref={textareaRef}
                id="project-idea"
                value={idea}
                onChange={handleIdeaChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Describe tu idea y haremos demo para ti."
                className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-0 font-light leading-relaxed p-4 pb-2 overflow-hidden"
                rows={1}
                style={{ minHeight: '56px', height: '56px' }}
              />
              
              {/* Character count - Inside wrapper, below text */}
              <div className="px-4 pb-3 text-right">
                <p className="text-xs text-gray-400 font-light">
                  Mínimo {idea.length}/{MIN_CHARACTERS} caracteres
                </p>
              </div>
            </div>

            {/* Validation Error - Centered */}
            {(validationError || idea.length > MAX_CHARACTERS) && (
              <div className="flex justify-center mt-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-full">
                  <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-red-700 font-medium">
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
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
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

      {/* Auth Modal */}
      <AnimatePresence mode="wait">
        {showAuthModal && (
          <motion.div
            key="auth-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gradient-to-br from-[#1472FF]/10 via-[#5BA0FF]/10 to-[#1472FF]/10"
          >
            {/* Background decoration - Enhanced for glassmorphism */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {/* Base gradient overlay - more vibrant */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#1472FF]/20 via-[#5BA0FF]/20 to-[#1472FF]/20" />
              
              {/* Animated orbs - more visible */}
              <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#1472FF] rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" />
              <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-pulse" style={{ animationDelay: '2s' }} />
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-2xl opacity-50" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#1472FF]/100 rounded-full mix-blend-multiply filter blur-2xl opacity-50" />
              
              {/* Additional layers for depth */}
              <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-pink-300 rounded-full mix-blend-multiply filter blur-2xl opacity-40" />
              <div className="absolute bottom-1/3 left-1/4 w-48 h-48 bg-cyan-300 rounded-full mix-blend-multiply filter blur-2xl opacity-40" />
            </div>
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
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
                className="absolute -top-12 right-0 text-white hover:text-gray-200 transition-colors z-20 drop-shadow-lg"
                aria-label="Cerrar"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Auth Form */}
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <AuthForm mode={authMode} />
                
                {/* Toggle between login/signup */}
                <div className="px-8 pb-6 text-center">
                  <button
                    onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
                    className="text-sm text-gray-600 hover:text-[#1472FF] transition-colors"
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

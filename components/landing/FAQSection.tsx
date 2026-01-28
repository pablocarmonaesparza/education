"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const currentYear = new Date().getFullYear();

  const faqs = [
    {
      question: "¿Necesito experiencia previa en programación o IA?",
      answer:
        "No necesariamente. El curso está diseñado para adaptarse a diferentes niveles. Si eres principiante, tu ruta personalizada incluirá los fundamentos necesarios.",
    },
    {
      question: "¿Cuánto tiempo me tomará completar el curso?",
      answer:
        "Depende de tu ruta personalizada y tiempo disponible. El contenido total es de 10.5-19.7 horas, pero tu ruta personalizada probablemente será de 6-12 horas.",
    },
    {
      question: "¿Qué pasa si el curso no me funciona?",
      answer:
        "Tienes 30 días para probarlo. Si no estás satisfecho por cualquier razón, te devolvemos el 100% de tu dinero, sin preguntas.",
    },
    {
      question: "¿Cómo funciona la personalización con IA?",
      answer:
        "Antes de comprar, respondes 5-7 preguntas sobre tu proyecto, experiencia, meta e industria. Nuestra IA analiza tus respuestas y genera una ruta de aprendizaje específica para ti.",
    },
  ];

  return (
    <section id="faq" className="relative min-h-screen flex flex-col overflow-hidden">
      {/* FAQ Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
        <div className="w-full max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-10 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#4b4b4b] dark:text-white mb-4 sm:mb-6 leading-tight tracking-tight">
              preguntas frecuentes
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-[#777777] dark:text-gray-400 max-w-xl mx-auto px-2">
              encuentra respuestas a tus dudas más comunes
            </p>
          </div>

          {/* FAQ Items */}
          <div className="w-full space-y-2">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`rounded-2xl transition-all duration-150 ${
                  openIndex === index
                    ? "bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-600 border-b-4 border-b-gray-300 dark:border-b-gray-600"
                    : "bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-600 border-b-4 border-b-gray-300 dark:border-b-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 sm:hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex justify-between items-center text-left p-4 sm:p-6 md:p-8 min-h-[56px] touch-manipulation"
                >
                  <span className="text-base sm:text-lg md:text-xl font-bold uppercase tracking-wide pr-6 sm:pr-8 text-[#4b4b4b] dark:text-white text-left">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-[#4b4b4b] dark:text-white"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 md:px-8 pb-6 md:pb-8 text-base md:text-lg text-[#777777] dark:text-gray-400 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-gray-600 dark:text-gray-400">
                &copy; {currentYear} Itera. Todos los derechos reservados.
              </p>
            </div>
            <div className="flex gap-6">
              <Link
                href="/terms"
                className="text-gray-600 dark:text-gray-400 hover:text-[#1472FF] dark:hover:text-[#5BA0FF] transition-colors"
              >
                Términos
              </Link>
              <Link
                href="/privacy"
                className="text-gray-600 dark:text-gray-400 hover:text-[#1472FF] dark:hover:text-[#5BA0FF] transition-colors"
              >
                Privacidad
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </section>
  );
}

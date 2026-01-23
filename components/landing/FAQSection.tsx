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
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#4b4b4b] dark:text-white mb-6 leading-tight tracking-tight">
              preguntas frecuentes
            </h2>
            <p className="text-lg md:text-xl text-[#777777] dark:text-gray-400 max-w-xl mx-auto">
              encuentra respuestas a tus dudas más comunes
            </p>
          </div>

          {/* FAQ Items */}
          <div className="w-full space-y-2">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
className={`rounded-2xl transition-all duration-300 ${
                  openIndex === index
                    ? "bg-[#1472FF]/10"
                    : "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800/50"
                }`}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex justify-between items-center text-left p-6 md:p-8"
                >
                  <span className={`text-lg md:text-xl font-bold transition-colors pr-8 tracking-tight ${
                    openIndex === index 
                      ? "text-[#1472FF]" 
                      : "text-[#4b4b4b] dark:text-white"
                  }`}>
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      openIndex === index 
                        ? "bg-[#1472FF] text-white" 
                        : "bg-gray-100 dark:bg-gray-800 text-[#777777]"
                    }`}
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
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="px-6 md:px-8 pb-6 md:pb-8 text-base md:text-lg text-[#777777] dark:text-gray-400 leading-relaxed"
                    >
                      {faq.answer}
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

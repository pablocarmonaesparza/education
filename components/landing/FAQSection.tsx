"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Card from '@/components/ui/Card';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const currentYear = new Date().getFullYear();

  const faqs = [
    {
      question: "¿Qué voy a aprender exactamente?",
      answer:
        "Desde los fundamentos — qué es un modelo de AI, cómo pensar los prompts, por qué a veces se equivoca — hasta aplicación real en tu trabajo: usar Claude o ChatGPT para escribir y resumir, automatizar tareas repetitivas, conectar AI con tus datos, y crear agentes que hagan cosas por ti. 100 lecciones organizadas en 10 secciones temáticas.",
    },
    {
      question: "¿Cuánto tiempo necesito al día?",
      answer:
        "Cada lección dura alrededor de 10 minutos. Puedes hacer una al día sin que interfiera con tu trabajo, o varias seguidas si quieres concentrarte. La ruta completa son aproximadamente 17 horas; la personalizada, según tu proyecto, suele ser entre 3 y 8.",
    },
    {
      question: "¿Es para mí si no soy técnico?",
      answer:
        "Sí. Itera está pensado para profesionales que quieren usar AI en su día a día, no para programadores. El contenido no requiere escribir código y cada concepto se explica con ejemplos concretos de trabajo real: escribir mejor, automatizar tareas, analizar información, tomar decisiones con datos.",
    },
    {
      question: "¿Cómo funciona la ruta personalizada?",
      answer:
        "Nos cuentas qué quieres construir o aprender a hacer. El sistema analiza tu respuesta y arma una ruta con las lecciones relevantes, en el orden correcto, sin relleno. Si después cambias de idea, puedes volver a la ruta completa cuando quieras.",
    },
    {
      question: "¿Qué pasa si no me convence?",
      answer:
        "Tienes 30 días para probarlo. Si por cualquier razón no te convence, te devolvemos el 100%. Y puedes cancelar desde tu cuenta en cualquier momento, sin llamadas ni formularios.",
    },
  ];

  return (
    <section id="faq" className="relative min-h-screen flex flex-col overflow-hidden">
      {/* FAQ Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
        <div className="w-full max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 md:mb-16 max-md:mb-8">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-ink dark:text-white mb-6 leading-tight tracking-tight max-md:text-3xl max-md:mb-4">
              preguntas frecuentes
            </h2>
            <p className="text-lg md:text-xl text-ink-muted dark:text-gray-400 max-w-xl mx-auto max-md:text-base max-md:px-2">
              encuentra respuestas a tus dudas más comunes
            </p>
          </div>

          {/* FAQ Items */}
          <div className="w-full space-y-2">
            {faqs.map((faq, index) => (
              <Card
                key={index}
                variant="neutral"
                padding="none"
                interactive={openIndex !== index}
                className={openIndex !== index ? "md:hover:scale-[1.02] active:scale-[0.98]" : ""}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex justify-between items-center text-left p-6 md:p-8 max-md:p-4 max-md:min-h-[56px] max-md:touch-manipulation"
                >
                  <span className="text-lg md:text-xl font-bold pr-8 text-ink dark:text-white text-left max-md:text-base max-md:pr-6">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-ink dark:text-white"
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
                      <div className="px-6 md:px-8 pb-6 md:pb-8 text-base md:text-lg text-ink-muted dark:text-gray-400 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-800 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-ink-muted dark:text-gray-400">
                &copy; {currentYear} Itera. Todos los derechos reservados.
              </p>
            </div>
            <div className="flex gap-6">
              <Link
                href="/terms"
                className="text-ink-muted dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
              >
                Términos
              </Link>
              <Link
                href="/privacy"
                className="text-ink-muted dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
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

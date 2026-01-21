"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "¿Necesito experiencia previa?",
      answer:
        "No necesariamente. El curso se adapta a tu nivel. Si eres principiante, tu ruta incluirá los fundamentos necesarios.",
    },
    {
      question: "¿Cuánto tiempo toma completar el curso?",
      answer:
        "Depende de tu ruta personalizada. El contenido total es de 10-20 horas, pero tu ruta será de 6-12 horas aproximadamente.",
    },
    {
      question: "¿Qué pasa si no me funciona?",
      answer:
        "Tienes 7 días para probarlo. Si no estás satisfecho, te devolvemos el 100% de tu dinero, sin preguntas.",
    },
    {
      question: "¿Cómo funciona la personalización con IA?",
      answer:
        "Describes tu proyecto y nuestra IA selecciona de 400+ videos solo los que necesitas para tu objetivo específico.",
    },
    {
      question: "¿Puedo cambiar de plan después?",
      answer:
        "Sí, puedes subir o bajar de plan en cualquier momento. Los cambios se aplican al siguiente ciclo de facturación.",
    },
  ];

  return (
    <section id="faq" className="py-20 md:py-32 bg-[#F7F7F7] dark:bg-gray-900">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header - Duolingo style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#1472FF] mb-4">
            preguntas frecuentes.
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Todo lo que necesitas saber.
          </p>
        </motion.div>

        {/* FAQ Items - Duolingo card style */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className={`w-full text-left bg-white dark:bg-gray-800 rounded-2xl border-2 border-b-4 transition-all duration-200 ${
                  openIndex === index
                    ? "border-[#1472FF] border-b-[#0E5FCC]"
                    : "border-gray-200 dark:border-gray-700 border-b-gray-300 dark:border-b-gray-600 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <div className="flex justify-between items-center p-5">
                  <span className="text-lg font-bold text-gray-900 dark:text-white pr-4">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      openIndex === index
                        ? "bg-[#1472FF] text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.div>
                </div>

                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-0">
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            ¿Tienes otra pregunta?
          </p>
          <a
            href="mailto:hola@itera.la"
            className="inline-flex items-center gap-2 text-[#1472FF] font-bold hover:underline"
          >
            Escríbenos
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

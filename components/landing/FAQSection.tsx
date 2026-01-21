"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "¿Necesito saber programar?",
      answer: "No necesariamente. El curso se adapta a tu nivel. Si eres principiante, tu ruta incluirá los fundamentos. Si ya tienes experiencia, irás directo a lo avanzado.",
    },
    {
      question: "¿Cuánto tiempo toma completar un curso?",
      answer: "Depende de tu ruta personalizada. El contenido total es de 10-20 horas, pero tu ruta personalizada típicamente será de 6-12 horas porque solo incluye lo que necesitas.",
    },
    {
      question: "¿Qué pasa si no me gusta?",
      answer: "Tienes 7 días de garantía. Si no estás satisfecho, te devolvemos el 100% de tu dinero. Sin preguntas, sin complicaciones.",
    },
    {
      question: "¿Cómo funciona la personalización?",
      answer: "Describes tu proyecto en detalle. Nuestra IA analiza tu idea, identifica las habilidades que necesitas, y selecciona de 400+ videos solo los relevantes para ti.",
    },
    {
      question: "¿Puedo cambiar de plan?",
      answer: "Sí, puedes subir o bajar de plan cuando quieras. Los cambios se aplican inmediatamente y ajustamos el cobro de forma proporcional.",
    },
  ];

  return (
    <section id="faq" className="py-24 md:py-32 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-2 bg-[#1472FF]/10 text-[#1472FF] rounded-full text-sm font-bold mb-6"
          >
            PREGUNTAS FRECUENTES
          </motion.span>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white leading-tight">
            ¿Dudas?{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1472FF] to-[#5BA0FF]">
              Te ayudamos
            </span>
          </h2>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className={`w-full text-left rounded-2xl transition-all duration-300 ${
                  openIndex === index
                    ? 'bg-[#1472FF] shadow-lg shadow-[#1472FF]/20'
                    : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750'
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center justify-between p-6">
                  <span className={`text-lg font-bold pr-4 ${
                    openIndex === index ? 'text-white' : 'text-gray-900 dark:text-white'
                  }`}>
                    {faq.question}
                  </span>
                  
                  <motion.div
                    animate={{ rotate: openIndex === index ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                      openIndex === index
                        ? 'bg-white/20'
                        : 'bg-[#1472FF]/10'
                    }`}
                  >
                    <svg 
                      className={`w-6 h-6 ${
                        openIndex === index ? 'text-white' : 'text-[#1472FF]'
                      }`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor" 
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </motion.div>
                </div>

                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6">
                        <p className="text-white/80 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 bg-gradient-to-r from-[#1472FF]/10 to-[#5BA0FF]/10 rounded-3xl">
            <div className="w-12 h-12 bg-[#1472FF] rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-gray-900 dark:text-white font-bold">¿Tienes otra pregunta?</p>
              <a href="mailto:hola@itera.la" className="text-[#1472FF] hover:underline">
                Escríbenos a hola@itera.la
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

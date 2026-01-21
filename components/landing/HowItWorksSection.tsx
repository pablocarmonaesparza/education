"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Describe tu proyecto",
    description: "Cuéntanos qué quieres construir. ¿Un chatbot? ¿Automatizar procesos? ¿Crear agentes de IA? Mientras más detalles, mejor.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
    gradient: "from-blue-500 to-cyan-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    number: "02",
    title: "La IA analiza tu idea",
    description: "Nuestra IA revisa 400+ videos y selecciona SOLO los que necesitas. Sin relleno, sin contenido irrelevante.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    gradient: "from-purple-500 to-pink-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
  },
  {
    number: "03",
    title: "Aprende construyendo",
    description: "Sigue tu ruta personalizada paso a paso. Cada video te acerca más a completar TU proyecto real.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    gradient: "from-green-500 to-emerald-400",
    bgColor: "bg-green-50 dark:bg-green-950/30",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-white dark:bg-gray-950 overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-2 bg-[#1472FF]/10 text-[#1472FF] rounded-full text-sm font-bold mb-6"
          >
            CÓMO FUNCIONA
          </motion.span>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white leading-tight">
            Tu curso en{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1472FF] to-[#5BA0FF]">
              3 pasos
            </span>
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 -translate-y-1/2 opacity-20" />
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative"
              >
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className={`${step.bgColor} rounded-3xl p-8 h-full border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-colors`}
                >
                  {/* Step number */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} text-white mb-6 shadow-lg`}>
                    {step.icon}
                  </div>

                  {/* Number badge */}
                  <div className="absolute top-6 right-6 text-6xl font-black text-gray-200 dark:text-gray-800 opacity-50">
                    {step.number}
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {step.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>

                {/* Arrow connector (desktop only) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute -right-6 top-1/2 -translate-y-1/2 z-10">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + index * 0.2 }}
                      className="w-12 h-12 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center shadow-lg border-2 border-gray-100 dark:border-gray-800"
                    >
                      <svg className="w-6 h-6 text-[#1472FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-16"
        >
          <button
            onClick={() => document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#1472FF] text-white font-bold text-lg rounded-2xl border-b-4 border-[#0E5FCC] hover:bg-[#1472FF]/90 active:border-b-0 active:mt-1 transition-all"
          >
            Comenzar ahora
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </motion.div>
      </div>
    </section>
  );
}

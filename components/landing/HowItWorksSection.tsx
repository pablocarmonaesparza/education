"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "1",
    title: "describe tu proyecto",
    description: "Cuéntanos qué quieres construir. ¿Un chatbot? ¿Automatizar tu negocio? ¿Crear agentes de IA?",
    emoji: "💡",
    color: "bg-[#1472FF]",
    borderColor: "border-[#0E5FCC]",
  },
  {
    number: "2",
    title: "recibe tu ruta",
    description: "Nuestra IA analiza tu idea y crea un curso personalizado con solo los videos que necesitas.",
    emoji: "🎯",
    color: "bg-[#FFB020]",
    borderColor: "border-[#E09800]",
  },
  {
    number: "3",
    title: "aprende construyendo",
    description: "Sigue tu ruta paso a paso. Cada video te acerca más a completar tu proyecto real.",
    emoji: "🚀",
    color: "bg-[#22C55E]",
    borderColor: "border-[#16A34A]",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="py-20 md:py-32 bg-[#F7F7F7] dark:bg-gray-900"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header - Duolingo style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#1472FF] mb-4">
            así de fácil.
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            En 3 pasos tienes tu curso personalizado listo para comenzar.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -4 }}
              className="relative"
            >
              {/* Card - Duolingo 3D style */}
              <div className={`bg-white dark:bg-gray-800 rounded-3xl p-8 border-2 border-b-6 border-gray-200 dark:border-gray-700 transition-all duration-200 h-full`}>
                {/* Emoji badge */}
                <div className={`w-16 h-16 ${step.color} rounded-2xl border-b-4 ${step.borderColor} flex items-center justify-center mb-6`}>
                  <span className="text-3xl">{step.emoji}</span>
                </div>

                {/* Step number */}
                <div className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                  Paso {step.number}
                </div>

                {/* Title */}
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 lowercase">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Arrow connector (only on desktop, not on last item) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                  </svg>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <button
            onClick={() => document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#1472FF] text-white font-bold text-lg rounded-2xl border-b-4 border-[#0E5FCC] hover:bg-[#1472FF]/90 active:border-b-2 active:mt-[2px] transition-all uppercase tracking-wide"
          >
            Comenzar ahora
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </motion.div>
      </div>
    </section>
  );
}

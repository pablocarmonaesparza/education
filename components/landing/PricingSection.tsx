"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function PricingSection() {
  const router = useRouter();

  const handleSelectPlan = () => {
    router.push("/auth/signup");
  };

  const tiers = [
    {
      id: "basic",
      name: "básico",
      price: "Gratis",
      popular: false,
      description: "Perfecto para explorar",
      emoji: "🎓",
      color: "bg-gray-100 dark:bg-gray-800",
      borderColor: "border-gray-200 dark:border-gray-700",
      buttonColor: "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600",
      features: [
        "400+ micro-videos (1-3 min)",
        "12 secciones organizadas",
        "Comunidad en Slack",
        "Casos enfocados en LATAM",
        "Actualizaciones incluidas",
      ],
      cta: "Comenzar gratis",
    },
    {
      id: "plus",
      name: "plus",
      price: "$19/mes",
      popular: true,
      description: "El más popular",
      emoji: "⚡",
      color: "bg-[#1472FF]",
      borderColor: "border-[#0E5FCC]",
      buttonColor: "bg-white text-[#1472FF] border-gray-200 hover:bg-gray-50",
      features: [
        "Todo lo del Básico",
        "Curso personalizado por IA",
        "IA selecciona tus videos",
        "Comunidad en Discord",
        "Asistente virtual (limitado)",
      ],
      cta: "Elegir Plus",
    },
    {
      id: "pro",
      name: "pro",
      price: "$199/mes",
      popular: false,
      description: "Para los serios",
      emoji: "🚀",
      color: "bg-gray-900 dark:bg-white",
      borderColor: "border-gray-700 dark:border-gray-300",
      buttonColor: "bg-[#1472FF] text-white border-[#0E5FCC]",
      features: [
        "Todo lo del Plus",
        "Tutoría quincenal con Pablo",
        "5 cursos personalizados/mes",
        "Contexto entre sesiones",
        "Asistente virtual ilimitado",
      ],
      cta: "Elegir Pro",
    },
  ];

  return (
    <section id="pricing" className="py-20 md:py-32 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header - Duolingo style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#1472FF] mb-4">
            elige tu plan.
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Comienza gratis y escala cuando estés listo.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className={`relative rounded-3xl overflow-hidden ${
                tier.popular ? "md:-mt-4 md:mb-4" : ""
              }`}
            >
              {/* Popular badge */}
              {tier.popular && (
                <div className="absolute top-0 left-0 right-0 bg-[#FFB020] text-center py-2">
                  <span className="text-sm font-bold text-white uppercase tracking-wider">
                    Más popular
                  </span>
                </div>
              )}

              {/* Card */}
              <div className={`${tier.color} ${tier.popular ? "pt-12" : "pt-8"} pb-8 px-6 h-full flex flex-col border-2 border-b-6 ${tier.borderColor} rounded-3xl`}>
                {/* Emoji */}
                <div className="text-4xl mb-4">{tier.emoji}</div>

                {/* Plan name */}
                <h3 className={`text-2xl font-black lowercase mb-2 ${
                  tier.popular 
                    ? "text-white" 
                    : tier.id === "pro" 
                      ? "text-white dark:text-gray-900" 
                      : "text-gray-900 dark:text-white"
                }`}>
                  {tier.name}
                </h3>

                {/* Description */}
                <p className={`text-sm mb-4 ${
                  tier.popular 
                    ? "text-white/80" 
                    : tier.id === "pro" 
                      ? "text-white/80 dark:text-gray-600" 
                      : "text-gray-600 dark:text-gray-400"
                }`}>
                  {tier.description}
                </p>

                {/* Price */}
                <div className="mb-6">
                  <span className={`text-4xl font-black ${
                    tier.popular 
                      ? "text-white" 
                      : tier.id === "pro" 
                        ? "text-white dark:text-gray-900" 
                        : "text-gray-900 dark:text-white"
                  }`}>
                    {tier.price}
                  </span>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <svg 
                        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          tier.popular 
                            ? "text-white" 
                            : tier.id === "pro" 
                              ? "text-white dark:text-gray-900" 
                              : "text-[#1472FF]"
                        }`} 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className={`text-sm ${
                        tier.popular 
                          ? "text-white/90" 
                          : tier.id === "pro" 
                            ? "text-white/90 dark:text-gray-700" 
                            : "text-gray-700 dark:text-gray-300"
                      }`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={handleSelectPlan}
                  className={`w-full py-4 rounded-2xl font-bold text-base border-2 border-b-4 transition-all active:border-b-2 active:mt-[2px] ${tier.buttonColor}`}
                >
                  {tier.cta}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust badge */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-gray-500 dark:text-gray-400 mt-12 text-sm"
        >
          Cancela cuando quieras • Sin compromisos • Garantía de 7 días
        </motion.p>
      </div>
    </section>
  );
}

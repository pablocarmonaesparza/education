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
      name: "Básico",
      price: "Gratis",
      period: "",
      description: "Perfecto para explorar",
      color: "from-gray-600 to-gray-800",
      bgCard: "bg-white dark:bg-gray-800",
      features: [
        "400+ micro-videos",
        "12 secciones de contenido",
        "Comunidad en Slack",
        "Casos de uso LATAM",
        "Actualizaciones incluidas",
      ],
      cta: "Comenzar Gratis",
      popular: false,
    },
    {
      id: "plus",
      name: "Plus",
      price: "$19",
      period: "/mes",
      description: "El favorito de todos",
      color: "from-[#1472FF] to-[#5BA0FF]",
      bgCard: "bg-gradient-to-br from-[#1472FF] to-[#0E5FCC]",
      features: [
        "Todo lo del Básico",
        "Curso personalizado por IA",
        "Solo los videos que necesitas",
        "Comunidad prioritaria Discord",
        "Asistente virtual",
      ],
      cta: "Elegir Plus",
      popular: true,
    },
    {
      id: "pro",
      name: "Pro",
      price: "$199",
      period: "/mes",
      description: "Para los ambiciosos",
      color: "from-purple-600 to-pink-600",
      bgCard: "bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900",
      features: [
        "Todo lo del Plus",
        "Tutoría 1:1 con Pablo",
        "5 cursos personalizados/mes",
        "Contexto entre sesiones",
        "Asistente ilimitado",
      ],
      cta: "Elegir Pro",
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 md:py-32 bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl">
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
            PRECIOS SIMPLES
          </motion.span>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white leading-tight mb-4">
            Elige tu{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1472FF] to-[#5BA0FF]">
              plan
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Comienza gratis. Escala cuando estés listo.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className={`relative ${tier.popular ? 'md:-mt-4 md:mb-4' : ''}`}
            >
              {/* Popular badge */}
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="px-4 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-white text-sm font-bold shadow-lg"
                  >
                    ⭐ MÁS POPULAR
                  </motion.div>
                </div>
              )}

              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className={`h-full rounded-3xl p-8 ${tier.bgCard} ${
                  tier.popular 
                    ? 'shadow-2xl shadow-[#1472FF]/20' 
                    : tier.id === 'pro'
                      ? 'shadow-xl'
                      : 'border-2 border-gray-200 dark:border-gray-700'
                }`}
              >
                {/* Plan name */}
                <h3 className={`text-2xl font-bold mb-2 ${
                  tier.popular || tier.id === 'pro' ? 'text-white' : 'text-gray-900 dark:text-white'
                }`}>
                  {tier.name}
                </h3>
                
                <p className={`text-sm mb-6 ${
                  tier.popular || tier.id === 'pro' ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {tier.description}
                </p>

                {/* Price */}
                <div className="mb-8">
                  <span className={`text-5xl font-black ${
                    tier.popular || tier.id === 'pro' ? 'text-white' : 'text-gray-900 dark:text-white'
                  }`}>
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className={`text-lg ${
                      tier.popular || tier.id === 'pro' ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {tier.period}
                    </span>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        tier.popular 
                          ? 'bg-white/20' 
                          : tier.id === 'pro'
                            ? 'bg-purple-500/20'
                            : 'bg-green-100 dark:bg-green-900/30'
                      }`}>
                        <svg 
                          className={`w-3 h-3 ${
                            tier.popular || tier.id === 'pro' ? 'text-white' : 'text-green-600 dark:text-green-400'
                          }`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className={`text-sm ${
                        tier.popular || tier.id === 'pro' ? 'text-white/90' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={handleSelectPlan}
                  className={`w-full py-4 rounded-2xl font-bold text-base transition-all duration-200 ${
                    tier.popular
                      ? 'bg-white text-[#1472FF] hover:bg-gray-100 border-b-4 border-gray-200 active:border-b-0 active:mt-1'
                      : tier.id === 'pro'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-b-4 border-purple-800 hover:opacity-90 active:border-b-0 active:mt-1'
                        : 'bg-[#1472FF] text-white border-b-4 border-[#0E5FCC] hover:bg-[#1472FF]/90 active:border-b-0 active:mt-1'
                  }`}
                >
                  {tier.cta}
                </button>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-8 mt-16 text-gray-500 dark:text-gray-400 text-sm"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Garantía 7 días
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Cancela cuando quieras
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
            Pago seguro
          </div>
        </motion.div>
      </div>
    </section>
  );
}

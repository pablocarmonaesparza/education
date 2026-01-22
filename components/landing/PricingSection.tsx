"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function PricingSection() {
  const router = useRouter();

  const formatPrice = (usdPrice: number, isMonthly: boolean = false) => {
    if (usdPrice === 0) {
      return "Gratis";
    }
    return `$${usdPrice}${isMonthly ? "/mes" : ""}`;
  };

  const handleSelectPlan = () => {
    router.push("/auth/signup");
  };

  const tiers = [
    {
      id: "basic",
      name: "Básico",
      price: 0,
      isMonthly: false,
      popular: false,
      description: "Acceso completo para aprender a tu ritmo",
      features: [
        "Acceso completo a los 400+ micro-videos (1-3 min c/u)",
        "Contenido organizado en 12 secciones",
        "Acceso a la comunidad general en Slack",
        "Casos de uso enfocados en LATAM",
        "Actualizaciones de contenido incluidas",
      ],
      cta: "Comenzar Gratis",
    },
    {
      id: "plus",
      name: "Plus",
      price: 19,
      isMonthly: true,
      popular: true,
      description: "La experiencia completa con IA personalizada",
      features: [
        "Todo lo del plan Básico",
        "Curso personalizado generado por AI según tu proyecto",
        "De 400+ videos, la AI selecciona los 10-200 que necesitas",
        "Acceso a la comunidad prioritaria en Discord",
        "Asistente virtual de seguimiento (Limitado)",
      ],
      cta: "Comenzar con Plus",
    },
    {
      id: "pro",
      name: "Pro",
      price: 199,
      isMonthly: true,
      popular: false,
      description: "Experiencia premium con tutoría personalizada",
      features: [
        "Todo lo del plan Plus",
        "Tutoría quincenal con Pablo de forma individual",
        "Hasta 5 cursos personalizados por mes",
        "Contexto acumulativo entre sesiones",
        "Asistente virtual de seguimiento (Ilimitado)",
      ],
      cta: "Comenzar con Pro",
    },
  ];

  return (
    <section id="pricing" className="relative bg-white dark:bg-gray-950 min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20 pb-24">
      <div className="container mx-auto px-4 relative z-10 w-full">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-center text-[#1472FF] leading-tight tracking-tight">
            Nuestros Planes
          </h2>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-4 md:gap-6 max-w-7xl mx-auto">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * (index + 3) }}
              viewport={{ once: true }}
              className={`relative rounded-2xl p-5 md:p-6 transition-all duration-300 flex flex-col ${
                tier.popular
                  ? "bg-[#1472FF]/10 dark:bg-[#1472FF]/20 border-2 border-[#1472FF]"
                  : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              }`}
            >
              {/* Popular Badge */}
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-[#1472FF] text-white px-4 py-1 rounded-full text-xs font-bold">
                    🔥 MÁS POPULAR
                  </div>
                </div>
              )}

              {/* Title */}
              <div className="mb-3">
                <h3 className="text-xl md:text-2xl font-extrabold text-[#4b4b4b] dark:text-white tracking-tight">{tier.name}</h3>
              </div>

              <p className="text-[#777777] dark:text-gray-400 text-sm mb-5">{tier.description}</p>

              {/* Pricing */}
              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl md:text-4xl font-bold text-[#1472FF]">
                    {formatPrice(tier.price, tier.isMonthly)}
                  </span>
                  {tier.price > 0 && (
                    <span className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">USD</span>
                  )}
                </div>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {tier.price === 0 ? "Sin tarjeta de crédito" : "Cancela cuando quieras"}
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-2 mb-4 flex-1">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 flex-shrink-0 text-green-500 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-xs md:text-sm text-gray-700 dark:text-gray-300 leading-snug">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={handleSelectPlan}
                className={`w-full py-4 rounded-2xl font-bold text-sm md:text-base uppercase tracking-wide transition-all duration-150 mt-auto ${
                  tier.popular
                    ? "bg-[#1472FF] text-white border-b-4 border-[#0E5FCC] hover:bg-[#1265e0] active:border-b-0 active:mt-1"
                    : "bg-white dark:bg-gray-800 text-[#1472FF] border-2 border-b-4 border-[#1472FF] hover:bg-[#1472FF]/5 dark:hover:bg-[#1472FF]/10 active:border-b-2 active:mt-[2px]"
                }`}
              >
                {tier.cta}
              </button>

            </motion.div>
          ))}
        </div>

      </div>

      {/* Next section indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        viewport={{ once: true }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden md:block"
      >
        <button
          onClick={() => {
            const element = document.getElementById("faq");
            if (element) {
              element.scrollIntoView({ behavior: "smooth" });
            }
          }}
          className="flex flex-col items-center gap-1 cursor-pointer group"
        >
          <span className="text-sm font-semibold tracking-wide text-black/40 dark:text-white/40 group-hover:text-black/60 dark:group-hover:text-white/60 transition-colors">
            FAQ
          </span>
          <motion.svg
            className="w-5 h-5 text-black/40 dark:text-white/40 group-hover:text-black/60 dark:group-hover:text-white/60 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </motion.svg>
        </button>
      </motion.div>
    </section>
  );
}

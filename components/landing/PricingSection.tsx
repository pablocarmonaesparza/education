"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function PricingSection() {
  const router = useRouter();

  const MONTHLY_ANNUALIZED = 19 * 12;
  const YEARLY_SAVINGS = MONTHLY_ANNUALIZED - 199;

  const formatPrice = (usdPrice: number, period?: string) => {
    if (usdPrice === 0) {
      return "Gratis";
    }
    return `$${usdPrice}${period ?? ""}`;
  };

  const handleSelectPlan = (plan: "free" | "monthly" | "yearly") => {
    if (plan === "free") {
      router.push("/auth/signup");
    } else {
      router.push(`/auth/signup?plan=${plan}`);
    }
  };

  const tiers = [
    {
      id: "free" as const,
      name: "gratis",
      price: 0,
      period: undefined,
      popular: false,
      description: "Prueba las primeras lecciones y la sección de fundamentos. Sin ruta personalizada.",
      features: [
        "Las primeras 20 lecciones",
        "Sección de fundamentos completa",
        "Acceso a la comunidad",
        "Ejemplos pensados para LATAM",
      ],
      cta: "comenzar gratis",
    },
    {
      id: "monthly" as const,
      name: "mensual",
      price: 19,
      period: "/mes",
      popular: true,
      description: "Ruta personalizada según lo que quieres construir.",
      features: [
        "Todo lo del plan gratis",
        "Ruta personalizada según tu proyecto",
        "Solo las lecciones que necesitas, en el orden correcto",
        "Asistente que te recuerda y te sigue",
        "Cancela cuando quieras",
      ],
      cta: "empezar mensual",
    },
    {
      id: "yearly" as const,
      name: "anual",
      price: 199,
      period: "/año",
      popular: false,
      description: `Todo lo del mensual con ahorro de $${YEARLY_SAVINGS}.`,
      features: [
        "Todo lo del plan mensual",
        `Ahorras $${YEARLY_SAVINGS} vs. pagar mensual`,
        "Acceso priorizado a nuevas lecciones",
        "Cancela cuando quieras",
      ],
      cta: "empezar anual",
    },
  ];

  return (
    <section id="pricing" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20 pb-24 max-md:pt-16 max-md:pb-16">
      <div className="container mx-auto px-4 relative z-10 w-full max-md:px-3">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="mb-12 max-md:mb-8"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-center text-ink dark:text-white leading-tight tracking-tight max-md:text-3xl">
            nuestros planes
          </h2>
        </motion.div>

        {/* Pricing Cards - items-stretch + h-full for equal height */}
        <div className="grid lg:grid-cols-3 gap-4 md:gap-6 max-w-7xl mx-auto items-stretch">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * (index + 3) }}
              viewport={{ once: true }}
              className="h-full flex"
            >
              <Card
                variant="neutral"
                padding="lg"
                className="relative flex flex-col md:p-6 h-full w-full"
              >
                {/* Title */}
                <div className="mb-3">
                  <h3 className="text-3xl md:text-4xl font-extrabold text-ink dark:text-white tracking-tight">{tier.name}</h3>
                </div>

                <p className="text-ink-muted dark:text-gray-400 text-sm mb-5">{tier.description}</p>

                {/* Pricing */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl md:text-4xl font-bold text-primary">
                      {formatPrice(tier.price, tier.period)}
                    </span>
                    {tier.price > 0 && (
                      <span className="text-ink-muted dark:text-gray-400 text-xs md:text-sm">USD</span>
                    )}
                  </div>
                  <p className="text-xs md:text-sm text-ink-muted dark:text-gray-400 mt-1">
                    {tier.price === 0
                      ? "Sin tarjeta de crédito"
                      : tier.id === "yearly"
                        ? `Ahorras $${YEARLY_SAVINGS} vs. mensual`
                        : "Cancela cuando quieras"}
                  </p>
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-4 flex-1">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <svg
                        className="w-4 h-4 flex-shrink-0 text-completado mt-0.5"
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
                      <span className="text-xs md:text-sm text-ink dark:text-gray-300 leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  variant={tier.popular ? "primary" : "outline"}
                  depth={tier.popular ? "bottom" : "full"}
                  size="none"
                  rounded2xl
                  onClick={() => handleSelectPlan(tier.id)}
                  className={`w-full py-4 text-sm md:text-base mt-auto ${
                    !tier.popular ? "text-primary border-primary hover:bg-primary/5 dark:hover:bg-primary/10" : ""
                  }`}
                >
                  {tier.cta}
                </Button>
              </Card>
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

type Currency = "USD" | "MXN" | "ARS" | "COP";

export default function PricingSection() {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("USD");
  const router = useRouter();

  const exchangeRates = {
    USD: 1,
    MXN: 17,
    ARS: 350,
    COP: 4000,
  };

  const formatPrice = (usdPrice: number) => {
    const price = Math.round(usdPrice * exchangeRates[selectedCurrency]);
    const symbols = {
      USD: "$",
      MXN: "$",
      ARS: "$",
      COP: "$",
    };
    return `${symbols[selectedCurrency]}${price.toLocaleString()}`;
  };

  const handleStripeCheckout = async (priceId: string) => {
    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to create checkout session"
        );
      }

      const { sessionUrl } = await response.json();
      router.push(sessionUrl);
    } catch (error) {
      console.error("Error during Stripe checkout:", error);
      alert(
        "Hubo un problema al iniciar el proceso de pago con Stripe. Por favor, inténtalo de nuevo."
      );
    }
  };

  const tiers = [
    {
      id: "basic",
      name: "Básico",
      price: 147,
      originalPrice: 297,
      popular: false,
      description: "Acceso completo para aprender a tu ritmo",
      features: [
        "Acceso a los 400+ micro-videos",
        "Biblioteca completa de 12 módulos",
        "Aprendizaje auto-guiado",
        "Actualizaciones de contenido",
        "Acceso de por vida",
      ],
      cta: "Empezar Ahora",
      stripePriceId: "price_12345_basic",
    },
    {
      id: "personalized",
      name: "Personalizado con IA",
      price: 247,
      originalPrice: 497,
      popular: true,
      description: "La experiencia completa con IA personalizada",
      features: [
        "✨ Todo lo del plan Básico",
        "🤖 Ruta personalizada con Claude AI",
        "🎯 Análisis de tu proyecto específico",
        "📊 Checkpoints adaptativos",
        "🏆 Sistema de badges y progreso",
        "⚡ Actualizaciones prioritarias",
      ],
      cta: "Empieza Tu Ruta Personalizada",
      stripePriceId: "price_12345_personalized",
    },
    {
      id: "premium",
      name: "Premium",
      price: 497,
      originalPrice: 997,
      description: "Experiencia completa + mentoría 1-on-1",
      features: [
        "Todo lo del plan Personalizado",
        "Mentoría grupal semanal en vivo",
        "2 sesiones 1-on-1 de revisión",
        "Comunidad privada Premium",
        "Certificado verificado",
        "Acceso anticipado a contenido nuevo",
      ],
      cta: "Inversión Total",
      stripePriceId: "price_12345_premium",
    },
  ];

  return (
    <section id="pricing" className="relative bg-gradient-to-b from-gray-50 to-white min-h-screen flex items-center justify-center py-20 pt-24 md:pt-28 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-[#1472FF]/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center text-gray-900 mb-4 leading-tight">
            Invierte En Ti
          </h2>
          <p className="text-xl md:text-2xl text-center text-gray-600 mb-16 max-w-3xl mx-auto font-light">
            Construye tu proyecto en semanas, no meses.
            <br />
            <span className="text-[#1472FF] font-semibold">Garantía de devolución de 30 días si no estás satisfecho.</span>
          </p>
        </motion.div>

        {/* Currency Selector */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mb-12"
        >
          <div className="bg-white rounded-full p-1 flex space-x-1 shadow-lg border border-gray-200">
            {(["USD", "MXN", "ARS", "COP"] as Currency[]).map((currency) => (
              <button
                key={currency}
                onClick={() => setSelectedCurrency(currency)}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  selectedCurrency === currency
                    ? "bg-gradient-to-r from-[#1472FF] to-[#5BA0FF] text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {currency}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-4 md:gap-6 max-w-7xl mx-auto">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * (index + 3) }}
              className={`relative rounded-2xl p-5 md:p-6 transition-all duration-300 flex flex-col ${
                tier.popular
                  ? "bg-gradient-to-br from-[#1472FF]/10 to-[#5BA0FF]/10 border-2 border-[#1472FF] shadow-xl"
                  : "bg-white shadow-md hover:shadow-lg border border-gray-200"
              }`}
            >
              {/* Popular Badge */}
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-[#1472FF] to-[#5BA0FF] text-white px-4 py-1 rounded-full text-xs font-bold shadow-md">
                    🔥 MÁS POPULAR
                  </div>
                </div>
              )}

              {/* Title */}
              <div className="mb-2">
                <h3 className="text-lg md:text-xl font-bold text-gray-900">{tier.name}</h3>
              </div>

              <p className="text-gray-600 text-xs mb-3">{tier.description}</p>

              {/* Pricing */}
              <div className="mb-3">
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-gray-400 line-through text-lg">
                    {formatPrice(tier.originalPrice)}
                  </span>
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">
                    50% OFF
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#1472FF] to-[#5BA0FF] bg-clip-text text-transparent">
                    {formatPrice(tier.price)}
                  </span>
                  <span className="text-gray-500 text-xs md:text-sm">{selectedCurrency}</span>
                </div>
                <p className="text-xs md:text-sm text-gray-500 mt-1">Pago único • Acceso de por vida</p>
              </div>

              {/* Features */}
              <ul className="space-y-1.5 mb-3 flex-1 max-h-[200px] overflow-y-auto pr-1">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
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
                    <span className="text-xs md:text-sm text-gray-700 leading-snug">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => handleStripeCheckout(tier.stripePriceId)}
                className={`w-full py-3 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 mt-auto ${
                  tier.popular
                    ? "bg-gradient-to-r from-[#1472FF] to-[#5BA0FF] text-white shadow-md hover:shadow-lg"
                    : "bg-white text-[#1472FF] border-2 border-[#1472FF] hover:bg-[#1472FF]/10"
                }`}
              >
                {tier.cta} →
              </button>

            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

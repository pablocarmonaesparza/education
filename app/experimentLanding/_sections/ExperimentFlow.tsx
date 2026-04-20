"use client";

import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import SectionHeader from "@/components/ui/SectionHeader";
import { Body, Headline } from "@/components/ui/Typography";
import Divider from "@/components/ui/Divider";
import { depthStructure } from "@/lib/design-tokens";

/**
 * Flujo en 3 pasos (inspirado en "ticker steps" + "process" del Webflow).
 * Usa Card del DS, con un número en la esquina y línea conectora animada.
 */

const STEPS = [
  {
    step: "01",
    title: "describe tu idea",
    description:
      "cuéntanos qué quieres construir. una frase basta: \"quiero un bot que responda whatsapp\".",
    icon: "📝",
  },
  {
    step: "02",
    title: "itera arma tu curso",
    description:
      "en 60 segundos generamos videos, retos y un plan de aprendizaje personalizado para ti.",
    icon: "⚙️",
  },
  {
    step: "03",
    title: "construye en paralelo",
    description:
      "aprende haciéndolo. el tutor ia te acompaña y tu proyecto avanza contigo.",
    icon: "🚀",
  },
];

export default function ExperimentFlow() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          title="cómo funciona el laboratorio"
          subtitle="3 pasos, cero fricción"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 relative">
          {/* Línea conectora desktop */}
          <div
            aria-hidden
            className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20"
          />

          {STEPS.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative"
            >
              <Card variant="neutral" padding="lg" className="h-full relative">
                {/* Number badge */}
                <div
                  className={`absolute -top-4 left-4 flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white text-sm font-extrabold border-primary-dark ${depthStructure}`}
                >
                  {step.step}
                </div>

                <div className="text-4xl mt-2" aria-hidden>
                  {step.icon}
                </div>
                <Headline className="mt-3 !text-primary">
                  {step.title}
                </Headline>
                <Body className="mt-2">{step.description}</Body>
              </Card>
            </motion.div>
          ))}
        </div>

        <Divider className="mt-16" />
      </div>
    </section>
  );
}

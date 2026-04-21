"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import Card from "@/components/ui/Card";
import SectionHeader from "@/components/ui/SectionHeader";
import IconButton from "@/components/ui/IconButton";
import { Body, Headline } from "@/components/ui/Typography";

const FAQ = [
  {
    q: "¿qué pasa si no sé por dónde empezar?",
    a: "describe tu idea en una frase y el generador te propone una ruta completa. siempre puedes ajustar el alcance después.",
  },
  {
    q: "¿el tutor ia conoce mi proyecto?",
    a: "sí. cada curso trae su propio contexto (tu descripción, tu avance, tus retos). el tutor responde desde ahí.",
  },
  {
    q: "¿puedo crear más de un curso?",
    a: "por supuesto. cada idea es un laboratorio independiente; puedes tener varios proyectos activos al mismo tiempo.",
  },
  {
    q: "¿cuánto cuesta experimentar?",
    a: "el primer curso es gratis. a partir de ahí revisa la sección de precios en la landing principal.",
  },
];

export default function ExperimentFAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <SectionHeader
          title="dudas frecuentes"
          subtitle="resolvamos lo básico antes de empezar"
        />

        <div className="space-y-3">
          {FAQ.map((item, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={item.q}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <Card
                  variant="neutral"
                  padding="lg"
                  interactive
                  onClick={() => setOpen(isOpen ? null : i)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setOpen(isOpen ? null : i);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center justify-between gap-4">
                    <Headline className="!normal-case !text-base !tracking-normal">
                      {item.q}
                    </Headline>
                    <IconButton
                      as="div"
                      variant="ghost"
                      aria-label={isOpen ? "Colapsar" : "Expandir"}
                    >
                      <motion.span
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="inline-flex"
                      >
                        <PlusIcon />
                      </motion.span>
                    </IconButton>
                  </div>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <Body className="mt-3">{item.a}</Body>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PlusIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        d="M12 4v16m8-8H4"
      />
    </svg>
  );
}

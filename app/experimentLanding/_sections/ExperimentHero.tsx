"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Button, Title, Subtitle, Caption, Tag } from "@/components/ui";
import Card from "@/components/ui/Card";

const ROTATING_WORDS = [
  "cursos",
  "retos",
  "proyectos",
  "tutoriales",
  "experimentos",
];

export default function ExperimentHero() {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setWordIndex((i) => (i + 1) % ROTATING_WORDS.length);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      id="experiment-hero"
      className="relative min-h-[90vh] flex flex-col items-center justify-center pt-24 pb-20 px-4 sm:px-6 lg:px-8"
    >
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mb-6"
      >
        <Tag variant="primary">laboratorio itera · v0.1</Tag>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
        className="text-center max-w-4xl mx-auto"
      >
        <Title
          as="h1"
          className="!text-4xl md:!text-6xl lg:!text-7xl !leading-[1.05]"
        >
          construye{" "}
          <span className="relative inline-block align-baseline">
            <AnimatePresence mode="wait">
              <motion.span
                key={ROTATING_WORDS[wordIndex]}
                initial={{ y: 30, opacity: 0, rotateX: -60 }}
                animate={{ y: 0, opacity: 1, rotateX: 0 }}
                exit={{ y: -30, opacity: 0, rotateX: 60 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="inline-block text-primary"
                style={{ transformStyle: "preserve-3d" }}
              >
                {ROTATING_WORDS[wordIndex]}
              </motion.span>
            </AnimatePresence>
          </span>
          <br />
          a la medida de tu idea
        </Title>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-6 max-w-2xl text-center"
      >
        <Subtitle as="p" className="!font-normal">
          itera convierte cualquier proyecto en una ruta de aprendizaje
          interactiva — con videos, retos y un tutor ia que piensa contigo.
        </Subtitle>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mt-10 flex flex-col sm:flex-row gap-3 items-center"
      >
        <Button
          variant="primary"
          size="xl"
          depth="bottom"
          href="/#hero"
          rounded2xl
        >
          generar mi curso
        </Button>
        <Button
          variant="outline"
          size="xl"
          href="#experiment-bento"
          rounded2xl
        >
          ver experimentos
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.7 }}
        className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl"
      >
        <HeroChip icon="⚡" label="generado en 60s" />
        <HeroChip icon="🎯" label="100% personalizado" />
        <HeroChip icon="🔁" label="itera contigo" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Caption className="!text-ink-muted dark:!text-gray-400">
            desliza para explorar ↓
          </Caption>
        </motion.div>
      </motion.div>
    </section>
  );
}

function HeroChip({ icon, label }: { icon: string; label: string }) {
  return (
    <Card variant="neutral" padding="md" className="flex items-center gap-3">
      <span className="text-2xl" aria-hidden>
        {icon}
      </span>
      <span className="text-sm font-bold text-ink dark:text-gray-300">
        {label}
      </span>
    </Card>
  );
}

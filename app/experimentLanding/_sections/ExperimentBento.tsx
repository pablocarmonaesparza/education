"use client";

import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import SectionHeader from "@/components/ui/SectionHeader";
import { Body, Caption, Headline, Title } from "@/components/ui/Typography";
import Tag from "@/components/ui/Tag";
import ProgressBar from "@/components/ui/ProgressBar";

const FADE_UP = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.06, ease: "easeOut" as const },
  }),
};

export default function ExperimentBento() {
  return (
    <section
      id="experiment-bento"
      className="relative py-24 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          title="un laboratorio para cada idea"
          subtitle="explora los experimentos que puedes lanzar hoy"
        />

        <div className="mt-10 grid grid-cols-1 md:grid-cols-6 gap-4">
          <motion.div
            className="md:col-span-4 md:row-span-2"
            custom={0}
            variants={FADE_UP}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            <Card variant="primary" padding="lg" className="h-full">
              <Tag
                variant="outline"
                className="!bg-white/10 !text-white !border-white/30"
              >
                curso ia
              </Tag>
              <Title
                as="h3"
                className="mt-4 !text-3xl md:!text-4xl !text-white !leading-tight"
              >
                describe tu proyecto.
                <br />
                itera arma el curso.
              </Title>
              <Body className="mt-4 !text-white/85">
                videos generados a la medida, ejercicios prácticos y un tutor
                ia que te acompaña paso a paso.
              </Body>
              <div className="mt-6">
                <Caption className="!text-white/70 mb-2">
                  progreso promedio en semana 1
                </Caption>
                <ProgressBar value={72} color="white" />
              </div>
            </Card>
          </motion.div>

          <motion.div
            className="md:col-span-2"
            custom={1}
            variants={FADE_UP}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            <Card variant="neutral" padding="lg" className="h-full">
              <span className="text-3xl" aria-hidden>
                🎬
              </span>
              <Headline className="!text-primary mt-3">video ia</Headline>
              <Body className="mt-1">
                lecciones cortas con voz y pizarra sincronizadas.
              </Body>
            </Card>
          </motion.div>

          <motion.div
            className="md:col-span-2"
            custom={2}
            variants={FADE_UP}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            <Card variant="neutral" padding="lg" className="h-full">
              <span className="text-3xl" aria-hidden>
                🧪
              </span>
              <Headline className="!text-primary mt-3">retos</Headline>
              <Body className="mt-1">
                ejercicios con feedback instantáneo del tutor.
              </Body>
            </Card>
          </motion.div>

          <motion.div
            className="md:col-span-3"
            custom={3}
            variants={FADE_UP}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            <Card variant="neutral" padding="lg" className="h-full">
              <div className="flex items-start gap-4">
                <span className="text-3xl" aria-hidden>
                  🤖
                </span>
                <div>
                  <Headline className="!text-primary">tutor ia</Headline>
                  <Body className="mt-1">
                    pregúntale cualquier cosa sobre tu curso; conoce tu
                    proyecto y tu progreso.
                  </Body>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            className="md:col-span-3"
            custom={4}
            variants={FADE_UP}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            <Card variant="completado" padding="lg" className="h-full">
              <Headline className="!text-white">100% personalizado</Headline>
              <Body className="mt-1 !text-white/90">
                cada curso nace de tu descripción. nada de contenido genérico.
              </Body>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

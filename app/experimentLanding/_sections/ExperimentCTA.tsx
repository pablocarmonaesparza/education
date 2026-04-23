"use client";

import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import { Button } from "@/components/ui";
import { Body, Title } from "@/components/ui/Typography";

export default function ExperimentCTA() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <Card variant="primary" padding="lg" className="text-center !py-12">
            <span className="text-5xl inline-block" aria-hidden>
              🧪
            </span>
            <Title
              as="h2"
              className="mt-4 !text-3xl md:!text-4xl !text-white !leading-tight"
            >
              tu próximo experimento
              <br />
              empieza ahora
            </Title>
            <Body className="mt-4 !text-white/85 max-w-xl mx-auto">
              describe tu idea y en menos de un minuto tendrás un curso
              hecho a tu medida listo para construir en paralelo.
            </Body>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Button
                variant="outline"
                size="xl"
                href="/#hero"
                rounded2xl
                className="!bg-white !text-primary-dark !border-white !border-b-white/70"
              >
                empezar gratis
              </Button>
              <Button
                variant="ghost"
                size="xl"
                href="/componentes"
                className="!text-white hover:!bg-white/10"
              >
                ver componentes
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

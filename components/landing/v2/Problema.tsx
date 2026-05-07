'use client';

/**
 * Problema v2 — porteado del prototipo claude-design (sections-1.jsx:730-799).
 * Layout asimétrico: stat hero grande en card primary + 2 stats stack lateral.
 */

import { motion } from 'framer-motion';
import { Headline, Title, Body, Caption } from '@/components/ui/Typography';
import Card from '@/components/ui/Card';
import Tag from '@/components/ui/Tag';

export default function Problema() {
  return (
    <section id="problema" className="bg-gray-50 dark:bg-gray-900 py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mb-12"
        >
          <Headline>el problema</Headline>
          <Title className="mt-3">
            <span className="block">
              ya viste 5 cursos de <span className="normal-case">IA</span>
            </span>
            <span className="block">terminaste 0</span>
            <span className="block">tu trabajo sigue igual</span>
          </Title>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-[1.4fr_1fr]">
          {/* hero stat — fill primary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-2xl border-2 border-primary-dark bg-primary text-white p-9 flex flex-col justify-between min-h-[320px]"
            style={{ borderBottomWidth: 4 }}
          >
            <Tag
              variant="neutral"
              className="self-start !bg-white/15 !text-white !border-white/40"
            >
              stat principal
            </Tag>
            <div>
              <div
                className="font-display font-extrabold text-white tracking-tight leading-[0.9] lowercase"
                style={{ fontSize: 'clamp(80px, 12vw, 160px)' }}
              >
                13%
              </div>
              <Body className="!text-blue-100 mt-4 max-w-md text-lg">
                Tasa de finalización promedio en cursos online de IA. La mayoría abandona
                antes del 20%.
              </Body>
              <Caption className="!text-white/60 block mt-3">
                Fuente: HarvardX/MITx HEPN study (2019), n=565k usuarios.
              </Caption>
            </div>
          </motion.div>

          {/* stack lateral · 2 cards neutrales */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col gap-5"
          >
            <Card variant="neutral" className="flex gap-5 items-center flex-1">
              <div className="font-display font-extrabold text-primary tracking-tight leading-none flex-shrink-0 text-6xl">
                40+
              </div>
              <div>
                <Body className="!text-ink dark:!text-white font-semibold">
                  Horas de contenido pasivo por curso de IA
                </Body>
                <Caption className="block mt-1.5">
                  Promedio en specializations de Coursera, edX, Udemy
                </Caption>
              </div>
            </Card>
            <Card variant="neutral" className="flex gap-5 items-center flex-1">
              <div className="font-display font-extrabold text-completado-dark tracking-tight leading-none flex-shrink-0 text-6xl">
                70%
              </div>
              <div>
                <Body className="!text-ink dark:!text-white font-semibold">
                  De capacitaciones corporativas no se aplican al trabajo
                </Body>
                <Caption className="block mt-1.5">
                  Brinkerhoff, training transfer research
                </Caption>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

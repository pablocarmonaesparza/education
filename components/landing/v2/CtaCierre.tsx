'use client';

/**
 * CtaCierre v2 — porteado del prototipo claude-design (sections-2.jsx:400-425).
 * Sección dark de cierre: mascota mood="win" + display + body + 2 CTAs.
 */

import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Mascota from './Mascota';

export default function CtaCierre() {
  return (
    <section
      className="relative py-20 md:py-28 text-white"
      style={{ background: '#0a1628' }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 flex justify-center"
        >
          <Mascota size={120} mood="win" />
        </motion.div>
        <h2
          className="font-display font-extrabold lowercase text-white mx-auto"
          style={{
            fontSize: 'clamp(40px, 7vw, 72px)',
            maxWidth: 880,
            lineHeight: 0.95,
            letterSpacing: '-0.03em',
          }}
        >
          la <span className="normal-case">IA</span> no se va a aplicar sola a tu trabajo
        </h2>
        <p
          className="mx-auto"
          style={{
            color: '#cbd5e1',
            marginTop: 20,
            maxWidth: 540,
            fontSize: 19,
            lineHeight: 1.5,
          }}
        >
          Empieza gratis. Sin tarjeta. Cuando termines las primeras 20, decides si sigues
          con pro.
        </p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-wrap justify-center gap-3"
        >
          <Button
            href="/auth/signup"
            variant="primary"
            size="lg"
            className="whitespace-nowrap"
          >
            empezar gratis
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="whitespace-nowrap"
            style={{
              background: 'transparent',
              color: '#fff',
              borderColor: '#cbd5e1',
            }}
          >
            ver demo (30 seg)
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

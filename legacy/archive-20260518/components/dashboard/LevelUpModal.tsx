'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import ConfettiEffect from '@/components/shared/ConfettiEffect';
import { depth } from '@/lib/design-tokens';

/**
 * Modal celebratorio cuando `user_stats.level` sube. Se muestra una vez
 * post-`handleLessonComplete` cuando el nuevo nivel es mayor que el previo.
 *
 * Diseño B2B (ver docs/memory/decision_gamification_duolingo_b2b.md): look
 * Duolingo pero sin mecánicas virales — es un momento de logro, no una
 * interrupción. Un solo botón de continuar, dismissable por click fuera.
 */
export default function LevelUpModal({
  open,
  level,
  totalXp,
  onClose,
}: {
  open: boolean;
  level: number;
  totalXp: number;
  onClose: () => void;
}) {
  // Cierra con Esc
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <ConfettiEffect count={80} pattern="radial" shape="circle" />

          <motion.div
            key="backdrop"
            className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          <div
            className="fixed inset-0 z-[95] flex items-center justify-center p-4 pointer-events-none"
            role="dialog"
            aria-modal="true"
            aria-labelledby="levelup-title"
          >
            <motion.div
              className="relative pointer-events-auto bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full p-8 text-center shadow-2xl"
              initial={{ scale: 0.7, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 22,
                delay: 0.1,
              }}
            >
              <motion.div
                className="text-7xl mb-4"
                aria-hidden="true"
                initial={{ scale: 0.3, rotate: -10 }}
                animate={{ scale: [0.3, 1.2, 1], rotate: [-10, 5, 0] }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                🎉
              </motion.div>

              <motion.p
                className="text-xs font-bold uppercase tracking-wider text-primary"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                subiste de nivel
              </motion.p>

              <motion.h2
                id="levelup-title"
                className="text-3xl md:text-4xl font-extrabold text-ink dark:text-white mt-1 lowercase"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
              >
                nivel {level}
              </motion.h2>

              <motion.div
                className="flex items-center justify-center gap-3 mt-5"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65, duration: 0.3 }}
              >
                <div
                  className={`w-16 h-16 rounded-full bg-primary ${depth.border} ${depth.bottom} border-primary-dark flex items-center justify-center text-white text-2xl font-bold`}
                  aria-hidden="true"
                >
                  {level}
                </div>
                <div className="text-left">
                  <p className="text-xs text-ink-muted dark:text-gray-400">XP total</p>
                  <p className="text-xl font-bold text-ink dark:text-white tabular-nums">
                    {totalXp.toLocaleString('es-MX')}
                  </p>
                </div>
              </motion.div>

              <motion.p
                className="text-sm text-ink-muted dark:text-gray-400 mt-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.3 }}
              >
                sigue así — cada lección te acerca a dominar tu proyecto con IA.
              </motion.p>

              <motion.div
                className="mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.95, duration: 0.3 }}
              >
                <Button variant="primary" size="lg" onClick={onClose}>
                  continuar
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

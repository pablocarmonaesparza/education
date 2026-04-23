'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import ConfettiEffect from '@/components/shared/ConfettiEffect';
import type { BadgeRarity } from '@/lib/gamification';

/**
 * Modal celebratorio al desbloquear un badge. Se muestra una vez
 * post-lesson, después del level-up modal (si hubo) — los dos coexisten
 * en queue vía `pendingLevelUp` + `pendingBadges` en el dashboard.
 *
 * Diseño análogo al LevelUpModal: confetti + emoji grande + título + XP
 * delta + botón continuar. Dismissable por Esc o click fuera.
 */
export default function BadgeUnlockModal({
  open,
  badge,
  onClose,
}: {
  open: boolean;
  badge: {
    id: string;
    name: string;
    description: string;
    emoji: string;
    rarity: BadgeRarity;
    xpReward: number;
  } | null;
  onClose: () => void;
}) {
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
      {open && badge && (
        <>
          <ConfettiEffect count={70} pattern="radial" shape="circle" />

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
            aria-labelledby="badge-unlock-title"
          >
            <motion.div
              className="relative pointer-events-auto bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full p-8 text-center shadow-2xl"
              initial={{ scale: 0.7, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22, delay: 0.1 }}
            >
              <motion.p
                className={`text-xs font-bold uppercase tracking-wider ${rarityLabelClass(badge.rarity)}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                {rarityLabel(badge.rarity)} desbloqueado
              </motion.p>

              <motion.div
                className="text-7xl md:text-8xl leading-none mt-3"
                aria-hidden="true"
                initial={{ scale: 0.3, rotate: -10 }}
                animate={{ scale: [0.3, 1.2, 1], rotate: [-10, 5, 0] }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                {badge.emoji}
              </motion.div>

              <motion.h2
                id="badge-unlock-title"
                className="text-2xl md:text-3xl font-extrabold text-ink dark:text-white mt-4 lowercase"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
              >
                {badge.name}
              </motion.h2>

              <motion.p
                className="text-sm text-ink-muted dark:text-gray-400 mt-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.65, duration: 0.3 }}
              >
                {badge.description}
              </motion.p>

              {badge.xpReward > 0 && (
                <motion.div
                  className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, duration: 0.3, type: 'spring', stiffness: 400 }}
                >
                  <span aria-hidden="true">⚡</span>
                  <span className="tabular-nums">
                    +{badge.xpReward.toLocaleString('es-MX')} XP
                  </span>
                </motion.div>
              )}

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

function rarityLabel(rarity: BadgeRarity): string {
  switch (rarity) {
    case 'rare': return 'logro raro';
    case 'epic': return 'logro épico';
    case 'legendary': return 'logro legendario';
    default: return 'logro';
  }
}

function rarityLabelClass(rarity: BadgeRarity): string {
  switch (rarity) {
    case 'rare': return 'text-primary';
    case 'epic': return 'text-purple-600 dark:text-purple-400';
    case 'legendary': return 'text-amber-600 dark:text-amber-400';
    default: return 'text-ink-muted';
  }
}

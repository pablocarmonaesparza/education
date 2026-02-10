'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Title, Caption, Button, StatCard, ProgressBar } from '@/components/ui';
import ConfettiEffect from './ConfettiEffect';

/* ───────────────────────────────────────────────────────────
   Demo Completion — Lesson complete celebration screen
   Shows confetti, stats summary, and CTAs.
   ─────────────────────────────────────────────────────────── */

interface DemoCompletionProps {
  xpEarned: number;
  totalExercises: number;
  correctAnswers: number;
  maxStreak: number;
}

export default function DemoCompletion({
  xpEarned,
  totalExercises,
  correctAnswers,
  maxStreak,
}: DemoCompletionProps) {
  const accuracy = totalExercises > 0
    ? Math.round((correctAnswers / totalExercises) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="max-w-lg mx-auto px-4 py-8 text-center space-y-8"
    >
      <ConfettiEffect />

      {/* Trophy icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
        className="w-24 h-24 mx-auto rounded-full bg-[#22c55e] border-2 border-b-4 border-[#16a34a] flex items-center justify-center"
      >
        <span className="text-4xl">🏆</span>
      </motion.div>

      {/* Title */}
      <div className="space-y-2">
        <Title>leccion completada!</Title>
        <Caption>has terminado la leccion demo de chatbots con ia</Caption>
      </div>

      {/* Full progress bar */}
      <ProgressBar value={100} color="green" size="lg" />

      {/* Stats grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-3 gap-3"
      >
        <StatCard icon="⭐" value={xpEarned} label="xp ganados" color="blue" />
        <StatCard icon="🎯" value={`${accuracy}%`} label="precision" color="green" />
        <StatCard icon="🔥" value={maxStreak} label="mejor racha" color="orange" />
      </motion.div>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-3 pt-4"
      >
        <Button
          variant="primary"
          size="xl"
          rounded2xl
          href="/auth/signup"
          className="w-full"
        >
          Crear cuenta gratis
        </Button>
        <Button
          variant="outline"
          size="lg"
          rounded2xl
          href="/"
          className="w-full"
        >
          Volver al inicio
        </Button>
      </motion.div>
    </motion.div>
  );
}

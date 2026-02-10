'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Headline, Body, Tag, Button } from '@/components/ui';

/* ───────────────────────────────────────────────────────────
   Feedback Banner — Slide-up correct/incorrect overlay
   Follows Duolingo's immediate-feedback pattern.
   Includes its own "Continuar" button (covers the footer).
   ─────────────────────────────────────────────────────────── */

interface FeedbackBannerProps {
  isCorrect: boolean;
  explanation: string;
  xpEarned: number;
  onContinue: () => void;
}

export default function FeedbackBanner({
  isCorrect,
  explanation,
  xpEarned,
  onContinue,
}: FeedbackBannerProps) {
  return (
    <motion.div
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 350 }}
      className={`fixed bottom-0 left-0 right-0 z-50 px-4 pt-5 pb-8 rounded-t-2xl shadow-lg ${
        isCorrect
          ? 'bg-[#22c55e]'
          : 'bg-red-50 dark:bg-red-950 border-t-2 border-red-200 dark:border-red-800'
      }`}
    >
      <div className="max-w-xl mx-auto space-y-2">
        {/* Title */}
        <div className="flex items-center gap-3">
          <span className="text-2xl">{isCorrect ? '✅' : '❌'}</span>
          <Headline
            className={
              isCorrect
                ? '!text-white'
                : '!text-red-700 dark:!text-red-300'
            }
          >
            {isCorrect ? 'correcto!' : 'incorrecto'}
          </Headline>
          {isCorrect && (
            <Tag variant="success" className="ml-auto">
              +{xpEarned} XP
            </Tag>
          )}
        </div>

        {/* Explanation */}
        <Body
          className={
            isCorrect
              ? '!text-white/90'
              : '!text-red-800 dark:!text-red-200'
          }
        >
          {explanation}
        </Body>

        {/* Continue button */}
        <div className="pt-3">
          <Button
            variant={isCorrect ? 'completado' : 'outline'}
            size="xl"
            rounded2xl
            className="w-full"
            onClick={onContinue}
          >
            Continuar
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

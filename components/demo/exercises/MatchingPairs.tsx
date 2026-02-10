'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Caption, Subtitle, Headline, Body, Tag } from '@/components/ui';
import { depthBase } from '@/lib/design-tokens';
import type { MatchingPairsExercise } from '@/lib/demo-data';

/* ───────────────────────────────────────────────────────────
   Matching Pairs Exercise
   User taps a concept (left), then taps its matching
   definition (right) to create a pair.
   ─────────────────────────────────────────────────────────── */

interface MatchingPairsProps {
  exercise: MatchingPairsExercise;
  /** Maps left pair id → right pair id for matched pairs. */
  matches: Record<string, string>;
  submitted: boolean;
  onMatch: (pairId: string) => void;
}

export default function MatchingPairs({
  exercise,
  matches,
  submitted,
  onMatch,
}: MatchingPairsProps) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [wrongFlash, setWrongFlash] = useState<string | null>(null);

  // Shuffled right-side items (stable via useMemo would be ideal but
  // the parent controls the exercise so we just show them in original order)
  const matchedLeftIds = new Set(Object.keys(matches));
  const matchedRightIds = new Set(Object.values(matches));

  const handleLeftClick = useCallback(
    (pairId: string) => {
      if (submitted || matchedLeftIds.has(pairId)) return;
      setSelectedLeft((prev) => (prev === pairId ? null : pairId));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [submitted, matchedLeftIds.size]
  );

  const handleRightClick = useCallback(
    (pairId: string) => {
      if (submitted || matchedRightIds.has(pairId) || !selectedLeft) return;

      if (selectedLeft === pairId) {
        // Correct match
        onMatch(pairId);
        setSelectedLeft(null);
      } else {
        // Wrong match — flash red briefly
        setWrongFlash(pairId);
        setTimeout(() => setWrongFlash(null), 600);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [submitted, matchedRightIds.size, selectedLeft, onMatch]
  );

  // Shuffle right column once for the exercise
  const rightItems = React.useMemo(() => {
    const shuffled = [...exercise.pairs];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise.id]);

  return (
    <motion.div
      key={exercise.id}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
      className="max-w-xl mx-auto px-4 py-6 space-y-6"
    >
      {/* Concept intro */}
      <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-900 bg-gray-50 dark:bg-gray-900 p-4">
        <Caption>{exercise.conceptIntro}</Caption>
      </div>

      {/* Prompt */}
      <Subtitle as="h2">{exercise.prompt}</Subtitle>

      {/* Match counter */}
      <Tag variant={matchedLeftIds.size === exercise.pairs.length ? 'success' : 'primary'}>
        {matchedLeftIds.size}/{exercise.pairs.length} pares conectados
      </Tag>

      {/* Two columns */}
      <div className="grid grid-cols-2 gap-3">
        {/* Left column — concepts */}
        <div className="space-y-2">
          <Headline>concepto</Headline>
          {exercise.pairs.map((pair) => {
            const isMatched = matchedLeftIds.has(pair.id);
            const isSelected = selectedLeft === pair.id;

            return (
              <button
                key={pair.id}
                type="button"
                onClick={() => handleLeftClick(pair.id)}
                disabled={submitted || isMatched}
                className={`w-full text-left rounded-2xl p-3 ${depthBase} transition-all duration-150 ${
                  isMatched
                    ? 'border-[#22c55e] bg-green-50 dark:bg-green-900/20 cursor-default'
                    : isSelected
                      ? 'border-[#1472FF] bg-[#1472FF]/10 scale-[1.02]'
                      : 'border-gray-200 dark:border-gray-700 hover:border-[#1472FF]/50 cursor-pointer'
                }`}
              >
                <Body className={`text-sm font-bold ${isMatched ? '!text-[#22c55e]' : ''}`}>
                  {pair.left}
                </Body>
              </button>
            );
          })}
        </div>

        {/* Right column — definitions */}
        <div className="space-y-2">
          <Headline>definicion</Headline>
          {rightItems.map((pair) => {
            const isMatched = matchedRightIds.has(pair.id);
            const isWrongFlashing = wrongFlash === pair.id;

            return (
              <motion.button
                key={pair.id}
                type="button"
                onClick={() => handleRightClick(pair.id)}
                disabled={submitted || isMatched || !selectedLeft}
                animate={
                  isWrongFlashing
                    ? { x: [0, -6, 6, -4, 4, 0] }
                    : {}
                }
                transition={{ duration: 0.4 }}
                className={`w-full text-left rounded-2xl p-3 ${depthBase} transition-colors duration-150 ${
                  isMatched
                    ? 'border-[#22c55e] bg-green-50 dark:bg-green-900/20 cursor-default'
                    : isWrongFlashing
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : selectedLeft && !isMatched
                        ? 'border-gray-200 dark:border-gray-700 hover:border-[#1472FF]/50 cursor-pointer'
                        : 'border-gray-200 dark:border-gray-700 cursor-default opacity-70'
                }`}
              >
                <Caption className={`${isMatched ? '!text-[#22c55e]' : ''}`}>
                  {pair.right}
                </Caption>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Caption, Subtitle, Headline, Body, Button, Divider, Card } from '@/components/ui';
import { depthBase } from '@/lib/design-tokens';
import type { ReorderExercise as ReorderExerciseType } from '@/lib/demo-data';

/* ───────────────────────────────────────────────────────────
   Reorder Exercise — Tap-to-sequence (mobile-first)
   User taps items from a pool to build the correct sequence.
   ─────────────────────────────────────────────────────────── */

interface ReorderExerciseProps {
  exercise: ReorderExerciseType;
  /** IDs in the user's chosen order. */
  currentOrder: string[];
  submitted: boolean;
  onAddItem: (itemId: string) => void;
  onRemoveItem: (itemId: string) => void;
}

export default function ReorderExercise({
  exercise,
  currentOrder,
  submitted,
  onAddItem,
  onRemoveItem,
}: ReorderExerciseProps) {
  const placedSet = new Set(currentOrder);
  const availableItems = exercise.items.filter(
    (item) => !placedSet.has(item.id)
  );

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

      {/* Sequence slots */}
      <div className="space-y-2">
        <Headline>tu secuencia</Headline>
        {exercise.items.map((_, index) => {
          const placedId = currentOrder[index] ?? null;
          const placedItem = placedId
            ? exercise.items.find((i) => i.id === placedId)
            : null;

          // Check correctness after submission
          const isCorrectPosition =
            submitted && placedId === exercise.correctOrder[index];
          const isWrongPosition =
            submitted && placedId && placedId !== exercise.correctOrder[index];

          return (
            <div key={index} className="flex items-center gap-3">
              {/* Step number */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  isCorrectPosition
                    ? 'bg-[#22c55e] text-white'
                    : isWrongPosition
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-[#4b4b4b] dark:text-gray-300'
                }`}
              >
                {index + 1}
              </div>

              {/* Slot content */}
              <AnimatePresence mode="wait">
                {placedItem ? (
                  <motion.button
                    key={placedItem.id}
                    layoutId={`reorder-${placedItem.id}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    type="button"
                    onClick={() => !submitted && onRemoveItem(placedItem.id)}
                    disabled={submitted}
                    className={`flex-1 text-left rounded-2xl p-3 ${depthBase} ${
                      submitted ? 'cursor-default' : 'cursor-pointer'
                    } ${
                      isCorrectPosition
                        ? 'border-[#22c55e] bg-green-50 dark:bg-green-900/20'
                        : isWrongPosition
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          : 'border-[#1472FF] bg-[#1472FF]/5 dark:bg-[#1472FF]/10'
                    }`}
                  >
                    <Body>{placedItem.text}</Body>
                  </motion.button>
                ) : (
                  <motion.div
                    key={`empty-${index}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 h-12 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center"
                  >
                    <span className="text-xs text-[#777777] dark:text-gray-400">
                      Toca una opcion para colocarla aqui
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Divider */}
      {availableItems.length > 0 && <Divider title="opciones disponibles" />}

      {/* Available items pool */}
      {availableItems.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {availableItems.map((item) => (
            <motion.div
              key={item.id}
              layoutId={`reorder-${item.id}`}
            >
              <Button
                variant="outline"
                size="md"
                rounded2xl
                onClick={() => onAddItem(item.id)}
                disabled={submitted}
              >
                {item.text}
              </Button>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

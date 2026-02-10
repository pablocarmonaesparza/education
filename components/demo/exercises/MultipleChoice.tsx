'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Caption, Subtitle, Body, Tag } from '@/components/ui';
import { depthBase } from '@/lib/design-tokens';
import type { MultipleChoiceExercise } from '@/lib/demo-data';

/* ───────────────────────────────────────────────────────────
   Multiple Choice Exercise
   Follows ExperimentExerciseDemoSection pattern but uses
   design tokens for depth instead of manual classes.
   ─────────────────────────────────────────────────────────── */

interface MultipleChoiceProps {
  exercise: MultipleChoiceExercise;
  selectedId: string | null;
  submitted: boolean;
  onSelect: (id: string) => void;
}

const optionLetters = ['A', 'B', 'C', 'D'];

export default function MultipleChoice({
  exercise,
  selectedId,
  submitted,
  onSelect,
}: MultipleChoiceProps) {
  return (
    <motion.div
      key={exercise.id}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
      className="max-w-xl mx-auto px-4 py-6 space-y-6"
    >
      {/* Concept intro (Mimo pattern) */}
      <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-900 bg-gray-50 dark:bg-gray-900 p-4">
        <Caption>{exercise.conceptIntro}</Caption>
      </div>

      {/* Exercise type label */}
      <Tag variant="outline">Opcion multiple</Tag>

      {/* Prompt */}
      <Subtitle as="h2">{exercise.prompt}</Subtitle>

      {/* Options */}
      <div className="space-y-3">
        {exercise.options.map((option, index) => {
          const isSelected = selectedId === option.id;
          const isCorrectOption = option.id === exercise.correctId;

          // State-based color classes
          const stateClass = submitted
            ? isCorrectOption
              ? 'border-[#22c55e] bg-green-50 dark:bg-green-900/20'
              : isSelected
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                : 'border-gray-200 dark:border-gray-700'
            : isSelected
              ? 'border-[#1472FF] bg-[#1472FF]/10'
              : 'border-gray-200 dark:border-gray-700 hover:border-[#1472FF]/50';

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => !submitted && onSelect(option.id)}
              disabled={submitted}
              className={`w-full text-left rounded-2xl p-4 ${depthBase} ${
                submitted ? 'cursor-default' : 'cursor-pointer'
              } ${stateClass}`}
            >
              <div className="flex items-start gap-3">
                {/* Letter badge */}
                <span
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    submitted && isCorrectOption
                      ? 'bg-[#22c55e] text-white'
                      : submitted && isSelected && !isCorrectOption
                        ? 'bg-red-500 text-white'
                        : isSelected
                          ? 'bg-[#1472FF] text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-[#4b4b4b] dark:text-gray-300'
                  }`}
                >
                  {optionLetters[index]}
                </span>

                {/* Option text */}
                <Body className="pt-0.5">{option.text}</Body>
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

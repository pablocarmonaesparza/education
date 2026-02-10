'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Caption, Headline, Button, Tag } from '@/components/ui';
import type { FillInBlankExercise } from '@/lib/demo-data';

/* ───────────────────────────────────────────────────────────
   Fill-in-Blank (Code Completion) Exercise
   Shows code with blanks. User selects from a word bank.
   Dark theme for code area (Mimo pattern).
   ─────────────────────────────────────────────────────────── */

interface FillInBlankProps {
  exercise: FillInBlankExercise;
  /** Maps blank id → selected answer (e.g. { BLANK_0: 'system' }) */
  answers: Record<string, string>;
  submitted: boolean;
  onFillBlank: (blankId: string, value: string) => void;
  onClearBlank: (blankId: string) => void;
}

export default function FillInBlank({
  exercise,
  answers,
  submitted,
  onFillBlank,
  onClearBlank,
}: FillInBlankProps) {
  // Build the word bank: correct answers + distractors, shuffled once
  const wordBank = useMemo(() => {
    const correctWords = exercise.blanks.map((b) => b.correctAnswer);
    const all = [...correctWords, ...exercise.distractors];
    // Stable shuffle
    return all.sort(() => 0.5 - Math.random());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise.id]);

  // Which words are currently used (placed in blanks)
  const usedWords = new Set(Object.values(answers));

  // Find the first empty blank to fill
  const nextEmptyBlankId = exercise.blanks.find(
    (b) => !answers[b.id]
  )?.id ?? null;

  // Render a code line, replacing ___BLANK_X___ with interactive slots
  function renderCodeLine(line: string, lineIndex: number) {
    const parts = line.split(/(___BLANK_\d+___)/g);

    return (
      <div key={lineIndex} className="leading-relaxed">
        {parts.map((part, partIndex) => {
          const blankMatch = part.match(/___BLANK_(\d+)___/);
          if (!blankMatch) {
            return (
              <span key={partIndex} className="text-gray-300">
                {part}
              </span>
            );
          }

          const blankId = `BLANK_${blankMatch[1]}`;
          const answer = answers[blankId];
          const blank = exercise.blanks.find((b) => b.id === blankId);
          const isCorrect = submitted && answer === blank?.correctAnswer;
          const isWrong = submitted && answer && answer !== blank?.correctAnswer;
          const isActive = !submitted && blankId === nextEmptyBlankId;

          return (
            <button
              key={partIndex}
              type="button"
              onClick={() => !submitted && answer && onClearBlank(blankId)}
              disabled={submitted || !answer}
              className={`inline-block min-w-[100px] mx-1 px-2 py-0.5 rounded text-sm font-mono font-bold transition-all duration-150 ${
                answer
                  ? isCorrect
                    ? 'bg-[#22c55e]/30 border border-[#22c55e] text-[#22c55e]'
                    : isWrong
                      ? 'bg-red-500/30 border border-red-500 text-red-400'
                      : 'bg-[#1472FF]/30 border border-[#1472FF] text-[#1472FF] cursor-pointer hover:bg-[#1472FF]/20'
                  : isActive
                    ? 'bg-gray-700 border-2 border-dashed border-[#1472FF] text-gray-500 animate-pulse'
                    : 'bg-gray-700 border border-dashed border-gray-500 text-gray-500'
              }`}
            >
              {answer || '___'}
            </button>
          );
        })}
      </div>
    );
  }

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

      {/* Exercise type label */}
      <Tag variant="outline">Completa el codigo</Tag>

      <Headline>rellena los espacios vacios</Headline>

      {/* Code block — forced dark theme (Mimo IDE style) */}
      <div className="rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-900">
        {/* File tab bar */}
        <div className="bg-gray-800 px-4 py-2 flex items-center gap-2 border-b border-gray-700">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="ml-2 text-xs text-gray-400 font-mono">
            chatbot.{exercise.language === 'javascript' ? 'js' : exercise.language}
          </span>
        </div>

        {/* Code area */}
        <div className="bg-gray-900 p-4 overflow-x-auto">
          <pre className="text-sm font-mono whitespace-pre-wrap">
            {exercise.codeLines.map((line, i) => renderCodeLine(line, i))}
          </pre>
        </div>
      </div>

      {/* Word bank */}
      <div className="space-y-2">
        <Headline>opciones</Headline>
        <div className="flex flex-wrap gap-2">
          {wordBank.map((word) => {
            const isUsed = usedWords.has(word);

            return (
              <Button
                key={word}
                variant={isUsed ? 'ghost' : 'outline'}
                size="sm"
                rounded2xl
                disabled={isUsed || submitted}
                onClick={() => {
                  if (nextEmptyBlankId && !isUsed) {
                    onFillBlank(nextEmptyBlankId, word);
                  }
                }}
                className={isUsed ? 'opacity-40 line-through' : ''}
              >
                {word}
              </Button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

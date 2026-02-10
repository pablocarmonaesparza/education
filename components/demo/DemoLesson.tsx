'use client';

import React, { useReducer, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import DemoHeader from './DemoHeader';
import DemoFooter from './DemoFooter';
import DemoIntro from './DemoIntro';
import DemoCompletion from './DemoCompletion';
import FeedbackBanner from './FeedbackBanner';
import MultipleChoice from './exercises/MultipleChoice';
import FillInBlank from './exercises/FillInBlank';
import ReorderExercise from './exercises/ReorderExercise';
import MatchingPairs from './exercises/MatchingPairs';
import {
  demoLesson,
  type Exercise,
  type MultipleChoiceExercise,
  type FillInBlankExercise,
  type ReorderExercise as ReorderExerciseType,
  type MatchingPairsExercise,
} from '@/lib/demo-data';

/* ───────────────────────────────────────────────────────────
   DemoLesson — Main orchestrator
   State machine: INTRO → EXERCISE[0..N] → COMPLETION
   Layout: 3-zone (header / scrollable content / footer)
   ─────────────────────────────────────────────────────────── */

const MAX_LIVES = 3;

// ── State ──

interface LessonState {
  phase: 'intro' | 'exercise' | 'completion';
  currentIndex: number;
  lives: number;
  xpEarned: number;
  correctCount: number;
  currentStreak: number;
  maxStreak: number;

  // Per-exercise interaction state
  /** Selected option for multiple-choice. */
  selectedOptionId: string | null;
  /** Filled blanks for fill-in-blank. */
  filledBlanks: Record<string, string>;
  /** Ordered item IDs for reorder. */
  reorderSequence: string[];
  /** Matched pairs for matching. */
  matchedPairs: Record<string, string>;

  // Feedback
  hasSubmitted: boolean;
  isCorrect: boolean | null;
  showFeedback: boolean;
}

const initialState: LessonState = {
  phase: 'intro',
  currentIndex: 0,
  lives: MAX_LIVES,
  xpEarned: 0,
  correctCount: 0,
  currentStreak: 0,
  maxStreak: 0,
  selectedOptionId: null,
  filledBlanks: {},
  reorderSequence: [],
  matchedPairs: {},
  hasSubmitted: false,
  isCorrect: null,
  showFeedback: false,
};

// ── Actions ──

type Action =
  | { type: 'START_LESSON' }
  | { type: 'SELECT_OPTION'; id: string }
  | { type: 'FILL_BLANK'; blankId: string; value: string }
  | { type: 'CLEAR_BLANK'; blankId: string }
  | { type: 'REORDER_ADD'; itemId: string }
  | { type: 'REORDER_REMOVE'; itemId: string }
  | { type: 'MATCH_PAIR'; pairId: string }
  | { type: 'SUBMIT' }
  | { type: 'CONTINUE' }
  | { type: 'SKIP' };

// ── Validation helpers ──

function validateExercise(exercise: Exercise, state: LessonState): boolean {
  switch (exercise.type) {
    case 'multiple-choice':
      return state.selectedOptionId === (exercise as MultipleChoiceExercise).correctId;

    case 'fill-in-blank': {
      const fib = exercise as FillInBlankExercise;
      return fib.blanks.every((b) => state.filledBlanks[b.id] === b.correctAnswer);
    }

    case 'reorder': {
      const reorder = exercise as ReorderExerciseType;
      return (
        state.reorderSequence.length === reorder.correctOrder.length &&
        state.reorderSequence.every((id, i) => id === reorder.correctOrder[i])
      );
    }

    case 'matching-pairs': {
      const mp = exercise as MatchingPairsExercise;
      return Object.keys(state.matchedPairs).length === mp.pairs.length;
    }

    default:
      return false;
  }
}

function canSubmitExercise(exercise: Exercise, state: LessonState): boolean {
  switch (exercise.type) {
    case 'multiple-choice':
      return state.selectedOptionId !== null;

    case 'fill-in-blank': {
      const fib = exercise as FillInBlankExercise;
      return fib.blanks.every((b) => !!state.filledBlanks[b.id]);
    }

    case 'reorder': {
      const reorder = exercise as ReorderExerciseType;
      return state.reorderSequence.length === reorder.items.length;
    }

    case 'matching-pairs': {
      const mp = exercise as MatchingPairsExercise;
      return Object.keys(state.matchedPairs).length === mp.pairs.length;
    }

    default:
      return false;
  }
}

// ── Reducer ──

function lessonReducer(state: LessonState, action: Action): LessonState {
  switch (action.type) {
    case 'START_LESSON':
      return {
        ...initialState,
        phase: 'exercise',
        lives: MAX_LIVES,
      };

    case 'SELECT_OPTION':
      if (state.hasSubmitted) return state;
      return { ...state, selectedOptionId: action.id };

    case 'FILL_BLANK':
      if (state.hasSubmitted) return state;
      return {
        ...state,
        filledBlanks: { ...state.filledBlanks, [action.blankId]: action.value },
      };

    case 'CLEAR_BLANK':
      if (state.hasSubmitted) return state;
      const { [action.blankId]: _, ...remainingBlanks } = state.filledBlanks;
      return { ...state, filledBlanks: remainingBlanks };

    case 'REORDER_ADD':
      if (state.hasSubmitted) return state;
      return {
        ...state,
        reorderSequence: [...state.reorderSequence, action.itemId],
      };

    case 'REORDER_REMOVE':
      if (state.hasSubmitted) return state;
      return {
        ...state,
        reorderSequence: state.reorderSequence.filter((id) => id !== action.itemId),
      };

    case 'MATCH_PAIR':
      if (state.hasSubmitted) return state;
      return {
        ...state,
        matchedPairs: { ...state.matchedPairs, [action.pairId]: action.pairId },
      };

    case 'SUBMIT': {
      const exercise = demoLesson.exercises[state.currentIndex];
      if (!exercise) return state;

      const correct = validateExercise(exercise, state);
      const newStreak = correct ? state.currentStreak + 1 : 0;

      return {
        ...state,
        hasSubmitted: true,
        isCorrect: correct,
        showFeedback: true,
        lives: correct ? state.lives : Math.max(0, state.lives - 1),
        xpEarned: correct ? state.xpEarned + exercise.xpReward : state.xpEarned,
        correctCount: correct ? state.correctCount + 1 : state.correctCount,
        currentStreak: newStreak,
        maxStreak: Math.max(state.maxStreak, newStreak),
      };
    }

    case 'CONTINUE': {
      const nextIndex = state.currentIndex + 1;
      const isLessonComplete = nextIndex >= demoLesson.exercises.length;

      return {
        ...state,
        phase: isLessonComplete ? 'completion' : 'exercise',
        currentIndex: isLessonComplete ? state.currentIndex : nextIndex,
        // Reset per-exercise state
        selectedOptionId: null,
        filledBlanks: {},
        reorderSequence: [],
        matchedPairs: {},
        hasSubmitted: false,
        isCorrect: null,
        showFeedback: false,
      };
    }

    case 'SKIP': {
      const nextIndex = state.currentIndex + 1;
      const isLessonComplete = nextIndex >= demoLesson.exercises.length;

      return {
        ...state,
        phase: isLessonComplete ? 'completion' : 'exercise',
        currentIndex: isLessonComplete ? state.currentIndex : nextIndex,
        currentStreak: 0,
        // Reset per-exercise state
        selectedOptionId: null,
        filledBlanks: {},
        reorderSequence: [],
        matchedPairs: {},
        hasSubmitted: false,
        isCorrect: null,
        showFeedback: false,
      };
    }

    default:
      return state;
  }
}

// ── Component ──

export default function DemoLesson() {
  const [state, dispatch] = useReducer(lessonReducer, initialState);

  const currentExercise: Exercise | undefined =
    state.phase === 'exercise'
      ? demoLesson.exercises[state.currentIndex]
      : undefined;

  const progress =
    state.phase === 'intro'
      ? 0
      : state.phase === 'completion'
        ? 100
        : Math.round((state.currentIndex / demoLesson.exercises.length) * 100);

  const canSubmit =
    currentExercise && !state.hasSubmitted
      ? canSubmitExercise(currentExercise, state)
      : false;

  // ── Callbacks ──
  const handleSubmit = useCallback(() => dispatch({ type: 'SUBMIT' }), []);
  const handleContinue = useCallback(() => dispatch({ type: 'CONTINUE' }), []);
  const handleSkip = useCallback(() => dispatch({ type: 'SKIP' }), []);
  const handleStart = useCallback(() => dispatch({ type: 'START_LESSON' }), []);

  // ── Render exercise ──
  function renderExercise(exercise: Exercise) {
    switch (exercise.type) {
      case 'multiple-choice':
        return (
          <MultipleChoice
            exercise={exercise as MultipleChoiceExercise}
            selectedId={state.selectedOptionId}
            submitted={state.hasSubmitted}
            onSelect={(id) => dispatch({ type: 'SELECT_OPTION', id })}
          />
        );

      case 'fill-in-blank':
        return (
          <FillInBlank
            exercise={exercise as FillInBlankExercise}
            answers={state.filledBlanks}
            submitted={state.hasSubmitted}
            onFillBlank={(blankId, value) =>
              dispatch({ type: 'FILL_BLANK', blankId, value })
            }
            onClearBlank={(blankId) =>
              dispatch({ type: 'CLEAR_BLANK', blankId })
            }
          />
        );

      case 'reorder':
        return (
          <ReorderExercise
            exercise={exercise as ReorderExerciseType}
            currentOrder={state.reorderSequence}
            submitted={state.hasSubmitted}
            onAddItem={(itemId) =>
              dispatch({ type: 'REORDER_ADD', itemId })
            }
            onRemoveItem={(itemId) =>
              dispatch({ type: 'REORDER_REMOVE', itemId })
            }
          />
        );

      case 'matching-pairs':
        return (
          <MatchingPairs
            exercise={exercise as MatchingPairsExercise}
            matches={state.matchedPairs}
            submitted={state.hasSubmitted}
            onMatch={(pairId) =>
              dispatch({ type: 'MATCH_PAIR', pairId })
            }
          />
        );

      default:
        return null;
    }
  }

  return (
    <div className="h-dvh flex flex-col bg-white dark:bg-gray-800 relative">
      {/* ── Header ── */}
      <DemoHeader
        progress={progress}
        lives={state.lives}
        maxLives={MAX_LIVES}
      />

      {/* ── Main scrollable area ── */}
      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {state.phase === 'intro' && (
            <DemoIntro key="intro" lesson={demoLesson} />
          )}

          {state.phase === 'exercise' && currentExercise && (
            <React.Fragment key={`exercise-${state.currentIndex}`}>
              {renderExercise(currentExercise)}
            </React.Fragment>
          )}

          {state.phase === 'completion' && (
            <DemoCompletion
              key="completion"
              xpEarned={state.xpEarned}
              totalExercises={demoLesson.exercises.length}
              correctAnswers={state.correctCount}
              maxStreak={state.maxStreak}
            />
          )}
        </AnimatePresence>
      </main>

      {/* ── Footer (hidden when feedback banner is showing) ── */}
      {!state.showFeedback && (
        <DemoFooter
          phase={state.phase}
          canSubmit={canSubmit}
          hasSubmitted={state.hasSubmitted}
          isCorrect={state.isCorrect}
          onSubmit={handleSubmit}
          onContinue={handleContinue}
          onSkip={handleSkip}
          onStart={handleStart}
        />
      )}

      {/* ── Feedback overlay ── */}
      <AnimatePresence>
        {state.showFeedback && state.hasSubmitted && currentExercise && (
          <FeedbackBanner
            key="feedback"
            isCorrect={state.isCorrect ?? false}
            explanation={currentExercise.explanation}
            xpEarned={currentExercise.xpReward}
            onContinue={handleContinue}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

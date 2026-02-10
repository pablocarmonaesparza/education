'use client';

import React from 'react';
import { Button } from '@/components/ui';

/* ───────────────────────────────────────────────────────────
   Demo Footer — Fixed bottom action bar (Duolingo pattern)
   [Saltar]                        [Comprobar / Continuar ▸]
   ─────────────────────────────────────────────────────────── */

interface DemoFooterProps {
  phase: 'intro' | 'exercise' | 'completion';
  /** User has selected an answer and can submit. */
  canSubmit: boolean;
  /** Answer has been submitted (showing feedback). */
  hasSubmitted: boolean;
  /** Result of the submitted answer. */
  isCorrect: boolean | null;
  onSubmit: () => void;
  onContinue: () => void;
  onSkip: () => void;
  onStart: () => void;
}

export default function DemoFooter({
  phase,
  canSubmit,
  hasSubmitted,
  isCorrect,
  onSubmit,
  onContinue,
  onSkip,
  onStart,
}: DemoFooterProps) {
  // ── Intro phase ──
  if (phase === 'intro') {
    return (
      <div className="px-4 py-4 border-t-2 border-gray-200 dark:border-gray-900 bg-white dark:bg-gray-800">
        <Button
          variant="primary"
          size="xl"
          rounded2xl
          className="w-full"
          onClick={onStart}
        >
          Comenzar leccion
        </Button>
      </div>
    );
  }

  // ── Completion phase — no footer ──
  if (phase === 'completion') {
    return null;
  }

  // ── Exercise phase ──
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-4 border-t-2 border-gray-200 dark:border-gray-900 bg-white dark:bg-gray-800">
      {/* Skip button — only shown before submitting */}
      {!hasSubmitted ? (
        <Button variant="ghost" size="md" rounded2xl onClick={onSkip}>
          Saltar
        </Button>
      ) : (
        <div />
      )}

      {/* Main action button */}
      {!hasSubmitted ? (
        <Button
          variant="primary"
          size="xl"
          rounded2xl
          onClick={onSubmit}
          disabled={!canSubmit}
        >
          Comprobar
        </Button>
      ) : (
        <Button
          variant={isCorrect ? 'completado' : 'outline'}
          size="xl"
          rounded2xl
          onClick={onContinue}
        >
          Continuar
        </Button>
      )}
    </div>
  );
}

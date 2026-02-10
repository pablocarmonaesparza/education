'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { IconButton, ProgressBar } from '@/components/ui';

/* ───────────────────────────────────────────────────────────
   Demo Header — Fixed top bar (Duolingo pattern)
   [✕ close]  ████████░░░░░░  ❤️❤️🤍
   ─────────────────────────────────────────────────────────── */

interface DemoHeaderProps {
  /** 0-100 progress through the lesson. */
  progress: number;
  /** Current lives remaining. */
  lives: number;
  /** Maximum lives. */
  maxLives: number;
  /** Called when close button is tapped. */
  onClose?: () => void;
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="22"
      height="20"
      viewBox="0 0 22 20"
      fill={filled ? '#ef4444' : 'none'}
      stroke={filled ? '#ef4444' : '#d1d5db'}
      strokeWidth="2"
      className={`transition-all duration-300 ${filled ? 'scale-100' : 'scale-90 opacity-40'}`}
    >
      <path d="M11 18.5C11 18.5 1 13.5 1 6.5C1 3.46 3.46 1 6.5 1C8.24 1 9.78 1.81 11 3.08C12.22 1.81 13.76 1 15.5 1C18.54 1 21 3.46 21 6.5C21 13.5 11 18.5 11 18.5Z" />
    </svg>
  );
}

export default function DemoHeader({
  progress,
  lives,
  maxLives,
  onClose,
}: DemoHeaderProps) {
  const router = useRouter();

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.push('/');
    }
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b-2 border-gray-200 dark:border-gray-900 bg-white dark:bg-gray-800">
      {/* Close button */}
      <IconButton
        variant="ghost"
        aria-label="Cerrar leccion"
        onClick={handleClose}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M4 4L14 14M14 4L4 14" />
        </svg>
      </IconButton>

      {/* Progress bar */}
      <div className="flex-1">
        <ProgressBar value={progress} size="md" />
      </div>

      {/* Hearts / lives */}
      <div className="flex items-center gap-1">
        {Array.from({ length: maxLives }).map((_, i) => (
          <HeartIcon key={i} filled={i < lives} />
        ))}
      </div>
    </div>
  );
}

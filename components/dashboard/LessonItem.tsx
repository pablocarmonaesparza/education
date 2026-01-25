'use client';

interface LessonItemProps {
  lessonNumber: number;
  totalLessons: number;
  duration: string;
  category: string;
  title: string;
  isCompleted?: boolean;
  isCurrent?: boolean;
  onClick?: () => void;
}

export default function LessonItem({
  lessonNumber,
  totalLessons,
  duration,
  category,
  title,
  isCompleted = false,
  isCurrent = false,
  onClick,
}: LessonItemProps) {
  // Determine colors based on state
  const getBorderColor = () => {
    if (isCompleted) return '#22c55e'; // green-500
    if (isCurrent) return '#1472FF'; // blue
    return '#e5e7eb'; // gray-200
  };

  const getBottomBorderColor = () => {
    if (isCompleted) return '#16a34a'; // green-600
    if (isCurrent) return '#0E5FCC'; // darker blue
    return '#d1d5db'; // gray-300
  };

  const getRightPanelBg = () => {
    if (isCompleted) return 'bg-[#22c55e]'; // green-500
    if (isCurrent) return 'bg-[#1472FF]'; // blue
    return 'bg-gray-100 dark:bg-gray-950';
  };

  const getRightPanelText = () => {
    if (isCompleted || isCurrent) return 'text-white';
    return 'text-gray-600 dark:text-gray-300';
  };

  const getStatusBadge = () => {
    if (isCompleted) {
      return (
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white uppercase tracking-wide">
          Completado
        </span>
      );
    }
    if (isCurrent) {
      return (
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white uppercase tracking-wide">
          Continuar
        </span>
      );
    }
    return (
      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase tracking-wide">
        Pendiente
      </span>
    );
  };

  const getCheckIcon = () => {
    if (isCompleted) {
      return (
        <svg className="w-12 h-12 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      );
    }
    if (isCurrent) {
      return (
        <svg className="w-12 h-12 text-[#1472FF]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      );
    }
    return (
      <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z" />
      </svg>
    );
  };

  return (
    <button
      onClick={onClick}
      className="w-full text-left transition-all duration-150 hover:scale-[1.01] active:scale-[0.99]"
    >
      {/* Outer wrapper for depth effect - the shadow/depth is OUTSIDE the border */}
      <div
        className="rounded-2xl"
        style={{
          boxShadow: `0 3px 0 0 ${getBottomBorderColor()}`,
        }}
      >
        {/* Main card with border */}
        <div
          className="flex overflow-hidden rounded-2xl bg-white dark:bg-gray-950"
          style={{
            border: `3px solid ${getBorderColor()}`,
          }}
        >
          {/* Left Panel - White with video info */}
          <div className="flex-shrink-0 w-40 sm:w-48 p-4 flex flex-col bg-white dark:bg-gray-950">
            {/* Top row - Counter left, Duration right */}
            <div className="flex items-center justify-between mb-4">
              {/* Lesson counter - plain text */}
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-bold text-gray-700 dark:text-gray-200">{lessonNumber}</span>
                <span> de </span>
                <span>{totalLessons}</span>
              </div>

              {/* Duration badge */}
              <div className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-950 text-sm font-medium text-gray-600 dark:text-gray-300">
                {duration}
              </div>
            </div>

            {/* Status icon - centered */}
            <div className="flex-1 flex items-center justify-center">
              {getCheckIcon()}
            </div>
          </div>

          {/* Right Panel - Colored with content info */}
          <div className={`flex-1 p-4 sm:p-5 flex flex-col justify-center ${getRightPanelBg()} ${getRightPanelText()}`}>
            {/* Status badge */}
            <div className="mb-2">
              {getStatusBadge()}
            </div>

            {/* Category */}
            <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isCompleted || isCurrent ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
              {category}
            </p>

            {/* Title */}
            <h3 className={`text-base sm:text-lg font-bold leading-tight ${isCompleted || isCurrent ? 'text-white' : 'text-gray-800 dark:text-white'}`}>
              {title}
            </h3>
          </div>
        </div>
      </div>
    </button>
  );
}

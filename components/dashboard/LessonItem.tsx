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
  title,
  isCompleted = false,
  isCurrent = false,
  onClick,
}: LessonItemProps) {
  // Determine background and text colors based on state
  const getCardBg = () => {
    if (isCompleted) return 'bg-[#22c55e]';
    if (isCurrent) return 'bg-[#1472FF]';
    return 'bg-white dark:bg-gray-900';
  };

  const getTextColor = () => {
    if (isCompleted || isCurrent) return 'text-white';
    return 'text-gray-800 dark:text-white';
  };

  const getSecondaryTextColor = () => {
    if (isCompleted || isCurrent) return 'text-white/80';
    return 'text-gray-500 dark:text-gray-400';
  };

  const getDurationBg = () => {
    if (isCompleted || isCurrent) return 'bg-white/20 border-white/30';
    return 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
  };

  // Determine border classes based on state
  const getBorderClasses = () => {
    if (isCompleted) {
      return 'border-[#22c55e] shadow-[0_3px_0_0_#16a34a]';
    }
    if (isCurrent) {
      return 'border-[#1472FF] shadow-[0_3px_0_0_#0E5FCC]';
    }
    return 'lesson-item-border-pending';
  };

  return (
    <button
      onClick={onClick}
      className="w-full text-left transition-all duration-150 hover:scale-[1.01] active:scale-[0.99]"
    >
      {/* Simplified card */}
      <div
        className={`rounded-2xl p-4 border-[3px] ${getCardBg()} ${getBorderClasses()}`}
      >
        {/* Top row: Lesson number left, Duration right */}
        <div className="flex items-center justify-between mb-2">
          <div className={`text-sm ${getSecondaryTextColor()}`}>
            <span className={`font-bold ${getTextColor()}`}>{lessonNumber}</span>
            <span> de </span>
            <span>{totalLessons}</span>
          </div>

          <div className={`px-3 py-1 rounded-lg border border-b-2 text-sm font-medium ${getDurationBg()} ${isCompleted || isCurrent ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
            {duration}
          </div>
        </div>

        {/* Title */}
        <h3 className={`text-base sm:text-lg font-bold leading-tight ${getTextColor()}`}>
          {title}
        </h3>
      </div>
    </button>
  );
}

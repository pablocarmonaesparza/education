'use client';

import { depthStructure, depthActiveGroup } from '@/lib/design-tokens';

interface LessonItemProps {
  lessonNumber: number;
  totalLessons: number;
  title: string;
  description?: string;
  isCompleted?: boolean;
  isCurrent?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onClick?: () => void;
}

export default function LessonItem({
  lessonNumber,
  totalLessons,
  title,
  description,
  isCompleted = false,
  isCurrent = false,
  isExpanded = false,
  onToggleExpand,
  onClick,
}: LessonItemProps) {

  // Determine background and text colors based on state
  const getCardBg = () => {
    if (isCompleted) return 'bg-[#22c55e]';
    if (isCurrent) return 'bg-[#1472FF]';
    return 'bg-white dark:bg-gray-800';
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
    return 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600';
  };

  const getExpandButtonColor = () => {
    // When item is green (completed) or blue (current), use navy blue
    if (isCompleted || isCurrent) return 'text-[var(--background)]';
    // Otherwise use accent blue
    return 'text-[#1472FF]';
  };

  const getBorderClasses = () => {
    if (isCompleted) {
      return `${depthStructure} border-[#16a34a] ${depthActiveGroup}`;
    }
    if (isCurrent) {
      return `${depthStructure} border-[#0E5FCC] ${depthActiveGroup}`;
    }
    return `${depthStructure} border-gray-200 dark:border-gray-900 border-b-gray-300 dark:border-b-gray-900 ${depthActiveGroup}`;
  };

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand?.();
  };

  return (
    <button
      onClick={onClick}
      className="group text-left transition-all duration-150"
    >
      {/* Simplified card - standard depth via design tokens */}
      <div
        className={`w-[220px] rounded-2xl p-4 transition-all duration-150 ${getCardBg()} ${getBorderClasses()}`}
      >
        {/* Title at top - larger */}
        <h3 className={`text-lg font-bold leading-tight mb-2 ${getTextColor()}`}>
          {title}
        </h3>

        {/* Expandable "Why watch this video?" button - only for current video */}
        {isCurrent && (
          <div className="mb-3">
            <div
              onClick={handleExpandClick}
              className={`text-xs font-bold flex items-center gap-1 ${getExpandButtonColor()} hover:opacity-80 transition-opacity cursor-pointer`}
            >
              <span>¿Para qué ver este video?</span>
              <svg 
                className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            {isExpanded && description && (
              <p className={`text-xs mt-2 leading-relaxed whitespace-pre-line ${getSecondaryTextColor()}`}>
                {description}
              </p>
            )}
          </div>
        )}

        {/* Bottom row: Lesson number in right-aligned pill */}
        <div className="flex items-center justify-end">
          <div
            aria-label={`Lección ${lessonNumber} de ${totalLessons}`}
            className={`px-2 py-0.5 rounded-lg border border-b-2 text-xs font-medium ${getDurationBg()} ${isCompleted || isCurrent ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}
          >
            <span aria-hidden="true">{lessonNumber}/{totalLessons}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

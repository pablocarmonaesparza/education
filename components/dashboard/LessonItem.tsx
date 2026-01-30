'use client';

interface LessonItemProps {
  lessonNumber: number;
  totalLessons: number;
  duration: string;
  category: string;
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
  duration,
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

  // Standard depth: border-2 + border-b-4 (canonical button style). Colors vary by state.
  const getBorderClasses = () => {
    if (isCompleted) {
      return 'border-2 border-b-4 border-[#16a34a] group-active:border-b-2 group-active:mt-[2px]';
    }
    if (isCurrent) {
      return 'border-2 border-b-4 border-[#0E5FCC] group-active:border-b-2 group-active:mt-[2px]';
    }
    return 'border-2 border-b-4 border-gray-200 dark:border-gray-700 border-b-gray-300 dark:border-b-gray-700 group-active:border-b-2 group-active:mt-[2px]';
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
      {/* Simplified card - standard depth (border-b-4) like canonical buttons */}
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
              <p className={`text-xs mt-2 leading-relaxed ${getSecondaryTextColor()}`}>
                {description}
              </p>
            )}
          </div>
        )}

        {/* Bottom row: Lesson number left, Duration right */}
        <div className="flex items-center justify-between">
          <div className={`text-sm ${getSecondaryTextColor()}`}>
            <span className={`font-bold ${getTextColor()}`}>{lessonNumber}</span>
            <span> de </span>
            <span>{totalLessons}</span>
          </div>

          <div className={`px-2 py-0.5 rounded-lg border border-b-2 text-xs font-medium ${getDurationBg()} ${isCompleted || isCurrent ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
            {duration}
          </div>
        </div>
      </div>
    </button>
  );
}

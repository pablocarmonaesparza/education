'use client';

interface RetoItemProps {
  title: string;
  type: string;
  difficulty: number;
  timeMinutes: number;
  isCompleted?: boolean;
  isUnlocked?: boolean;
  onClick?: () => void;
}

export default function RetoItem({
  title,
  type,
  difficulty,
  timeMinutes,
  isCompleted = false,
  isUnlocked = false,
  onClick,
}: RetoItemProps) {
  const isLocked = !isUnlocked && !isCompleted;

  const getCardBg = () => {
    if (isCompleted) return 'bg-[#22c55e]';
    if (isLocked) return 'bg-gray-100 dark:bg-gray-700';
    return 'bg-white dark:bg-gray-800';
  };

  const getBorderClasses = () => {
    if (isCompleted) {
      return 'border-2 border-b-4 border-[#16a34a] group-active:border-b-2 group-active:mt-[2px]';
    }
    if (isLocked) {
      return 'border-2 border-b-4 border-gray-200 dark:border-gray-600 border-b-gray-300 dark:border-b-gray-600';
    }
    return 'border-2 border-b-4 border-gray-200 dark:border-gray-900 border-b-gray-300 dark:border-b-gray-900 group-active:border-b-2 group-active:mt-[2px]';
  };

  const getTextColor = () => {
    if (isCompleted) return 'text-white';
    if (isLocked) return 'text-[#777777] dark:text-gray-400';
    return 'text-[#4b4b4b] dark:text-white';
  };

  const getSecondaryTextColor = () => {
    if (isCompleted) return 'text-white/80';
    if (isLocked) return 'text-[#777777]/60 dark:text-gray-500';
    return 'text-[#777777] dark:text-gray-400';
  };

  const getIconBg = () => {
    if (isCompleted) return 'bg-white/20';
    if (isLocked) return 'bg-gray-200 dark:bg-gray-600';
    return 'bg-[#1472FF]/10';
  };

  const getIconColor = () => {
    if (isCompleted) return 'text-white';
    if (isLocked) return 'text-[#777777] dark:text-gray-400';
    return 'text-[#1472FF]';
  };

  const getTypeBg = () => {
    if (isCompleted) return 'bg-white/20 border-white/30 text-white';
    if (isLocked) return 'bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-[#777777] dark:text-gray-400';
    return 'bg-[#1472FF]/10 border-[#1472FF]/20 text-[#1472FF]';
  };

  return (
    <button
      onClick={isLocked ? undefined : onClick}
      className={`group text-left transition-all duration-150 ${isLocked ? 'cursor-not-allowed' : ''}`}
      disabled={isLocked}
    >
      <div
        className={`w-[220px] rounded-2xl p-4 transition-all duration-150 ${getCardBg()} ${getBorderClasses()}`}
      >
        {/* Icon + Label row */}
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${getIconBg()}`}>
            {isCompleted ? (
              <svg className={`w-3.5 h-3.5 ${getIconColor()}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : isLocked ? (
              <svg className={`w-3.5 h-3.5 ${getIconColor()}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            ) : (
              <svg className={`w-3.5 h-3.5 ${getIconColor()}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
          </div>
          <span className={`text-xs font-bold uppercase tracking-wide ${getSecondaryTextColor()}`}>
            {isCompleted ? 'reto completado' : isLocked ? 'reto bloqueado' : 'reto'}
          </span>
        </div>

        {/* Title */}
        <h3 className={`text-lg font-bold leading-tight mb-3 ${getTextColor()}`}>
          {title}
        </h3>

        {/* Bottom row: Type pill left, difficulty + time right */}
        <div className="flex items-center justify-between">
          <div className={`px-2 py-0.5 rounded-lg border border-b-2 text-xs font-medium ${getTypeBg()}`}>
            {type}
          </div>

          <div className="flex items-center gap-2">
            {/* Difficulty dots */}
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${
                    i <= difficulty
                      ? isCompleted ? 'bg-white/80' : isLocked ? 'bg-gray-300 dark:bg-gray-500' : 'bg-[#1472FF]'
                      : isCompleted ? 'bg-white/30' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
            <span className={`text-xs ${getSecondaryTextColor()}`}>{timeMinutes}m</span>
          </div>
        </div>
      </div>
    </button>
  );
}

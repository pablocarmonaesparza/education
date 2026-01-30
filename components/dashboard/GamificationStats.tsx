'use client';

import { CardFlat } from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';

interface GamificationStatsProps {
  currentXP: number;
  level: number;
  streak: number;
  weeklyGoal: number;
  weeklyProgress: number;
}

export default function GamificationStats({
  currentXP = 150,
  level = 3,
  streak = 5,
  weeklyGoal = 10,
  weeklyProgress = 4,
}: GamificationStatsProps) {
  // XP needed for each level (increases exponentially)
  const xpForLevel = (lvl: number) => lvl * 100;
  const xpToNextLevel = xpForLevel(level + 1);
  const xpProgress = (currentXP / xpToNextLevel) * 100;

  // Level titles
  const levelTitles = [
    'Novato',
    'Aprendiz',
    'Explorador',
    'Practicante',
    'Especialista',
    'Experto',
    'Maestro',
    'Gurú',
    'Leyenda',
    'Visionario'
  ];

  const currentTitle = levelTitles[Math.min(level - 1, levelTitles.length - 1)];

  return (
    <CardFlat className="shadow-lg overflow-hidden">
      {/* Header with Level */}
      <div className="bg-[#1472FF] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{level}</span>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">{currentTitle}</h3>
              <p className="text-white/80 text-sm">Nivel {level}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-white font-bold text-xl">{currentXP} XP</span>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-white/80 mb-1">
            <span>Progreso al nivel {level + 1}</span>
            <span>{currentXP}/{xpToNextLevel} XP</span>
          </div>
          <ProgressBar value={xpProgress} size="md" color="white" durationMs={500} />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-4 grid grid-cols-2 gap-4">
        {/* Streak */}
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-100 dark:border-red-800">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🔥</span>
            <span className="text-sm font-medium text-[#777777] dark:text-gray-400">Racha</span>
          </div>
          <div className="text-3xl font-bold text-red-600 dark:text-red-400">
            {streak}
            <span className="text-sm font-normal ml-1">días</span>
          </div>
          {streak >= 7 && (
            <p className="text-xs text-red-500 mt-1">¡Increíble racha!</p>
          )}
        </div>

        {/* Weekly Challenge */}
        <div className="bg-[#1472FF]/10 rounded-lg p-4 border border-[#1472FF]/20">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🎯</span>
            <span className="text-sm font-medium text-[#777777] dark:text-gray-400">Meta Semanal</span>
          </div>
          <div className="text-3xl font-bold text-[#1472FF]">
            {weeklyProgress}/{weeklyGoal}
          </div>
          <div className="mt-2">
            <ProgressBar value={Math.min((weeklyProgress / weeklyGoal) * 100, 100)} size="sm" color="primary" trackClassName="bg-blue-200 dark:bg-blue-900/30" durationMs={500} />
          </div>
        </div>
      </div>

      {/* XP Rewards Info */}
      <div className="px-4 pb-4">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <p className="text-xs text-[#777777] dark:text-gray-400 font-medium mb-2">Gana XP:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-[#22c55e]">+10</span>
              <span className="text-[#777777] dark:text-gray-400">por video</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[#22c55e]">+50</span>
              <span className="text-[#777777] dark:text-gray-400">por fase</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[#22c55e]">+25</span>
              <span className="text-[#777777] dark:text-gray-400">por checkpoint</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[#22c55e]">+100</span>
              <span className="text-[#777777] dark:text-gray-400">racha 7 días</span>
            </div>
          </div>
        </div>
      </div>
    </CardFlat>
  );
}

'use client';

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
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header with Level */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4">
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
          <div className="w-full bg-white/30 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-4 grid grid-cols-2 gap-4">
        {/* Streak */}
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-4 border border-red-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🔥</span>
            <span className="text-sm font-medium text-gray-600">Racha</span>
          </div>
          <div className="text-3xl font-bold text-red-600">
            {streak}
            <span className="text-sm font-normal ml-1">días</span>
          </div>
          {streak >= 7 && (
            <p className="text-xs text-red-500 mt-1">¡Increíble racha!</p>
          )}
        </div>

        {/* Weekly Challenge */}
        <div className="bg-gradient-to-br from-[#1472FF]/10 to-[#1472FF]/10 rounded-lg p-4 border border-[#1472FF]/20">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🎯</span>
            <span className="text-sm font-medium text-gray-600">Meta Semanal</span>
          </div>
          <div className="text-3xl font-bold text-[#1472FF]">
            {weeklyProgress}/{weeklyGoal}
          </div>
          <div className="mt-2 w-full bg-blue-200 rounded-full h-1.5">
            <div
              className="bg-[#1472FF] rounded-full h-1.5 transition-all duration-500"
              style={{ width: `${Math.min((weeklyProgress / weeklyGoal) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* XP Rewards Info */}
      <div className="px-4 pb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 font-medium mb-2">Gana XP:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-green-500">+10</span>
              <span className="text-gray-600">por video</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-green-500">+50</span>
              <span className="text-gray-600">por fase</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-green-500">+25</span>
              <span className="text-gray-600">por checkpoint</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-green-500">+100</span>
              <span className="text-gray-600">racha 7 días</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

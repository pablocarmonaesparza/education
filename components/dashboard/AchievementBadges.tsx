'use client';

import { useState } from 'react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
  requirement: string;
  xpReward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementBadgesProps {
  earnedBadges?: string[];
}

export default function AchievementBadges({ earnedBadges = ['first-video', 'first-login'] }: AchievementBadgesProps) {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const allBadges: Badge[] = [
    // Getting Started
    {
      id: 'first-login',
      name: 'Bienvenido',
      description: 'Iniciaste tu viaje de aprendizaje',
      icon: '🚀',
      earned: earnedBadges.includes('first-login'),
      earnedDate: '2024-01-15',
      requirement: 'Inicia sesión por primera vez',
      xpReward: 10,
      rarity: 'common',
    },
    {
      id: 'first-video',
      name: 'Primera Lección',
      description: 'Completaste tu primer video',
      icon: '🎬',
      earned: earnedBadges.includes('first-video'),
      earnedDate: '2024-01-15',
      requirement: 'Completa tu primer video',
      xpReward: 15,
      rarity: 'common',
    },
    {
      id: 'first-phase',
      name: 'Fase Completa',
      description: 'Terminaste una fase completa',
      icon: '🏆',
      earned: earnedBadges.includes('first-phase'),
      requirement: 'Completa tu primera fase',
      xpReward: 50,
      rarity: 'rare',
    },
    // Streaks
    {
      id: 'streak-3',
      name: 'En Racha',
      description: '3 días consecutivos aprendiendo',
      icon: '🔥',
      earned: earnedBadges.includes('streak-3'),
      requirement: 'Mantén una racha de 3 días',
      xpReward: 30,
      rarity: 'common',
    },
    {
      id: 'streak-7',
      name: 'Semana Perfecta',
      description: '7 días consecutivos sin fallar',
      icon: '⚡',
      earned: earnedBadges.includes('streak-7'),
      requirement: 'Mantén una racha de 7 días',
      xpReward: 100,
      rarity: 'rare',
    },
    {
      id: 'streak-30',
      name: 'Imparable',
      description: '30 días de dedicación total',
      icon: '💎',
      earned: earnedBadges.includes('streak-30'),
      requirement: 'Mantén una racha de 30 días',
      xpReward: 500,
      rarity: 'legendary',
    },
    // Progress
    {
      id: 'videos-10',
      name: 'Buen Ritmo',
      description: 'Ya viste 10 videos',
      icon: '📚',
      earned: earnedBadges.includes('videos-10'),
      requirement: 'Completa 10 videos',
      xpReward: 50,
      rarity: 'common',
    },
    {
      id: 'videos-50',
      name: 'Estudiante Dedicado',
      description: '50 videos completados',
      icon: '🎓',
      earned: earnedBadges.includes('videos-50'),
      requirement: 'Completa 50 videos',
      xpReward: 200,
      rarity: 'rare',
    },
    {
      id: 'videos-100',
      name: 'Centurión',
      description: '100 videos dominados',
      icon: '👑',
      earned: earnedBadges.includes('videos-100'),
      requirement: 'Completa 100 videos',
      xpReward: 500,
      rarity: 'epic',
    },
    // Special
    {
      id: 'speed-learner',
      name: 'Aprendizaje Veloz',
      description: 'Completaste 5 videos en un día',
      icon: '⏱️',
      earned: earnedBadges.includes('speed-learner'),
      requirement: 'Completa 5 videos en un solo día',
      xpReward: 75,
      rarity: 'rare',
    },
    {
      id: 'night-owl',
      name: 'Búho Nocturno',
      description: 'Aprendiendo después de medianoche',
      icon: '🦉',
      earned: earnedBadges.includes('night-owl'),
      requirement: 'Completa un video después de las 12am',
      xpReward: 25,
      rarity: 'common',
    },
    {
      id: 'completionist',
      name: 'Completista',
      description: 'Terminaste todo el curso',
      icon: '🌟',
      earned: earnedBadges.includes('completionist'),
      requirement: 'Completa todos los videos del curso',
      xpReward: 1000,
      rarity: 'legendary',
    },
  ];

  const rarityColors = {
    common: 'from-gray-400 to-gray-500',
    rare: 'bg-[#5BA0FF]',
    epic: 'bg-[#1472FF]',
    legendary: 'from-yellow-400 to-orange-500',
  };

  const rarityBorders = {
    common: 'border-gray-300',
    rare: 'border-blue-400',
    epic: 'border-purple-400',
    legendary: 'border-yellow-400',
  };

  const earnedCount = allBadges.filter(b => b.earned).length;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Logros</h3>
          <p className="text-sm text-gray-500">
            {earnedCount}/{allBadges.length} desbloqueados
          </p>
        </div>
        <div className="text-2xl">🏅</div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-4 gap-2">
        {allBadges.map((badge) => (
          <button
            key={badge.id}
            onClick={() => setSelectedBadge(badge)}
            className={`
              relative aspect-square rounded-lg border-2 flex items-center justify-center
              transition-all duration-200 hover:scale-105
              ${badge.earned
                ? `${rarityBorders[badge.rarity]} ${rarityColors[badge.rarity]} bg-opacity-10`
                : 'border-gray-200 bg-gray-100'
              }
            `}
          >
            <span className={`text-xl ${badge.earned ? '' : 'grayscale opacity-30'}`}>
              {badge.icon}
            </span>
            {badge.earned && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            )}
          </button>
        ))}
      </div>

      {/* Selected Badge Detail */}
      {selectedBadge && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-start gap-3">
            <div className={`
              w-12 h-12 rounded-lg flex items-center justify-center
              ${selectedBadge.earned
                ? `${rarityColors[selectedBadge.rarity]}`
                : 'bg-gray-200'
              }
            `}>
              <span className={`text-2xl ${selectedBadge.earned ? '' : 'grayscale'}`}>
                {selectedBadge.icon}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-gray-900">{selectedBadge.name}</h4>
                <span className={`
                  text-xs px-2 py-0.5 rounded-full font-medium
                  ${selectedBadge.rarity === 'common' ? 'bg-gray-200 text-gray-600' : ''}
                  ${selectedBadge.rarity === 'rare' ? 'bg-[#1472FF]/10 text-[#1472FF]' : ''}
                  ${selectedBadge.rarity === 'epic' ? 'bg-[#1472FF]/10 text-[#1472FF]' : ''}
                  ${selectedBadge.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-600' : ''}
                `}>
                  {selectedBadge.rarity === 'common' && 'Común'}
                  {selectedBadge.rarity === 'rare' && 'Raro'}
                  {selectedBadge.rarity === 'epic' && 'Épico'}
                  {selectedBadge.rarity === 'legendary' && 'Legendario'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {selectedBadge.description}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs">
                <span className="text-green-600 font-medium">
                  +{selectedBadge.xpReward} XP
                </span>
                {selectedBadge.earned ? (
                  <span className="text-gray-500">✓ Desbloqueado</span>
                ) : (
                  <span className="text-gray-400">{selectedBadge.requirement}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View All Link */}
      <button className="mt-3 w-full text-center text-sm text-[#1472FF] hover:text-[#0E5FCC] font-medium">
        Ver todos los logros →
      </button>
    </div>
  );
}

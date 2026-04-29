// lib/gamification-rarity.ts
// Paleta por rarity para badges. Centralizada para que `BadgeGrid` (página
// de progreso/perfil) y `GamificationSidebar` (sidebar derecho del
// dashboard) usen exactamente las mismas clases sin duplicación.
//
// Las rareties `epic` y `legendary` usan tonos `purple-*` y `amber-*` que
// no están en la paleta documentada en `CLAUDE.md`. Esto se considera
// una excepción intencional: los badges Duolingo-style necesitan jerarquía
// visual entre tiers, y los tonos `purple/amber` son los más cercanos a
// las convenciones de gaming sin colisionar con `primary` (rare) o gray
// (common). Si en el futuro se agregan tokens semánticos en
// `tailwind.config.ts` (ej. `epic`, `legendary`), reemplazar aquí.

import type { BadgeRarity } from '@/lib/gamification';

export type RarityClasses = {
  bg: string;
  border: string;
  text: string;
};

export function rarityClasses(rarity: BadgeRarity): RarityClasses {
  switch (rarity) {
    case 'rare':
      return {
        bg: 'bg-primary/10',
        border: 'border-primary/30',
        text: 'text-primary',
      };
    case 'epic':
      return {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        border: 'border-purple-300 dark:border-purple-700',
        text: 'text-purple-700 dark:text-purple-300',
      };
    case 'legendary':
      return {
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        border: 'border-amber-400 dark:border-amber-600',
        text: 'text-amber-700 dark:text-amber-300',
      };
    default:
      return {
        bg: 'bg-gray-100 dark:bg-gray-800',
        border: 'border-gray-300 dark:border-gray-700',
        text: 'text-ink dark:text-white',
      };
  }
}

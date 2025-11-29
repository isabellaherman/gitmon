export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  criteria: {
    type: 'event_participation' | 'xp_milestone' | 'streak' | 'custom';
    value?: string | number;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  dateEarned?: Date;
}

export const availableBadges: Badge[] = [
  {
    id: 'first-community-event',
    name: 'Community Pioneer',
    description: "Participated in GitMon's first community event",
    emoji: '🎯',
    criteria: {
      type: 'event_participation',
      value: 'first-community-event',
    },
    rarity: 'epic',
  },
  {
    id: 'xp-1000',
    name: 'Rising Coder',
    description: 'Earned 1,000 XP',
    emoji: '⚡',
    criteria: {
      type: 'xp_milestone',
      value: 1000,
    },
    rarity: 'common',
  },
  {
    id: 'xp-10000',
    name: 'Code Master',
    description: 'Earned 10,000 XP',
    emoji: '💎',
    criteria: {
      type: 'xp_milestone',
      value: 10000,
    },
    rarity: 'rare',
  },
  {
    id: 'streak-30',
    name: 'Dedicated Developer',
    description: 'Maintained a 30-day coding streak',
    emoji: '🔥',
    criteria: {
      type: 'streak',
      value: 30,
    },
    rarity: 'rare',
  },
];

export const getBadgeRarityColor = (rarity: Badge['rarity']): string => {
  const colors = {
    common: 'border-gray-400 bg-gray-50',
    rare: 'border-blue-400 bg-blue-50',
    epic: 'border-purple-400 bg-purple-50',
    legendary: 'border-yellow-400 bg-yellow-50',
  };
  return colors[rarity];
};

export const getBadgeTextColor = (rarity: Badge['rarity']): string => {
  const colors = {
    common: 'text-gray-600',
    rare: 'text-blue-600',
    epic: 'text-purple-600',
    legendary: 'text-yellow-600',
  };
  return colors[rarity];
};

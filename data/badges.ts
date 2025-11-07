/**
 * 🏆 GITMON BADGES
 */

export interface BadgeConfig {
  id: string;
  name: string;
  description: string;
  image?: string; // Path to badge image in /public/badges/
  emoji?: string; // Fallback emoji if no image
  checkCondition?: (userData: any) => boolean; // Function to check if user earned this badge
}

export const availableBadges: BadgeConfig[] = [
  {
    id: "community-event",
    name: "Community Pioneer",
    description: "Participated in GitMon's first community event",
    image: "/badges/first-event.png",
    checkCondition: (userData) =>
      userData.eventParticipations?.some(
        (p: any) => p.eventId === 'first-community-event'
      )
  },
  {
    id: "gitmon-contributor",
    name: "GitMon Contributor",
    description: "Made contributions to the official GitMon repository",
    image: "/badges/contributor.png",
    checkCondition: (userData) => userData.isGitMonContributor === true
  },

  // Placeholder slots for future badges
  {
    id: "coming-soon-1",
    name: "Coming Soon",
    description: "More badges coming soon!",
    emoji: "🏆"
  },
  {
    id: "coming-soon-2",
    name: "Coming Soon",
    description: "More badges coming soon!",
    emoji: "🔥"
  },
  {
    id: "coming-soon-3",
    name: "Coming Soon",
    description: "More badges coming soon!",
    emoji: "💎"
  },
  {
    id: "coming-soon-4",
    name: "Coming Soon",
    description: "More badges coming soon!",
    emoji: "🌟"
  }
];

/**
 * Calculate which badges a user has earned
 */
export function getUserBadges(userData: any) {
  return availableBadges.map(badge => ({
    ...badge,
    earned: badge.checkCondition ? badge.checkCondition(userData) : false
  }));
}
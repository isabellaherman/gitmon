
export interface GitHubStats {
  commits: number;
  pullRequests: number;
  stars: number;
  forks: number;
  repositories: number;
  issues: number;
  reviews: number;
  languages: string[];
}

export interface XpGain {
  type: string;
  amount: number;
  source?: string;
  metadata?: Record<string, any>;
}

export function calculateLevel(totalXp: number): number {
  let level = 1;
  while (level <= 100) {
    const requiredXp = calculateXpForLevel(level);
    if (totalXp < requiredXp) {
      return level - 1;
    }
    level++;
  }
  return 100;
}

export function calculateXpForLevel(level: number): number {
  if (level <= 1) return 0;

  const xp = Math.floor(
    Math.pow(level, 3) * 4 -
    15 * Math.pow(level, 2) +
    100 * level -
    140
  );

  return Math.max(0, xp);
}

export function getXpForNextLevel(currentXp: number): number {
  const currentLevel = calculateLevel(currentXp);
  const nextLevelXp = calculateXpForLevel(currentLevel + 1);
  return nextLevelXp - currentXp;
}

export function getProgressToNextLevel(currentXp: number): number {
  const currentLevel = calculateLevel(currentXp);
  const currentLevelXp = calculateXpForLevel(currentLevel);
  const nextLevelXp = calculateXpForLevel(currentLevel + 1);

  if (nextLevelXp === currentLevelXp) return 1;

  const progress = (currentXp - currentLevelXp) / (nextLevelXp - currentLevelXp);
  return Math.min(1, Math.max(0, progress));
}

export function calculateCommitXp(linesChanged: number): number {
  const maxDailyCommitXp = 50;

  if (linesChanged < 10) return 2;
  if (linesChanged < 100) return 5;
  if (linesChanged < 500) return 8;
  return 10;
}

export function calculatePullRequestXp(
  isOpened: boolean,
  isMerged: boolean,
  targetRepoStars: number,
  isOwnRepo: boolean
): number {
  let baseXp = 0;

  if (isOpened) baseXp += 15;
  if (isMerged) baseXp += 25;

  if (targetRepoStars >= 10000) {
    baseXp *= 2;
  } else if (targetRepoStars >= 1000) {
    baseXp *= 1.5;
  }

  if (isOwnRepo) {
    baseXp *= 0.5;
  }

  return Math.floor(baseXp);
}

export function calculateStarXp(
  isFirstStar: boolean,
  repoStars: number,
  isFromVerifiedDev: boolean
): number {
  let xp = isFirstStar ? 50 : 10;

  if (repoStars >= 100) {
    xp *= 1.5;
  }

  if (isFromVerifiedDev) {
    xp *= 1.2;
  }

  return Math.floor(xp);
}

export function calculateForkXp(isFirstFork: boolean): number {
  return isFirstFork ? 30 : 5;
}

export function calculateIssueXp(type: 'created' | 'resolved_by_author' | 'resolved_by_community' | 'bug_report'): number {
  const xpMap = {
    created: 10,
    resolved_by_author: 20,
    resolved_by_community: 30,
    bug_report: 40
  };

  return xpMap[type] || 0;
}

export function calculateReviewXp(leadsToChanges: boolean, targetRepoStars: number): number {
  let baseXp = leadsToChanges ? 25 : 15;

  if (targetRepoStars >= 1000) {
    baseXp *= 1.3;
  }

  return Math.floor(baseXp);
}

export function calculateReleaseXp(versionType: 'major' | 'minor' | 'patch' | 'first'): number {
  const xpMap = {
    first: 100,
    major: 75,
    minor: 50,
    patch: 25
  };

  return xpMap[versionType] || 0;
}

export function calculateLanguageDiversityBonus(languagesUsed: string[]): number {
  const uniqueLanguages = new Set(languagesUsed).size;

  if (uniqueLanguages >= 10) {
    return 0.15;
  }

  return 0;
}

export function calculateStreakMultiplier(currentStreak: number): number {
  if (currentStreak >= 365) return 2.0;
  if (currentStreak >= 100) return 1.5;
  if (currentStreak >= 30) return 1.25;
  if (currentStreak >= 7) return 1.1;

  return 1.0;
}

export function applyDailyCap(currentDailyXp: number, newXp: number): number {
  const maxDailyXp = 1000;
  const remainingCap = maxDailyXp - currentDailyXp;

  return Math.min(newXp, Math.max(0, remainingCap));
}

export function getGitMonEvolution(level: number): 'basic' | 'evolved' | 'final' | 'legendary' {
  if (level >= 50) return 'legendary';
  if (level >= 26) return 'final';
  if (level >= 11) return 'evolved';
  return 'basic';
}

export function getUserRank(level: number): string {
  if (level >= 50) return 'Coding Deity';
  if (level >= 40) return 'GitHub Legend';
  if (level >= 30) return 'Community Leader';
  if (level >= 25) return 'Open Source Maintainer';
  if (level >= 20) return 'GitHub Power User';
  if (level >= 15) return 'Expert Developer';
  if (level >= 10) return 'Senior Contributor';
  if (level >= 5) return 'Solid Contributor';
  if (level >= 3) return 'Regular Contributor';
  return 'Beginner';
}

export default {
  calculateLevel,
  calculateXpForLevel,
  getXpForNextLevel,
  getProgressToNextLevel,
  calculateCommitXp,
  calculatePullRequestXp,
  calculateStarXp,
  calculateForkXp,
  calculateIssueXp,
  calculateReviewXp,
  calculateReleaseXp,
  calculateLanguageDiversityBonus,
  calculateStreakMultiplier,
  applyDailyCap,
  getGitMonEvolution,
  getUserRank
};
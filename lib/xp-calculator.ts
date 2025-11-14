import { prisma } from "@/lib/prisma";
import GitHubService from "@/lib/github-service";
import { calculateLevel } from "@/lib/xp-system";

// Helper function to get current week start (Monday 00:00)
export function getCurrentWeekStart(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sunday, 1=Monday
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - daysFromMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  return startOfWeek;
}

// Calculate lifetime XP using exact force-sync formula
export function calculateLifetimeXp(githubStats: {
  followers: number;
  totalStars: number;
  totalForks: number;
  totalRepos: number;
  totalCommits: number;
  totalPRs: number;
}) {
  return (
    (githubStats.followers * 1) +
    (githubStats.totalStars * 10) +
    (githubStats.totalForks * 5) +
    (githubStats.totalRepos * 50) +
    (githubStats.totalCommits * 5) +
    (githubStats.totalPRs * 40)
  );
}

// Shared user sync function using exact force-sync logic
export async function syncUserData(user: {
  id: string;
  githubUsername?: string | null;
  xp: number;
  weeklyXp: number;
  accounts?: Array<{
    access_token?: string | null;
    providerAccountId: string;
  }>;
}) {
  try {
    let githubUsername = user.githubUsername;

    // Get GitHub username if not available
    if (!githubUsername && user.accounts?.length) {
      const githubAccount = user.accounts[0];
      if (githubAccount?.providerAccountId) {
        try {
          const response = await fetch(`https://api.github.com/user/${githubAccount.providerAccountId}`);
          const githubUserData = await response.json();
          githubUsername = githubUserData.login;
        } catch (error) {
          console.error(`[XP Calculator] Failed to get GitHub username for user ${user.id}:`, error);
          return null;
        }
      }
    }

    if (!githubUsername) {
      console.warn(`[XP Calculator] No GitHub username found for user ${user.id}`);
      return null;
    }

    // Get GitHub access token from account
    let accessToken = undefined;
    if (user.accounts?.length) {
      const githubAccount = user.accounts[0];
      accessToken = githubAccount?.access_token || undefined;
    }

    const githubService = new GitHubService(accessToken);

    // Get GitHub stats using force-sync logic
    const githubStats = await githubService.getUserStats(githubUsername);
    const weeklyXp = await githubService.getWeeklyXp(githubUsername, true);

    // Calculate lifetime XP using exact force-sync formula
    const lifetimeXp = calculateLifetimeXp(githubStats);
    const newLevel = calculateLevel(lifetimeXp);

    // Update user data using exact force-sync logic
    await prisma.user.update({
      where: { id: user.id },
      data: {
        githubUsername,
        githubBio: githubStats.bio,
        githubLocation: githubStats.location,
        githubCompany: githubStats.company,
        githubBlog: githubStats.blog,
        githubTwitter: githubStats.twitterUsername,
        githubFollowers: githubStats.followers,
        githubFollowing: githubStats.following,
        githubCreatedAt: githubStats.createdAt,
        avgCommitsPerWeek: githubStats.avgCommitsPerWeek,
        xp: lifetimeXp,
        level: newLevel,
        weeklyXp: weeklyXp,
        totalCommits: githubStats.totalCommits,
        totalPRs: githubStats.totalPRs,
        totalStars: githubStats.totalStars,
        totalRepos: githubStats.totalRepos,
        languagesUsed: JSON.stringify(githubStats.languages),
        lastXpUpdate: new Date(),
        weekStartDate: getCurrentWeekStart()
      }
    });

    return {
      userId: user.id,
      username: githubUsername,
      oldXp: user.xp,
      newXp: lifetimeXp,
      oldWeeklyXp: user.weeklyXp,
      newWeeklyXp: weeklyXp,
      level: newLevel,
      githubStats
    };

  } catch (error) {
    console.error(`[XP Calculator] Error syncing user ${user.id}:`, error);
    return null;
  }
}

// Calculate and cache user rankings
export async function updateAllRankings() {
  try {
    console.log('[XP Calculator] Starting ranking calculation...');

    // Get all users sorted by all-time XP
    const allTimeUsers = await prisma.user.findMany({
      orderBy: { xp: 'desc' },
      select: { id: true, xp: true }
    });

    // Get all users sorted by weekly XP
    const weeklyUsers = await prisma.user.findMany({
      orderBy: { weeklyXp: 'desc' },
      select: { id: true, weeklyXp: true }
    });

    // Update rankings in batches to avoid overwhelming the database
    const batchSize = 100;
    let allTimeUpdated = 0;
    let weeklyUpdated = 0;

    // Update all-time rankings
    for (let i = 0; i < allTimeUsers.length; i += batchSize) {
      const batch = allTimeUsers.slice(i, i + batchSize);
      const updates = batch.map((user, batchIndex) =>
        prisma.user.update({
          where: { id: user.id },
          data: {
            allTimeRank: i + batchIndex + 1,
            rankUpdatedAt: new Date()
          }
        }).catch(error => {
          console.warn(`[XP Calculator] Could not update allTimeRank for user ${user.id}:`, error.message);
          return null;
        })
      );

      const results = await Promise.allSettled(updates);
      allTimeUpdated += results.filter(r => r.status === 'fulfilled' && r.value !== null).length;
    }

    // Update weekly rankings
    for (let i = 0; i < weeklyUsers.length; i += batchSize) {
      const batch = weeklyUsers.slice(i, i + batchSize);
      const updates = batch.map((user, batchIndex) =>
        prisma.user.update({
          where: { id: user.id },
          data: {
            weeklyRank: i + batchIndex + 1,
            rankUpdatedAt: new Date()
          }
        }).catch(error => {
          console.warn(`[XP Calculator] Could not update weeklyRank for user ${user.id}:`, error.message);
          return null;
        })
      );

      const results = await Promise.allSettled(updates);
      weeklyUpdated += results.filter(r => r.status === 'fulfilled' && r.value !== null).length;
    }

    console.log(`[XP Calculator] Rankings updated - All-time: ${allTimeUpdated}/${allTimeUsers.length}, Weekly: ${weeklyUpdated}/${weeklyUsers.length}`);

    return {
      allTimeRanked: allTimeUpdated,
      weeklyRanked: weeklyUpdated,
      totalUsers: allTimeUsers.length
    };

  } catch (error) {
    console.error('[XP Calculator] Error updating rankings:', error);
    throw error;
  }
}
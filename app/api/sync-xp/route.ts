import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import GitHubService from '@/lib/github-service';
import {
  calculateLevel,
  calculateCommitXp,
  calculatePullRequestXp,
  calculateStarXp,
  calculateStreakMultiplier,
  applyDailyCap,
  getUserRank,
} from '@/lib/xp-system';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    console.log('[Sync XP] Session debug:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      hasEmail: !!session?.user?.email,
      email: session?.user?.email,
      name: session?.user?.name,
    });

    if (!session?.user?.email) {
      console.log('[Sync XP] No valid session found - returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        activities: true,
        accounts: {
          where: { provider: 'github' },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let githubUsername = user.githubUsername;

    if (!githubUsername && user.accounts.length > 0) {
      const githubAccount = user.accounts[0];

      if (githubAccount) {
        try {
          const response = await fetch(
            `https://api.github.com/user/${githubAccount.providerAccountId}`,
          );
          const githubUserData = await response.json();
          githubUsername = githubUserData.login;

          await prisma.user.update({
            where: { id: user.id },
            data: { githubUsername: githubUsername },
          });
        } catch (error) {
          console.error('Failed to get GitHub username from API:', error);
        }
      }
    }

    if (!githubUsername) {
      return NextResponse.json(
        {
          error: 'Could not determine GitHub username',
        },
        { status: 400 },
      );
    }

    console.log(`[Sync XP] Trying to sync for GitHub username: "${githubUsername}"`);
    console.log(`[Sync XP] User email: ${session.user.email}`);
    console.log(`[Sync XP] User name: ${session.user.name}`);

    if (!githubUsername) {
      return NextResponse.json(
        {
          error: 'GitHub username not found. Please provide your GitHub username.',
        },
        { status: 400 },
      );
    }

    // Get GitHub access token from account
    let accessToken = undefined;
    if (user.accounts.length > 0) {
      const githubAccount = user.accounts[0];
      accessToken = githubAccount?.access_token;
      console.log(`[Sync XP] GitHub account found:`, !!githubAccount);
      console.log(`[Sync XP] Access token available:`, !!accessToken);
    } else {
      console.log(`[Sync XP] No GitHub account linked for user ${user.email}`);
    }

    const githubService = new GitHubService(accessToken || undefined);

    try {
      const githubStats = await githubService.getUserStats(githubUsername);

      const isFirstSync = user.xp < 100;
      console.log(
        `[Sync XP] User: ${githubUsername}, isFirstSync: ${isFirstSync}, current weeklyXp: ${user.weeklyXp}`,
      );

      const weeklyXp = await githubService.getWeeklyXp(githubUsername, true);
      console.log(`[Sync XP] Calculated weeklyXp: ${weeklyXp}`);

      let lifetimeXp = 0;

      if (isFirstSync) {
        lifetimeXp += githubStats.followers * 1;

        lifetimeXp += githubStats.totalStars * 10;

        lifetimeXp += githubStats.totalForks * 5;

        lifetimeXp += githubStats.totalRepos * 50;

        lifetimeXp += githubStats.totalCommits * 5;

        lifetimeXp += githubStats.totalPRs * 40;

        console.log(`[Sync XP] Lifetime XP calculation:`);
        console.log(`  Followers: ${githubStats.followers} * 1 = ${githubStats.followers * 1}`);
        console.log(`  Stars: ${githubStats.totalStars} * 10 = ${githubStats.totalStars * 10}`);
        console.log(`  Forks: ${githubStats.totalForks} * 5 = ${githubStats.totalForks * 5}`);
        console.log(`  Repos: ${githubStats.totalRepos} * 50 = ${githubStats.totalRepos * 50}`);
        console.log(`  Commits: ${githubStats.totalCommits} * 5 = ${githubStats.totalCommits * 5}`);
        console.log(`  PRs: ${githubStats.totalPRs} * 40 = ${githubStats.totalPRs * 40}`);
        console.log(`  TOTAL LIFETIME XP: ${lifetimeXp}`);
      }

      // Apply streak multiplier to XP gains
      const streakMultiplier = calculateStreakMultiplier(user.currentStreak);
      const multipliedWeeklyXp = Math.floor(weeklyXp * streakMultiplier);
      const multipliedLifetimeXp = isFirstSync
        ? Math.floor(lifetimeXp * streakMultiplier)
        : lifetimeXp;

      const newTotalXp = isFirstSync
        ? multipliedLifetimeXp
        : user.xp + (multipliedWeeklyXp - user.weeklyXp);
      const totalNewXp = isFirstSync ? multipliedLifetimeXp : multipliedWeeklyXp;
      const newLevel = calculateLevel(newTotalXp);
      const newRank = getUserRank(newLevel);

      const updatedUser = await prisma.user.update({
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
          xp: newTotalXp,
          level: newLevel,
          weeklyXp: multipliedWeeklyXp,
          dailyXp: isFirstSync ? 0 : user.dailyXp + multipliedWeeklyXp,
          totalCommits: githubStats.totalCommits,
          totalPRs: githubStats.totalPRs,
          totalStars: githubStats.totalStars,
          totalRepos: githubStats.totalRepos,
          languagesUsed: JSON.stringify(githubStats.languages),
          lastXpUpdate: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        user: {
          ...updatedUser,
          rank: newRank,
          xpGained: totalNewXp,
          weeklyXpCalculated: multipliedWeeklyXp,
          streakMultiplier: streakMultiplier,
          currentStreak: user.currentStreak,
        },
      });
    } catch (githubError) {
      console.error('GitHub API error:', githubError);

      return NextResponse.json({
        success: true,
        warning: 'GitHub API unavailable',
        user: {
          ...user,
        },
      });
    }
  } catch (error) {
    console.error('XP sync error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return POST(request);
}

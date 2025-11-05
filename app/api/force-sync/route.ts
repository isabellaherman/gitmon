import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import GitHubService from "@/lib/github-service";
import {
  calculateLevel,
  getUserRank
} from "@/lib/xp-system";

export async function POST(request: Request) {
  try {
    // Get logged in user from session
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        accounts: {
          where: { provider: 'github' }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log(`[Force Sync] Starting sync for ${user.email}`);

    let githubUsername = user.githubUsername;
    if (!githubUsername && user.accounts.length > 0) {
      const githubAccount = user.accounts[0];
      if (githubAccount?.providerAccountId) {
        try {
          const response = await fetch(`https://api.github.com/user/${githubAccount.providerAccountId}`);
          const githubUserData = await response.json();
          githubUsername = githubUserData.login;
          console.log(`[Force Sync] Found GitHub username: ${githubUsername}`);
        } catch (error) {
          console.error('Failed to get GitHub username:', error);
        }
      }
    }

    if (!githubUsername) {
      return NextResponse.json({ error: "GitHub username not found" }, { status: 400 });
    }

    // Get GitHub access token from account
    let accessToken = undefined;
    if (user.accounts.length > 0) {
      const githubAccount = user.accounts.find(acc => acc.provider === 'github');
      accessToken = githubAccount?.access_token;
      console.log(`[Force Sync] GitHub account found:`, !!githubAccount);
      console.log(`[Force Sync] Access token available:`, !!accessToken);
    } else {
      console.log(`[Force Sync] No GitHub account linked for user ${user.email}`);
    }

    const githubService = new GitHubService(accessToken || undefined);

    try {
      const githubStats = await githubService.getUserStats(githubUsername);
      console.log(`[Force Sync] GitHub stats:`, {
        totalCommits: githubStats.totalCommits,
        totalPRs: githubStats.totalPRs,
        totalStars: githubStats.totalStars,
        followers: githubStats.followers
      });

      const weeklyXp = await githubService.getWeeklyXp(githubUsername, true);
      console.log(`[Force Sync] Weekly XP: ${weeklyXp}`);

      const lifetimeXp =
        (githubStats.followers * 1) +
        (githubStats.totalStars * 10) +
        (githubStats.totalForks * 5) +
        (githubStats.totalRepos * 50) +
        (githubStats.totalCommits * 5) +
        (githubStats.totalPRs * 40);

      console.log(`[Force Sync] Calculated lifetime XP: ${lifetimeXp}`);

      const newLevel = calculateLevel(lifetimeXp);
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
          xp: lifetimeXp,
          level: newLevel,
          weeklyXp: weeklyXp,
          totalCommits: githubStats.totalCommits,
          totalPRs: githubStats.totalPRs,
          totalStars: githubStats.totalStars,
          totalRepos: githubStats.totalRepos,
          languagesUsed: JSON.stringify(githubStats.languages),
          lastXpUpdate: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        message: "Force sync completed",
        data: {
          username: githubUsername,
          oldXp: user.xp,
          newXp: lifetimeXp,
          oldWeeklyXp: user.weeklyXp,
          newWeeklyXp: weeklyXp,
          level: newLevel,
          rank: newRank,
          githubStats: {
            totalCommits: githubStats.totalCommits,
            totalPRs: githubStats.totalPRs,
            totalStars: githubStats.totalStars,
            followers: githubStats.followers
          }
        }
      });

    } catch (githubError) {
      console.error("GitHub API error in force sync:", githubError);
      return NextResponse.json({
        error: "GitHub API error",
        details: githubError instanceof Error ? githubError.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Force sync error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
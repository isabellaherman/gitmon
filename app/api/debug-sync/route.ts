import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import GitHubService from "@/lib/github-service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || 'isabella@mage.games';

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        accounts: {
          where: { provider: 'github' }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log(`[Debug Sync] Found user: ${user.email}`);
    console.log(`[Debug Sync] Current XP: ${user.xp}, Weekly XP: ${user.weeklyXp}`);

    let githubUsername = user.githubUsername;
    if (!githubUsername && user.accounts.length > 0) {
      const githubAccount = user.accounts.find(acc => acc.provider === 'github');
      if (githubAccount?.providerAccountId) {
        try {
          const response = await fetch(`https://api.github.com/user/${githubAccount.providerAccountId}`);
          const githubUserData = await response.json();
          githubUsername = githubUserData.login;
          console.log(`[Debug Sync] Found GitHub username: ${githubUsername}`);
        } catch (error) {
          console.error('Failed to get GitHub username:', error);
        }
      }
    }

    if (!githubUsername) {
      return NextResponse.json({ error: "GitHub username not found" }, { status: 400 });
    }

    const githubService = new GitHubService();

    try {
      const weeklyXp = await githubService.getWeeklyXp(githubUsername, true);
      console.log(`[Debug Sync] Calculated weekly XP: ${weeklyXp}`);

      const githubStats = await githubService.getUserStats(githubUsername);
      console.log(`[Debug Sync] GitHub stats:`, {
        totalCommits: githubStats.totalCommits,
        totalPRs: githubStats.totalPRs,
        totalStars: githubStats.totalStars,
        totalForks: githubStats.totalForks,
        totalRepos: githubStats.totalRepos,
        followers: githubStats.followers
      });

      const calculatedAllTimeXp =
        (githubStats.followers * 1) +
        (githubStats.totalStars * 10) +
        (githubStats.totalForks * 5) +
        (githubStats.totalRepos * 50) +
        (githubStats.totalCommits * 5) +
        (githubStats.totalPRs * 40);

      const breakdown = {
        followers: `${githubStats.followers} × 1 = ${githubStats.followers * 1}`,
        stars: `${githubStats.totalStars} × 10 = ${githubStats.totalStars * 10}`,
        forks: `${githubStats.totalForks} × 5 = ${githubStats.totalForks * 5}`,
        repos: `${githubStats.totalRepos} × 50 = ${githubStats.totalRepos * 50}`,
        commits: `${githubStats.totalCommits} × 5 = ${githubStats.totalCommits * 5}`,
        prs: `${githubStats.totalPRs} × 40 = ${githubStats.totalPRs * 40}`,
        total: calculatedAllTimeXp
      };

      console.log(`[Debug Sync] All-Time XP breakdown:`, breakdown);

      return NextResponse.json({
        success: true,
        debug: {
          email,
          username: githubUsername,
          currentXp: user.xp,
          currentWeeklyXp: user.weeklyXp,
          calculatedWeeklyXp: weeklyXp,
          calculatedAllTimeXp,
          xpBreakdown: breakdown,
          githubStats: {
            totalCommits: githubStats.totalCommits,
            totalPRs: githubStats.totalPRs,
            totalStars: githubStats.totalStars,
            totalForks: githubStats.totalForks,
            totalRepos: githubStats.totalRepos,
            followers: githubStats.followers
          }
        }
      });

    } catch (githubError) {
      console.error("GitHub API error:", githubError);
      return NextResponse.json({
        error: "GitHub API error",
        details: githubError.message
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Debug sync error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import GitHubService from "@/lib/github-service";
import {
  calculateLevel,
  calculateCommitXp,
  calculatePullRequestXp,
  calculateStarXp,
  calculateStreakMultiplier,
  applyDailyCap,
  getUserRank
} from "@/lib/xp-system";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    console.log("[Sync XP] Session debug:", {
      hasSession: !!session,
      hasUser: !!session?.user,
      hasEmail: !!session?.user?.email,
      email: session?.user?.email,
      name: session?.user?.name
    });

    if (!session?.user?.email) {
      console.log("[Sync XP] No valid session found - returning 401");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database with GitHub account data
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        activities: true,
        accounts: {
          where: { provider: 'github' }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get GitHub username from GitHub account data
    let githubUsername = user.githubUsername;

    // If not stored, get from GitHub account providerAccountId
    if (!githubUsername && user.accounts.length > 0) {
      const githubAccount = user.accounts.find(acc => acc.provider === 'github');

      if (githubAccount) {
        // Make a request to get the username from GitHub API
        try {
          const response = await fetch(`https://api.github.com/user/${githubAccount.providerAccountId}`);
          const githubUserData = await response.json();
          githubUsername = githubUserData.login;

          // Save it to user record for future use
          await prisma.user.update({
            where: { id: user.id },
            data: { githubUsername: githubUsername }
          });
        } catch (error) {
          console.error('Failed to get GitHub username from API:', error);
        }
      }
    }

    // Final check
    if (!githubUsername) {
      return NextResponse.json({
        error: "Could not determine GitHub username"
      }, { status: 400 });
    }

    console.log(`[Sync XP] Trying to sync for GitHub username: "${githubUsername}"`);
    console.log(`[Sync XP] User email: ${session.user.email}`);
    console.log(`[Sync XP] User name: ${session.user.name}`);

    if (!githubUsername) {
      return NextResponse.json({
        error: "GitHub username not found. Please provide your GitHub username."
      }, { status: 400 });
    }

    // Initialize GitHub service (using public API for now)
    const githubService = new GitHubService();

    try {
      // Fetch user's GitHub stats
      const githubStats = await githubService.getUserStats(githubUsername);

      // Check if this is first lifetime sync (total XP is very low, meaning we haven't calculated lifetime XP yet)
      const isFirstSync = user.xp < 100; // If total XP is less than 100, we haven't done lifetime calculation
      console.log(`[Sync XP] User: ${githubUsername}, isFirstSync: ${isFirstSync}, current weeklyXp: ${user.weeklyXp}`);

      // Calculate weekly XP based on last 7 days to always show recent activity
      const weeklyXp = await githubService.getWeeklyXp(githubUsername, true);
      console.log(`[Sync XP] Calculated weeklyXp: ${weeklyXp}`);

      // Calculate TOTAL LIFETIME XP based on all GitHub activity
      let lifetimeXp = 0;

      if (isFirstSync) {
        // Calculate total XP from ALL GitHub activity ever

        // XP from followers (1 XP per follower)
        lifetimeXp += githubStats.followers * 1;

        // XP from total stars received (10 XP per star)
        lifetimeXp += githubStats.totalStars * 10;

        // XP from total forks received (5 XP per fork)
        lifetimeXp += githubStats.totalForks * 5;

        // XP from public repos (50 XP per repo)
        lifetimeXp += githubStats.totalRepos * 50;

        // XP from commit count (estimate: assume 5 XP average per commit across all repos)
        // This is a rough estimate since we can't get exact total commits easily
        lifetimeXp += githubStats.totalCommits * 5;

        // XP from PRs (estimate: 40 XP average per PR - opened + merged)
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

      const newTotalXp = isFirstSync ? lifetimeXp : user.xp; // Set lifetime XP on first sync
      const totalNewXp = isFirstSync ? lifetimeXp : weeklyXp; // XP gained this sync
      const newLevel = calculateLevel(newTotalXp);
      const newRank = getUserRank(newLevel);

      // Update user in database
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
          weeklyXp: weeklyXp, // Set current week's XP
          dailyXp: isFirstSync ? 0 : user.dailyXp + weeklyXp,
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
        user: {
          ...updatedUser,
          rank: newRank,
          xpGained: totalNewXp,
          weeklyXpCalculated: weeklyXp
        }
      });

    } catch (githubError) {
      console.error("GitHub API error:", githubError);

      // Fallback: give some basic XP if GitHub API fails
      const fallbackXp = 10;
      const newTotalXp = user.xp + fallbackXp;
      const newLevel = calculateLevel(newTotalXp);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          githubUsername,
          xp: newTotalXp,
          level: newLevel,
          lastXpUpdate: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        warning: "GitHub API unavailable, gave fallback XP",
        user: {
          ...user,
          xp: newTotalXp,
          level: newLevel,
          rank: getUserRank(newLevel),
          xpGained: fallbackXp
        }
      });
    }

  } catch (error) {
    console.error("XP sync error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// GET endpoint to manually trigger XP sync for testing
export async function GET(request: Request) {
  // Just redirect to POST for simplicity
  return POST(request);
}
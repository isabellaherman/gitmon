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

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { activities: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get GitHub username from session or user profile
    const githubUsername = user.githubUsername || session.user.name || session.user.email?.split('@')[0];

    if (!githubUsername) {
      return NextResponse.json({ error: "GitHub username not found" }, { status: 400 });
    }

    // Initialize GitHub service (using public API for now)
    const githubService = new GitHubService();

    try {
      // Fetch user's GitHub stats
      const githubStats = await githubService.getUserStats(githubUsername);

      // Calculate new XP based on GitHub activity
      let totalNewXp = 0;
      const newActivities = [];

      // Process recent commits (simple version for now)
      for (const activity of githubStats.recentActivity) {
        if (activity.type === 'commit') {
          const commitXp = calculateCommitXp(100); // Assuming medium commits for now
          const streakMultiplier = calculateStreakMultiplier(user.currentStreak);
          const finalXp = Math.floor(commitXp * streakMultiplier);

          // Apply daily cap
          const cappedXp = applyDailyCap(user.dailyXp, finalXp);

          if (cappedXp > 0) {
            totalNewXp += cappedXp;
            newActivities.push({
              userId: user.id,
              type: 'commit',
              amount: cappedXp,
              source: activity.repo,
              metadata: activity.details
            });
          }
        }

        if (activity.type === 'pr_opened' || activity.type === 'pr_merged') {
          const prXp = calculatePullRequestXp(
            activity.type === 'pr_opened',
            activity.type === 'pr_merged',
            1000, // Assuming 1k stars repo for now
            false // Assuming external repo
          );

          totalNewXp += prXp;
          newActivities.push({
            userId: user.id,
            type: activity.type,
            amount: prXp,
            source: activity.repo,
            metadata: activity.details
          });
        }

        if (activity.type === 'star_received') {
          const starXp = calculateStarXp(false, 100, false);

          totalNewXp += starXp;
          newActivities.push({
            userId: user.id,
            type: 'star_received',
            amount: starXp,
            source: activity.repo,
            metadata: activity.details
          });
        }
      }

      // Calculate new total XP and level
      const newTotalXp = user.xp + totalNewXp;
      const newLevel = calculateLevel(newTotalXp);
      const newRank = getUserRank(newLevel);

      // Update user in database
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          githubUsername,
          xp: newTotalXp,
          level: newLevel,
          dailyXp: user.dailyXp + totalNewXp,
          totalCommits: githubStats.totalCommits,
          totalPRs: githubStats.totalPRs,
          totalStars: githubStats.totalStars,
          totalRepos: githubStats.totalRepos,
          languagesUsed: JSON.stringify(githubStats.languages),
          lastXpUpdate: new Date()
        }
      });

      // Save new activities
      if (newActivities.length > 0) {
        await prisma.xpActivity.createMany({
          data: newActivities
        });
      }

      return NextResponse.json({
        success: true,
        user: {
          ...updatedUser,
          rank: newRank,
          xpGained: totalNewXp,
          activitiesProcessed: newActivities.length
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
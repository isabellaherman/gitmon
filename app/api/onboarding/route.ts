import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import GitHubService from "@/lib/github-service";
import { calculateLevel, getUserRank } from "@/lib/xp-system";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log("Onboarding - Session:", session?.user?.email);

    if (!session?.user?.email) {
      console.log("Onboarding - No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { selectedMonsterId } = await request.json();

    if (typeof selectedMonsterId !== "number" || selectedMonsterId < 0 || selectedMonsterId > 8) {
      return NextResponse.json({ error: "Invalid monster ID" }, { status: 400 });
    }

    // First update user with onboarding completion
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        selectedMonsterId,
        gitmonSelectedAt: new Date(),
        onboardingCompleted: true,
      },
      include: {
        accounts: {
          where: { provider: 'github' }
        }
      }
    });

    console.log(`[Onboarding] User completed onboarding: ${updatedUser.email}`);

    // Automatically sync XP after onboarding
    try {
      let githubUsername = updatedUser.githubUsername;

      // Get GitHub username if not already stored
      if (!githubUsername && updatedUser.accounts.length > 0) {
        const githubAccount = updatedUser.accounts.find(acc => acc.provider === 'github');
        if (githubAccount?.providerAccountId) {
          try {
            const response = await fetch(`https://api.github.com/user/${githubAccount.providerAccountId}`);
            const githubUserData = await response.json();
            githubUsername = githubUserData.login;
            console.log(`[Onboarding] Found GitHub username: ${githubUsername}`);
          } catch (error) {
            console.error('[Onboarding] Failed to get GitHub username:', error);
          }
        }
      }

      if (githubUsername) {
        // Get GitHub access token
        let accessToken = undefined;
        if (updatedUser.accounts.length > 0) {
          const githubAccount = updatedUser.accounts.find(acc => acc.provider === 'github');
          accessToken = githubAccount?.access_token;
        }

        console.log(`[Onboarding] Starting automatic XP sync for ${githubUsername}`);
        const githubService = new GitHubService(accessToken || undefined);

        const githubStats = await githubService.getUserStats(githubUsername);
        const weeklyXp = await githubService.getWeeklyXp(githubUsername, true);

        // Calculate lifetime XP
        const lifetimeXp =
          (githubStats.followers * 1) +
          (githubStats.totalStars * 10) +
          (githubStats.totalForks * 5) +
          (githubStats.totalRepos * 50) +
          (githubStats.totalCommits * 5) +
          (githubStats.totalPRs * 40);

        const newLevel = calculateLevel(lifetimeXp);
        const newRank = getUserRank(newLevel);

        // Update user with XP data
        const finalUser = await prisma.user.update({
          where: { id: updatedUser.id },
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

        console.log(`[Onboarding] XP sync completed for ${githubUsername}: ${lifetimeXp} XP, Level ${newLevel}`);

        return NextResponse.json({
          success: true,
          user: finalUser,
          xpSynced: true,
          xpData: {
            lifetimeXp,
            weeklyXp,
            level: newLevel,
            rank: newRank
          }
        });

      } else {
        console.log('[Onboarding] No GitHub username found, skipping XP sync');
        return NextResponse.json({
          success: true,
          user: updatedUser,
          xpSynced: false,
          message: "Onboarding completed but XP sync skipped (no GitHub username)"
        });
      }

    } catch (xpError) {
      console.error('[Onboarding] XP sync failed:', xpError);
      // Still return success for onboarding, but note XP sync failed
      return NextResponse.json({
        success: true,
        user: updatedUser,
        xpSynced: false,
        xpError: xpError instanceof Error ? xpError.message : 'Unknown XP sync error'
      });
    }
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
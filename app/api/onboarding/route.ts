import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { syncUserData } from "@/lib/xp-calculator";
import { getUserRank } from "@/lib/xp-system";

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

    // Automatically sync XP after onboarding using shared sync function
    try {
      console.log(`[Onboarding] Starting automatic XP sync for user ${updatedUser.id}`);

      const syncResult = await syncUserData(updatedUser);

      if (syncResult) {
        const newRank = getUserRank(syncResult.level);

        // Get the updated user data
        const finalUser = await prisma.user.findUnique({
          where: { id: updatedUser.id }
        });

        console.log(`[Onboarding] XP sync completed for ${syncResult.username}: ${syncResult.newXp} XP, Level ${syncResult.level}`);

        return NextResponse.json({
          success: true,
          user: finalUser,
          xpSynced: true,
          xpData: {
            lifetimeXp: syncResult.newXp,
            weeklyXp: syncResult.newWeeklyXp,
            level: syncResult.level,
            rank: newRank,
            username: syncResult.username
          }
        });

      } else {
        console.log('[Onboarding] XP sync returned null, likely no GitHub username found');
        return NextResponse.json({
          success: true,
          user: updatedUser,
          xpSynced: false,
          message: "Onboarding completed but XP sync skipped (no GitHub username or sync failed)"
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
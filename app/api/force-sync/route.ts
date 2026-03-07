import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { syncUserData } from '@/lib/xp-calculator';
import { getUserRank } from '@/lib/xp-system';

export async function POST() {
  try {
    // Get logged in user from session
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        accounts: {
          where: { provider: 'github' },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Server-side cooldown: skip sync if last update was less than 5 minutes ago
    const COOLDOWN_MS = 5 * 60 * 1000;
    if (user.lastXpUpdate && Date.now() - new Date(user.lastXpUpdate).getTime() < COOLDOWN_MS) {
      console.log(`[Force Sync] Cooldown active for ${user.email}, returning cached data`);
      return NextResponse.json({
        success: true,
        cached: true,
        message: 'Sync skipped (cooldown active)',
        data: {
          username: user.githubUsername,
          oldXp: user.xp,
          newXp: user.xp,
          oldWeeklyXp: user.weeklyXp,
          newWeeklyXp: user.weeklyXp,
          level: user.level,
          rank: getUserRank(user.level),
        },
      });
    }

    console.log(`[Force Sync] Starting sync for ${user.email}`);

    // Use shared sync function for consistency with daily cron and onboarding
    const syncResult = await syncUserData(user);

    if (syncResult) {
      const newRank = getUserRank(syncResult.level);

      console.log(
        `[Force Sync] Sync completed for ${syncResult.username}: ${syncResult.newXp} XP, Level ${syncResult.level}`,
      );

      return NextResponse.json({
        success: true,
        message: 'Force sync completed',
        data: {
          username: syncResult.username,
          oldXp: syncResult.oldXp,
          newXp: syncResult.newXp,
          oldWeeklyXp: syncResult.oldWeeklyXp,
          newWeeklyXp: syncResult.newWeeklyXp,
          level: syncResult.level,
          rank: newRank,
          githubStats: syncResult.githubStats,
        },
      });
    } else {
      return NextResponse.json(
        {
          error: 'Sync failed',
          details: 'Unable to sync user data. Please check GitHub username and API access.',
        },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error('Force sync error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

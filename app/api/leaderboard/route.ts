import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserRank } from "@/lib/xp-system";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const period = searchParams.get('period') || 'week'; // 'week' or 'all'

    // Choose ordering based on period
    const orderBy = period === 'week'
      ? [{ weeklyXp: 'desc' }, { level: 'desc' }, { lastXpUpdate: 'desc' }]
      : [{ xp: 'desc' }, { level: 'desc' }, { lastXpUpdate: 'desc' }];

    // Get users ordered by XP
    const users = await prisma.user.findMany({
      where: {
        onboardingCompleted: true,
        selectedMonsterId: { not: null }
      },
      orderBy,
      take: limit,
      select: {
        id: true,
        name: true,
        githubUsername: true,
        selectedMonsterId: true,
        level: true,
        xp: true,
        dailyXp: true,
        weeklyXp: true,
        totalCommits: true,
        totalPRs: true,
        totalStars: true,
        currentStreak: true,
        lastXpUpdate: true
      }
    });

    // Transform data for leaderboard
    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      id: user.id,
      name: user.name || user.githubUsername || 'Anonymous',
      githubUsername: user.githubUsername,
      selectedMonsterId: user.selectedMonsterId,
      level: user.level,
      xp: period === 'week' ? user.weeklyXp : user.xp, // Show weekly or total XP
      dailyXp: user.dailyXp,
      weeklyXp: user.weeklyXp,
      totalXp: user.xp, // Always include total for reference
      rank_title: getUserRank(user.level),
      stats: {
        // For weekly view, estimate commits/PRs based on weekly XP
        // For all-time view, show totals
        commits: period === 'week' ? Math.floor(user.weeklyXp / 5) : user.totalCommits,
        prs: period === 'week' ? Math.floor(user.weeklyXp / 40) : user.totalPRs,
        stars: user.totalStars, // Always show total stars
        streak: user.currentStreak
      },
      lastActive: user.lastXpUpdate
    }));

    return NextResponse.json({
      success: true,
      leaderboard,
      period,
      total: users.length,
      updatedAt: new Date()
    });

  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
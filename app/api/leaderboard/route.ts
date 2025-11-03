import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserRank } from "@/lib/xp-system";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const period = searchParams.get('period') || 'all'; // 'all', 'week', 'month'

    // Get users ordered by XP
    const users = await prisma.user.findMany({
      where: {
        onboardingCompleted: true,
        selectedMonsterId: { not: null }
      },
      orderBy: [
        { xp: 'desc' },
        { level: 'desc' },
        { lastXpUpdate: 'desc' }
      ],
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
      xp: user.xp,
      dailyXp: user.dailyXp,
      weeklyXp: user.weeklyXp,
      rank_title: getUserRank(user.level),
      stats: {
        commits: user.totalCommits,
        prs: user.totalPRs,
        stars: user.totalStars,
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
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserRank } from "@/lib/xp-system";
import GitHubService from "@/lib/github-service";

// Helper function to get current week start (Monday 00:00)
function getCurrentWeekStart(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=domingo, 1=segunda
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - daysFromMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  return startOfWeek;
}

// Check and reset weekly XP for all users if needed
async function checkAndResetWeeklyXp() {
  const currentWeekStart = getCurrentWeekStart();

  // Check if any users have data from previous week
  const usersWithOldData = await prisma.user.count({
    where: {
      OR: [
        { weekStartDate: { lt: currentWeekStart } },
        { weekStartDate: null }
      ]
    }
  });

  if (usersWithOldData > 0) {
    console.log(`[Leaderboard] Resetting weeklyXp for ${usersWithOldData} users for new week`);

    await prisma.user.updateMany({
      where: {
        OR: [
          { weekStartDate: { lt: currentWeekStart } },
          { weekStartDate: null }
        ]
      },
      data: {
        weeklyXp: 0,
        weekStartDate: currentWeekStart
      }
    });

    console.log('[Leaderboard] Weekly XP reset completed');
  }
}

// Force update weekly XP for top users
async function forceUpdateTopUsersWeeklyXp() {
  try {
    // Buscar top 50 usuários que já existem no banco
    const topUsers = await prisma.user.findMany({
      where: {
        githubUsername: { not: null },
        onboardingCompleted: true
      },
      orderBy: [
        { xp: 'desc' },           // Por XP total primeiro
        { weeklyXp: 'desc' },     // Depois por XP semanal
        { lastXpUpdate: 'desc' }  // Por último, atividade recente
      ],
      take: 50,
      select: {
        id: true,
        githubUsername: true,
        weeklyXp: true,
        accounts: {
          where: { provider: 'github' },
          select: { access_token: true }
        }
      }
    });

    console.log(`[Force Sync] Atualizando ${topUsers.length} top users`);

    // Sync em paralelo (rápido)
    const results = await Promise.allSettled(
      topUsers.map(async (user) => {
        try {
          // Get GitHub access token if available
          const accessToken = user.accounts[0]?.access_token || undefined;
          const githubService = new GitHubService(accessToken);

          const newWeeklyXp = await githubService.getWeeklyXp(user.githubUsername!);

          await prisma.user.update({
            where: { id: user.id },
            data: {
              weeklyXp: newWeeklyXp,
              lastXpUpdate: new Date(),
              weekStartDate: getCurrentWeekStart()
            }
          });

          return { username: user.githubUsername, weeklyXp: newWeeklyXp };
        } catch (error) {
          console.error(`[Force Sync] Erro para ${user.githubUsername}:`, error);
          return null;
        }
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled' && r.value).length;
    console.log(`[Force Sync] ${successful}/${topUsers.length} usuários atualizados com sucesso`);

    return successful;
  } catch (error) {
    console.error('[Force Sync] Erro geral:', error);
    return 0;
  }
}

export async function GET(request: Request) {
  try {
    // Check and reset weekly XP if needed (automatic reset)
    await checkAndResetWeeklyXp();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'week';

    // EMERGENCY FIX: Removed force sync from public endpoint to prevent system overload
    // TODO: Move this to a separate cron job that runs hourly

    const limit = parseInt(searchParams.get('limit') || '50');
    const currentUserId = searchParams.get('userId');

    const orderBy = period === 'week'
      ? [{ weeklyXp: 'desc' as const }, { level: 'desc' as const }, { lastXpUpdate: 'desc' as const }]
      : [{ xp: 'desc' as const }, { level: 'desc' as const }, { lastXpUpdate: 'desc' as const }];

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

    const leaderboard = users.map((user: typeof users[0], index: number) => ({
      rank: index + 1,
      id: user.id,
      name: user.name || user.githubUsername || 'Anonymous',
      githubUsername: user.githubUsername,
      selectedMonsterId: user.selectedMonsterId,
      level: user.level,
      xp: period === 'week' ? user.weeklyXp : user.xp,
      dailyXp: user.dailyXp,
      weeklyXp: user.weeklyXp,
      totalXp: user.xp,
      rank_title: getUserRank(user.level),
      stats: {
        commits: period === 'week' ? Math.floor(user.weeklyXp / 5) : user.totalCommits,
        prs: period === 'week' ? Math.floor(user.weeklyXp / 40) : user.totalPRs,
        stars: user.totalStars,
        streak: user.currentStreak
      },
      lastActive: user.lastXpUpdate
    }));

    type LeaderboardEntry = typeof leaderboard[0] & { isCurrentUser?: boolean };

    // Se o usuário atual não está no top 50, busca ele separadamente
    if (currentUserId && !users.find(u => u.id === currentUserId)) {
      const currentUser = await prisma.user.findUnique({
        where: { id: currentUserId },
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
          lastXpUpdate: true,
          onboardingCompleted: true
        }
      });

      if (currentUser && currentUser.onboardingCompleted && currentUser.selectedMonsterId !== null) {
        // Calcula a posição real do usuário
        const userRank = await prisma.user.count({
          where: {
            onboardingCompleted: true,
            selectedMonsterId: { not: null },
            OR: period === 'week'
              ? [
                  { weeklyXp: { gt: currentUser.weeklyXp } },
                  {
                    weeklyXp: currentUser.weeklyXp,
                    level: { gt: currentUser.level }
                  },
                  {
                    weeklyXp: currentUser.weeklyXp,
                    level: currentUser.level,
                    lastXpUpdate: { gt: currentUser.lastXpUpdate }
                  }
                ]
              : [
                  { xp: { gt: currentUser.xp } },
                  {
                    xp: currentUser.xp,
                    level: { gt: currentUser.level }
                  },
                  {
                    xp: currentUser.xp,
                    level: currentUser.level,
                    lastXpUpdate: { gt: currentUser.lastXpUpdate }
                  }
                ]
          }
        }) + 1;

        const currentUserEntry: LeaderboardEntry = {
          rank: userRank,
          id: currentUser.id,
          name: currentUser.name || currentUser.githubUsername || 'Anonymous',
          githubUsername: currentUser.githubUsername,
          selectedMonsterId: currentUser.selectedMonsterId,
          level: currentUser.level,
          xp: period === 'week' ? currentUser.weeklyXp : currentUser.xp,
          dailyXp: currentUser.dailyXp,
          weeklyXp: currentUser.weeklyXp,
          totalXp: currentUser.xp,
          rank_title: getUserRank(currentUser.level),
          stats: {
            commits: period === 'week' ? Math.floor(currentUser.weeklyXp / 5) : currentUser.totalCommits,
            prs: period === 'week' ? Math.floor(currentUser.weeklyXp / 40) : currentUser.totalPRs,
            stars: currentUser.totalStars,
            streak: currentUser.currentStreak
          },
          lastActive: currentUser.lastXpUpdate,
          isCurrentUser: true
        };

        (leaderboard as LeaderboardEntry[]).push(currentUserEntry);
      }
    }

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
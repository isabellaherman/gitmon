import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { syncUserData, updateAllRankings } from '@/lib/xp-calculator';

export async function GET(request: Request) {
  const startTime = Date.now();

  try {
    // 1. Security: Check CRON_SECRET bearer token
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.CRON_SECRET;

    if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
      console.error('[Daily Sync] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Rate limiting: Enforce 24-hour minimum interval
    // TODO: Add Redis-based rate limiting

    // 3. Execution locking: Prevent concurrent runs
    // TODO: Add Redis-based execution lock

    console.log('[Daily Sync] Starting daily sync process...');

    // 4. Execute: Sync ALL users (SELECT * FROM users) using force-sync logic
    const allUsers = await prisma.user.findMany({
      include: {
        accounts: {
          where: { provider: 'github' },
          select: { access_token: true, providerAccountId: true },
        },
      },
    });

    console.log(`[Daily Sync] Found ${allUsers.length} users to sync`);

    // Sync users in parallel (batches to avoid overwhelming GitHub API)
    const batchSize = 10; // Process 10 users at a time
    const results: unknown[] = [];
    const errors: { userId: string; error: unknown }[] = [];

    for (let i = 0; i < allUsers.length; i += batchSize) {
      const batch = allUsers.slice(i, i + batchSize);
      console.log(
        `[Daily Sync] Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allUsers.length / batchSize)}`,
      );

      const batchResults = await Promise.allSettled(batch.map(user => syncUserData(user)));

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          results.push(result.value);
        } else {
          const user = batch[index];
          errors.push({
            userId: user.id,
            error: result.status === 'rejected' ? result.reason : 'Sync returned null',
          });
        }
      });

      // Small delay between batches to be respectful to GitHub API
      if (i + batchSize < allUsers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // 5. Recalculate: Complete ranking refresh
    const rankingStats = await updateAllRankings();

    const duration = Date.now() - startTime;

    // 6. Logging: Return comprehensive metrics
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      stats: {
        totalUsers: allUsers.length,
        successfulSyncs: results.length,
        failedSyncs: errors.length,
        successRate: `${((results.length / allUsers.length) * 100).toFixed(1)}%`,
        rankingStats,
      },
      errors: errors.slice(0, 10), // Include first 10 errors for debugging
      sampleSuccesses: results.slice(0, 5), // Include first 5 successes as examples
    };

    console.log('[Daily Sync] Completed successfully:', {
      totalUsers: allUsers.length,
      successful: results.length,
      failed: errors.length,
      duration: `${duration}ms`,
    });

    return NextResponse.json(response);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[Daily Sync] Critical error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error during daily sync',
        timestamp: new Date().toISOString(),
        duration: `${duration}ms`,
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

import { NextResponse } from 'next/server';
import { EventCommitService } from '@/lib/event-commit-service';
import { prisma } from '@/lib/prisma';
import { broadcastDamageUpdate } from '@/lib/sse-broadcast';

// Set longer timeout for sync operations
export const maxDuration = 300; // 5 minutes

export async function POST() {
  try {
    // Get GitHub token
    const githubAccount = await prisma.account.findFirst({
      where: {
        provider: 'github',
        access_token: { not: null },
      },
    });

    if (!githubAccount?.access_token) {
      return NextResponse.json(
        {
          success: false,
          error: 'No GitHub token available',
        },
        { status: 400 },
      );
    }

    const commitService = new EventCommitService(githubAccount.access_token);
    const result = await commitService.syncNewCommits();

    // If we have new commits, broadcast the update to SSE clients
    if (result.success && result.stats.newCommits > 0) {
      try {
        // Get updated stats and recent commits
        const [stats, recentCommits] = await Promise.all([
          commitService.getStats(),
          commitService.getRecentCommits(10),
        ]);

        // Broadcast to all connected SSE clients
        broadcastDamageUpdate({
          type: 'new-commits',
          payload: {
            newCommitsCount: result.stats.newCommits,
            stats,
            recentCommits: recentCommits.commits,
          },
        });

        console.log(
          `🔴 [SSE] Broadcasted ${result.stats.newCommits} new commits to connected clients`,
        );
      } catch (broadcastError) {
        console.error('Failed to broadcast SSE update:', broadcastError);
        // Don't fail the entire sync if broadcast fails
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Sync event commits error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

import { NextResponse } from 'next/server';
import { EventCommitService } from '@/lib/event-commit-service';
import { prisma } from '@/lib/prisma';
import { broadcastDamageUpdate } from '@/lib/sse-broadcast';

// Shorter timeout for quick sync operations
export const maxDuration = 60; // 1 minute

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

    // Quick sync with limited scope (only check participants that were active recently)
    const result = await commitService.syncNewCommits();

    // Always broadcast stats update (even if no new commits)
    try {
      const [stats, recentCommits] = await Promise.all([
        commitService.getStats(),
        commitService.getRecentCommits(15), // Get a few more for the stream
      ]);

      broadcastDamageUpdate({
        type: 'stats-update',
        payload: {
          newCommitsCount: result.stats.newCommits,
          stats,
          recentCommits: recentCommits.commits,
          timestamp: new Date().toISOString(),
        },
      });

      console.log(
        `🔴 [Quick Sync] Broadcasted update - ${result.stats.newCommits} new commits, ${stats.totalCommits} total`,
      );
    } catch (broadcastError) {
      console.error('Failed to broadcast quick sync update:', broadcastError);
    }

    return NextResponse.json({
      success: result.success,
      message: result.message,
      stats: result.stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Quick sync error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

// GET endpoint for health checks
export async function GET() {
  return NextResponse.json({
    status: 'online',
    timestamp: new Date().toISOString(),
  });
}

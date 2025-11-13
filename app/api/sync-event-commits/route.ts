import { NextResponse } from 'next/server';
import { EventCommitService } from '@/lib/event-commit-service';
import { prisma } from '@/lib/prisma';

// Set longer timeout for sync operations
export const maxDuration = 300; // 5 minutes

export async function POST() {
  try {
    // Get GitHub token
    const githubAccount = await prisma.account.findFirst({
      where: {
        provider: 'github',
        access_token: { not: null }
      }
    });

    if (!githubAccount?.access_token) {
      return NextResponse.json({
        success: false,
        error: 'No GitHub token available'
      }, { status: 400 });
    }

    const commitService = new EventCommitService(githubAccount.access_token);
    const result = await commitService.syncNewCommits();

    return NextResponse.json(result);

  } catch (error) {
    console.error('Sync event commits error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
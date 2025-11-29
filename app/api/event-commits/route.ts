import { NextResponse } from 'next/server';
import { EventCommitService } from '@/lib/event-commit-service';

export async function GET() {
  try {
    const commitService = new EventCommitService();
    const result = await commitService.getRecentCommits(100);

    // Also get stats
    const stats = await commitService.getStats();

    return NextResponse.json({
      ...result,
      stats,
    });
  } catch (error) {
    console.error('Get event commits error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

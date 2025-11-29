import { NextResponse } from 'next/server';
import { BattleService } from '@/lib/battle-service';
import { prisma } from '@/lib/prisma';

export async function GET() {
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

    const battleService = new BattleService(githubAccount.access_token);
    const result = await battleService.getCommitsFromParticipants();

    return NextResponse.json(result);
  } catch (error) {
    console.error('Test commits error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

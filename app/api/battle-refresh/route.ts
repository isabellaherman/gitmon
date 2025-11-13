import { NextResponse } from 'next/server';
import { BattleService } from '@/lib/battle-service';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const battleService = new BattleService();
    const logs = await battleService.getBattleLogs(50);

    return NextResponse.json({
      success: true,
      data: logs
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    // Buscar token do GitHub (igual ao sistema de XP)
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

    const battleService = new BattleService(githubAccount.access_token);
    const result = await battleService.refreshBattleLogs();

    return NextResponse.json(result);

  } catch (error) {
    console.error('Battle refresh error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { SimpleBattleService } from '@/lib/simple-battle-service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST() {
  try {
    // Pegar um token do GitHub de qualquer usuário logado
    const account = await prisma.account.findFirst({
      where: {
        provider: 'github',
        access_token: { not: null }
      }
    });

    if (!account?.access_token) {
      return NextResponse.json({
        success: false,
        error: 'Precisa de usuário logado para acessar GitHub API'
      }, { status: 400 });
    }

    // Usar o serviço simplificado
    const battleService = new SimpleBattleService(account.access_token);
    const result = await battleService.refreshAllParticipants();

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in simple battle refresh:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Buscar logs existentes sem fazer refresh
    const account = await prisma.account.findFirst({
      where: {
        provider: 'github',
        access_token: { not: null }
      }
    });

    if (!account?.access_token) {
      return NextResponse.json({
        success: false,
        error: 'GitHub token not available'
      }, { status: 400 });
    }

    const battleService = new SimpleBattleService(account.access_token);
    const logs = await battleService.getBattleLogs(50);

    // Pegar contagem de participantes
    const participantCount = await prisma.eventParticipant.count({
      where: {
        eventId: 'first-community-event'
      }
    });

    return NextResponse.json({
      success: true,
      logs,
      participantCount,
      message: `Found ${logs.length} battle logs`
    });

  } catch (error) {
    console.error('Error getting battle logs:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
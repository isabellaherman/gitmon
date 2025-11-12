import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST() {
  try {
    // Delete all battle logs except the initial system message
    const result = await prisma.battleLog.deleteMany({
      where: {
        eventId: 'mad-monkey-2025',
        NOT: {
          id: 'event-start-log'
        }
      }
    });

    return NextResponse.json({
      message: `Cleared ${result.count} battle logs (kept system message)`,
      deletedCount: result.count,
      success: true
    });

  } catch (error) {
    console.error('Error clearing battle logs:', error);
    return NextResponse.json(
      { error: 'Failed to clear battle logs', success: false },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // Delete all battle logs for the event
    const result = await prisma.battleLog.deleteMany({
      where: {
        eventId: 'mad-monkey-2025'
      }
    });

    return NextResponse.json({
      success: true,
      message: `Cleared ${result.count} battle logs`
    });

  } catch (error) {
    console.error('Error clearing battle logs:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
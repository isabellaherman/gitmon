import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST() {
  try {
    // Simple approach: delete all battle logs and start fresh
    const result = await prisma.battleLog.deleteMany({
      where: {
        eventId: 'mad-monkey-2025'
      }
    });

    console.log(`Deleted ${result.count} battle logs`);

    // Create a fresh starting message
    await prisma.battleLog.create({
      data: {
        id: 'event-start-log',
        eventId: 'mad-monkey-2025',
        username: 'System',
        actionType: 'event',
        message: '🚀 Mad Monkey 2025 battle has begun! Trainers are preparing...',
        timestamp: new Date(),
        damageDealt: 0
      }
    });

    return NextResponse.json({
      message: `Successfully cleaned up! Deleted ${result.count} entries and created fresh start message.`,
      deletedCount: result.count,
      success: true
    });

  } catch (error) {
    console.error('Error during cleanup:', error);
    return NextResponse.json(
      { error: `Failed to cleanup: ${error.message}`, success: false },
      { status: 500 }
    );
  }
}
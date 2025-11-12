import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST() {
  try {
    // Update event to start from November 1, 2024 (to capture recent commits)
    const event = await prisma.event.update({
      where: {
        id: 'mad-monkey-2025'
      },
      data: {
        startDateTime: new Date('2024-11-01T00:00:00-03:00'), // November 1, 2024
        endDateTime: new Date('2024-12-31T23:59:59-03:00'),   // December 31, 2024
      }
    });

    // Also update the initial log timestamp
    await prisma.battleLog.update({
      where: {
        id: 'event-start-log'
      },
      data: {
        timestamp: new Date('2024-11-01T00:00:00-03:00')
      }
    });

    return NextResponse.json({
      message: 'Event dates updated to capture recent commits (Nov 1 - Dec 31, 2024)',
      event,
      success: true
    });

  } catch (error) {
    console.error('Error updating event dates:', error);
    return NextResponse.json(
      { error: 'Failed to update event dates', success: false },
      { status: 500 }
    );
  }
}
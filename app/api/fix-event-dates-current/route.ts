import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST() {
  try {
    // Update event to start from today (to capture commits from right now)
    const now = new Date();
    const startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)); // 7 days ago
    const endDate = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days from now

    const event = await prisma.event.update({
      where: {
        id: 'mad-monkey-2025'
      },
      data: {
        startDateTime: startDate, // Started 7 days ago
        endDateTime: endDate,     // Ends 7 days from now
      }
    });

    // Also update the initial log timestamp
    await prisma.battleLog.update({
      where: {
        id: 'event-start-log'
      },
      data: {
        timestamp: startDate
      }
    });

    return NextResponse.json({
      message: 'Event dates updated to capture REAL recent commits (7 days ago to 7 days from now)',
      event: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      },
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
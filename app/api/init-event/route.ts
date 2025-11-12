import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST() {
  try {
    // Create the Mad Monkey 2025 event
    const event = await prisma.event.upsert({
      where: {
        id: 'mad-monkey-2025'
      },
      update: {
        startDateTime: new Date('2025-11-11T00:00:00-03:00'), // Nov 11, 2025 São Paulo time
        endDateTime: new Date('2025-11-18T23:59:59-03:00'),   // Nov 18, 2025 São Paulo time
      },
      create: {
        id: 'mad-monkey-2025',
        name: 'Mad Monkey Battle 2025',
        startDateTime: new Date('2025-11-11T00:00:00-03:00'), // Nov 11, 2025 São Paulo time
        endDateTime: new Date('2025-11-18T23:59:59-03:00'),   // Nov 18, 2025 São Paulo time
        timezone: 'America/Sao_Paulo',
        bossMaxHp: 10000,
        bossCurrentHp: 10000,
        status: 'active'
      }
    });

    // Create initial battle log
    await prisma.battleLog.upsert({
      where: {
        id: 'event-start-log'
      },
      update: {},
      create: {
        id: 'event-start-log',
        eventId: 'mad-monkey-2025',
        username: 'GitMon',
        actionType: 'event_start',
        message: '🚨 Mad Monkey emergiu! Que comece a batalha!',
        timestamp: new Date('2025-11-11T00:00:00-03:00'),
        damageDealt: 0,
        metadata: {
          isSystemMessage: true
        }
      }
    });

    return NextResponse.json({
      event,
      message: 'Event initialized successfully',
      success: true
    });

  } catch (error) {
    console.error('Error initializing event:', error);
    return NextResponse.json(
      { error: 'Failed to initialize event', success: false },
      { status: 500 }
    );
  }
}
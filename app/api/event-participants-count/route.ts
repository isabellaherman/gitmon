import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json({ success: false, error: 'Event ID is required' }, { status: 400 });
    }

    // Count participants for the event
    const participantCount = await prisma.eventParticipant.count({
      where: {
        eventId: eventId,
      },
    });

    return NextResponse.json({
      success: true,
      count: participantCount,
    });
  } catch (error) {
    console.error('Error counting event participants:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

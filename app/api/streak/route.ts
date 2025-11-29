import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// Rate limiting for streak updates (much more restrictive)
const streakUpdateMap = new Map();
const readRequestMap = new Map();

const UPDATE_WINDOW = 24 * 60 * 60 * 1000; // 24 hours
const MAX_UPDATES_PER_DAY = 2; // Max 2 streak updates per day (one + maybe one correction)

const READ_WINDOW = 60 * 1000; // 1 minute
const MAX_READS_PER_MINUTE = 10; // More lenient for reading streak data

function checkUpdateRateLimit(userId: string): boolean {
  const now = Date.now();
  const userUpdates = streakUpdateMap.get(userId) || [];

  // Remove old updates outside the window
  const recentUpdates = userUpdates.filter((timestamp: number) => now - timestamp < UPDATE_WINDOW);

  if (recentUpdates.length >= MAX_UPDATES_PER_DAY) {
    return false; // Rate limited
  }

  // Add current update
  recentUpdates.push(now);
  streakUpdateMap.set(userId, recentUpdates);

  return true; // Allowed
}

function checkReadRateLimit(userId: string): boolean {
  const now = Date.now();
  const userReads = readRequestMap.get(userId) || [];

  // Remove old reads outside the window
  const recentReads = userReads.filter((timestamp: number) => now - timestamp < READ_WINDOW);

  if (recentReads.length >= MAX_READS_PER_MINUTE) {
    return false; // Rate limited
  }

  // Add current read
  recentReads.push(now);
  readRequestMap.set(userId, recentReads);

  return true; // Allowed
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check rate limit for streak updates (very restrictive)
    if (!checkUpdateRateLimit(session.user.email)) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. You can only update your streak twice per day.',
        },
        { status: 429 },
      );
    }

    const { currentStreak, allInteractionsComplete } = await request.json();

    if (typeof currentStreak !== 'number' || typeof allInteractionsComplete !== 'boolean') {
      return NextResponse.json({ error: 'Invalid streak data' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Award chromatic points for new streak milestones
    let chromaticPointsToAdd = 0;
    const oldStreak = user.currentStreak;

    // Award chromatic points for reaching new streak milestones
    if (currentStreak > oldStreak) {
      if (currentStreak === 1)
        chromaticPointsToAdd += 5; // 1st day
      else if (currentStreak === 2)
        chromaticPointsToAdd += 6; // 2nd day
      else if (currentStreak === 3)
        chromaticPointsToAdd += 7; // 3rd day
      else if (currentStreak === 4)
        chromaticPointsToAdd += 8; // 4th day
      else if (currentStreak === 5)
        chromaticPointsToAdd += 9; // 5th day
      else if (currentStreak >= 6) chromaticPointsToAdd += 10; // 6+ days (daily reward)
    }

    // Update streaks in database
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        currentStreak: currentStreak,
        longestStreak: Math.max(user.longestStreak, currentStreak),
      },
    });

    return NextResponse.json({
      success: true,
      currentStreak: updatedUser.currentStreak,
      longestStreak: updatedUser.longestStreak,
      chromaticPointsEarned: chromaticPointsToAdd,
      totalChromaticPoints: 0, // Temporary until migration
    });
  } catch (error) {
    console.error('Streak sync error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check rate limit for read requests (more lenient)
    if (!checkReadRateLimit(session.user.email)) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Too many requests.',
        },
        { status: 429 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        currentStreak: true,
        longestStreak: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      chromaticPoints: 0, // Temporary until migration
      orbs: 0, // Temporary until migration
    });
  } catch (error) {
    console.error('Streak fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

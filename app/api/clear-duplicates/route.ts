import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST() {
  try {
    // Find duplicate entries based on commitSha
    const duplicates = await prisma.battleLog.groupBy({
      by: ['commitSha'],
      where: {
        eventId: 'mad-monkey-2025',
        commitSha: { not: null }
      },
      having: {
        commitSha: {
          _count: {
            gt: 1
          }
        }
      },
      _count: {
        commitSha: true
      }
    });

    console.log(`Found ${duplicates.length} sets of duplicates`);

    let deletedCount = 0;

    // For each set of duplicates, keep only the first one (oldest)
    for (const duplicate of duplicates) {
      const entries = await prisma.battleLog.findMany({
        where: {
          commitSha: duplicate.commitSha,
          eventId: 'mad-monkey-2025'
        },
        orderBy: {
          timestamp: 'asc' // Keep the oldest entry
        }
      });

      // Delete all but the first entry
      const toDelete = entries.slice(1);

      for (const entry of toDelete) {
        await prisma.battleLog.delete({
          where: { id: entry.id }
        });
        deletedCount++;
      }
    }

    // Also find and remove exact message duplicates (same message, same user, same time period)
    const messageDuplicates = await prisma.battleLog.groupBy({
      by: ['username', 'message'],
      where: {
        eventId: 'mad-monkey-2025'
      },
      having: {
        username: {
          _count: {
            gt: 1
          }
        }
      },
      _count: {
        username: true
      }
    });

    console.log(`Found ${messageDuplicates.length} sets of message duplicates`);

    for (const duplicate of messageDuplicates) {
      const entries = await prisma.battleLog.findMany({
        where: {
          username: duplicate.username,
          message: duplicate.message,
          eventId: 'mad-monkey-2025'
        },
        orderBy: {
          timestamp: 'asc'
        }
      });

      // If entries are within 1 minute of each other, consider them duplicates
      const toDelete = [];
      for (let i = 1; i < entries.length; i++) {
        const timeDiff = new Date(entries[i].timestamp).getTime() - new Date(entries[0].timestamp).getTime();
        if (timeDiff < 60000) { // Within 1 minute
          toDelete.push(entries[i]);
        }
      }

      for (const entry of toDelete) {
        await prisma.battleLog.delete({
          where: { id: entry.id }
        });
        deletedCount++;
      }
    }

    return NextResponse.json({
      message: `Successfully removed ${deletedCount} duplicate entries`,
      duplicateSetsFound: duplicates.length,
      messageDuplicatesFound: messageDuplicates.length,
      totalDeleted: deletedCount,
      success: true
    });

  } catch (error) {
    console.error('Error clearing duplicates:', error);
    return NextResponse.json(
      { error: `Failed to clear duplicates: ${error.message}`, success: false },
      { status: 500 }
    );
  }
}
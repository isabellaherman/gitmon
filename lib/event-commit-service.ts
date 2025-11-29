import { PrismaClient } from '@prisma/client';
import GitHubService from './github-service';

const prisma = new PrismaClient();

export class EventCommitService {
  private githubService: GitHubService;
  private eventId = 'first-community-event';

  // Event date range - November 12 to November 30, 2025
  private eventStartDate = new Date('2025-11-12T00:00:00.000Z');
  private eventEndDate = new Date('2025-11-30T23:59:59.999Z');

  constructor(githubToken?: string) {
    this.githubService = new GitHubService(githubToken);
  }

  // SMART INCREMENTAL SYNC: Only fetch new commits for ALL participants
  async syncNewCommits(): Promise<{
    success: boolean;
    message: string;
    stats: {
      participantsChecked: number;
      newCommits: number;
      errors: number;
    };
  }> {
    try {
      console.log('🔄 Starting incremental commit sync for ALL participants...');

      // Get ALL participants
      const participants = await prisma.eventParticipant.findMany({
        where: { eventId: this.eventId },
        include: { user: { select: { githubUsername: true } } },
      });

      const usernames = participants
        .map(p => p.user.githubUsername || p.githubUsername)
        .filter(Boolean) as string[];

      console.log(`📋 Found ${usernames.length} total participants to sync`);

      let newCommitCount = 0;
      let errorCount = 0;

      // Process each participant individually (incremental approach)
      for (const participant of participants) {
        const username = participant.user.githubUsername || participant.githubUsername;
        if (!username) continue;

        try {
          console.log(`🔍 Syncing commits for ${username}...`);

          // Use event date range instead of last sync
          const searchFromDate = this.eventStartDate;
          const searchToDate = Math.min(Date.now(), this.eventEndDate.getTime()); // Don't search future dates
          const actualSearchToDate = new Date(searchToDate);

          console.log(
            `🔴 [DEBUG] ${username}: EVENT RANGE - from=${searchFromDate.toISOString()} to=${actualSearchToDate.toISOString()}`,
          );

          // Check if we already have commits for this user in this date range
          const existingCommits = await this.getExistingCommitsCount(username);
          console.log(`🔴 [DEBUG] ${username}: Already has ${existingCommits} commits tracked`);

          // Fetch commits in the event date range
          const commits = await this.fetchCommitsInEventRange(
            username,
            searchFromDate,
            actualSearchToDate,
          );

          // Save new commits (avoiding duplicates)
          const savedCommits = await this.saveNewCommits(username, commits);
          newCommitCount += savedCommits;

          // Update last sync time for tracking
          const nowTime = new Date();
          await prisma.eventParticipant.update({
            where: { id: participant.id },
            data: { lastSyncAt: nowTime },
          });

          console.log(`🔴 [DEBUG] ${username}: Updated lastSyncAt to ${nowTime.toISOString()}`);
          console.log(
            `  ✅ ${username}: ${savedCommits} new commits saved (${commits.length} found total)`,
          );

          // Small delay to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          errorCount++;
          console.error(`  ❌ Error syncing ${username}:`, error);
        }
      }

      return {
        success: true,
        message: `Synced ${newCommitCount} new commits from ${usernames.length} participants`,
        stats: {
          participantsChecked: usernames.length,
          newCommits: newCommitCount,
          errors: errorCount,
        },
      };
    } catch (error) {
      console.error('Sync error:', error);
      return {
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        stats: { participantsChecked: 0, newCommits: 0, errors: 1 },
      };
    }
  }

  // Fetch commits for a user in the event date range
  private async fetchCommitsInEventRange(
    username: string,
    fromDate: Date,
    toDate: Date,
  ): Promise<
    Array<{
      sha: string;
      message: string;
      repoName: string;
      committedAt: Date;
    }>
  > {
    const fromDateStr = fromDate.toISOString().split('T')[0];
    const toDateStr = toDate.toISOString().split('T')[0];

    // Use GitHub Search API with date range
    console.log(
      `🔴 [DEBUG] ${username}: GitHub Search query will be "author:${username} committer-date:${fromDateStr}..${toDateStr}"`,
    );

    // Calculate days back from today to the start date for the existing method
    const daysBack = Math.ceil((Date.now() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
    const commits = await this.githubService.getCommitsViaSearch(username, daysBack);

    // Filter commits to only include those in our event date range
    const filteredCommits = commits.filter(commit => {
      const commitDate = commit.timestamp.getTime();
      return commitDate >= fromDate.getTime() && commitDate <= toDate.getTime();
    });

    console.log(
      `🔴 [DEBUG] ${username}: Found ${commits.length} total commits, ${filteredCommits.length} in event range`,
    );

    return filteredCommits.map(commit => ({
      sha: commit.sha,
      message: commit.message,
      repoName: commit.repoName,
      committedAt: commit.timestamp,
    }));
  }

  // Get count of existing commits for a user
  private async getExistingCommitsCount(username: string): Promise<number> {
    return await prisma.eventCommit.count({
      where: {
        eventId: this.eventId,
        username,
        committedAt: {
          gte: this.eventStartDate,
          lte: this.eventEndDate,
        },
      },
    });
  }

  // Save new commits, avoiding duplicates
  private async saveNewCommits(
    username: string,
    commits: Array<{
      sha: string;
      message: string;
      repoName: string;
      committedAt: Date;
    }>,
  ): Promise<number> {
    let savedCount = 0;

    for (const commit of commits) {
      try {
        // Use upsert to handle duplicates gracefully
        await prisma.eventCommit.upsert({
          where: {
            eventId_sha: {
              eventId: this.eventId,
              sha: commit.sha,
            },
          },
          update: {}, // Don't update if already exists
          create: {
            eventId: this.eventId,
            username,
            sha: commit.sha,
            message: commit.message,
            repoName: commit.repoName,
            committedAt: commit.committedAt,
          },
        });
        savedCount++;
      } catch (error) {
        // Skip duplicates silently
        if ((error as { code?: string }).code !== 'P2002') {
          // Not a unique constraint violation
          console.error(`Error saving commit ${commit.sha}:`, error);
        }
      }
    }

    return savedCount;
  }

  // Get recent commits from database
  async getRecentCommits(limit: number = 50): Promise<{
    success: boolean;
    commits: Array<{
      username: string;
      sha: string;
      message: string;
      repoName: string;
      committedAt: string;
      createdAt: string;
    }>;
    total: number;
  }> {
    try {
      const commits = await prisma.eventCommit.findMany({
        where: { eventId: this.eventId },
        orderBy: { committedAt: 'desc' },
        take: limit,
      });

      return {
        success: true,
        commits: commits.map(commit => ({
          username: commit.username,
          sha: commit.sha,
          message: commit.message,
          repoName: commit.repoName,
          committedAt: commit.committedAt.toISOString(),
          createdAt: commit.createdAt.toISOString(),
        })),
        total: commits.length,
      };
    } catch (error) {
      console.error('Error fetching commits:', error);
      return {
        success: false,
        commits: [],
        total: 0,
      };
    }
  }

  // Get stats
  async getStats(): Promise<{
    totalParticipants: number;
    totalCommits: number;
    commitsLast24h: number;
    lastSyncAt: Date | null;
    eventStartDate: string;
    eventEndDate: string;
    currentDate: string;
  }> {
    const [participantCount, commitCount, recentCommits, lastSync] = await Promise.all([
      prisma.eventParticipant.count({ where: { eventId: this.eventId } }),
      prisma.eventCommit.count({
        where: {
          eventId: this.eventId,
          committedAt: {
            gte: this.eventStartDate,
            lte: this.eventEndDate,
          },
        },
      }),
      prisma.eventCommit.count({
        where: {
          eventId: this.eventId,
          committedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
            lte: this.eventEndDate,
          },
        },
      }),
      prisma.eventParticipant.findFirst({
        where: { eventId: this.eventId, lastSyncAt: { not: null } },
        orderBy: { lastSyncAt: 'desc' },
        select: { lastSyncAt: true },
      }),
    ]);

    return {
      totalParticipants: participantCount,
      totalCommits: commitCount,
      commitsLast24h: recentCommits,
      lastSyncAt: lastSync?.lastSyncAt || null,
      eventStartDate: this.eventStartDate.toISOString(),
      eventEndDate: this.eventEndDate.toISOString(),
      currentDate: new Date().toISOString(),
    };
  }
}

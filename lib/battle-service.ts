import { PrismaClient } from '@prisma/client';
import GitHubService from './github-service';

const prisma = new PrismaClient();

interface BattleCommit {
  username: string;
  commitSha: string;
  message: string;
  repoName: string;
  timestamp: Date;
  damage: number;
}

export class BattleService {
  private githubService: GitHubService;
  private eventId = 'mad-monkey-2025';

  constructor(githubToken?: string) {
    this.githubService = new GitHubService(githubToken);
  }

  // SIMPLIFIED: Just get and list commits to prove it works
  async getCommitsFromParticipants(): Promise<{
    success: boolean;
    participants: string[];
    commits: Array<{
      username: string;
      sha: string;
      message: string;
      repo: string;
      date: string;
    }>;
    total: number;
  }> {
    try {
      console.log('🔍 Getting commits from event participants...');

      // 1. Get participants
      const participants = await this.getEventParticipants();
      console.log(`📋 Found ${participants.length} participants:`, participants);

      const allCommits: Array<{
        username: string;
        sha: string;
        message: string;
        repo: string;
        date: string;
      }> = [];

      // 2. Search commits for participants (process in batches to avoid rate limits)
      const batchSize = 10; // Process 10 users at a time
      const maxUsers = 30; // Limit to first 30 users for now
      const usersToCheck = participants.slice(0, maxUsers);

      console.log(
        `🔍 Checking commits for ${usersToCheck.length} participants (limited for performance)...`,
      );

      for (let i = 0; i < usersToCheck.length; i += batchSize) {
        const batch = usersToCheck.slice(i, i + batchSize);

        // Process batch in parallel
        const batchPromises = batch.map(async username => {
          try {
            console.log(`🔍 Searching commits for ${username}...`);
            const commits = await this.githubService.getCommitsViaSearch(username, 7);

            const formattedCommits = commits.map(commit => ({
              username,
              sha: commit.sha,
              message: commit.message,
              repo: commit.repoName,
              date: commit.timestamp.toISOString(),
            }));

            console.log(`  ✅ Found ${commits.length} commits for ${username}`);
            return formattedCommits;
          } catch (error) {
            console.log(
              `  ❌ Error for ${username}:`,
              error instanceof Error ? error.message : 'Unknown error',
            );
            return [];
          }
        });

        // Wait for batch to complete
        const batchResults = await Promise.allSettled(batchPromises);

        // Add successful results
        batchResults.forEach(result => {
          if (result.status === 'fulfilled') {
            allCommits.push(...result.value);
          }
        });

        // Small delay between batches to respect rate limits
        if (i + batchSize < usersToCheck.length) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
        }
      }

      return {
        success: true,
        participants,
        commits: allCommits,
        total: allCommits.length,
      };
    } catch (error) {
      console.error('Error getting commits:', error);
      return {
        success: false,
        participants: [],
        commits: [],
        total: 0,
      };
    }
  }

  // Buscar participantes (igual ao sistema anterior)
  private async getEventParticipants(): Promise<string[]> {
    const participants = await prisma.eventParticipant.findMany({
      where: {
        eventId: 'first-community-event', // ID do evento real
      },
      include: {
        user: {
          select: {
            githubUsername: true,
          },
        },
      },
    });

    return participants
      .map(p => p.user.githubUsername || p.githubUsername)
      .filter(Boolean) as string[];
  }

  // NEW: Use GitHub Search API instead of events
  private async getCommitsViaSearch(username: string): Promise<BattleCommit[]> {
    try {
      console.log(`🔍 Searching commits for ${username} using GitHub Search API`);

      const commits = await this.githubService.getCommitsViaSearch(username, 7);

      return commits.map(commit => ({
        username,
        commitSha: commit.sha,
        message: commit.message,
        repoName: commit.repoName,
        timestamp: commit.timestamp,
        damage: this.calculateDamage(),
      }));
    } catch (error) {
      console.error(`Error searching commits for ${username}:`, error);
      return [];
    }
  }

  // DEPRECATED: Old event-based approach (keeping for reference)
  private async getRecentCommitsFromEvents(username: string): Promise<BattleCommit[]> {
    try {
      // Usar a MESMA API que o sistema de XP usa
      const events = await this.githubService.getPublicEventsForUser(username, 30);

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const commits: BattleCommit[] = [];

      console.log(`📅 Looking for commits after: ${sevenDaysAgo.toISOString()}`);

      for (const event of events) {
        if (event.type === 'PushEvent') {
          const eventDate = new Date(event.created_at!);
          console.log(`🕒 Found push event at: ${eventDate.toISOString()}`);

          // Só commits dos últimos 7 dias
          if (eventDate < sevenDaysAgo) {
            console.log(`⏰ Skipping old commit: ${eventDate.toISOString()}`);
            continue;
          }

          const payload = event.payload as { commits?: unknown[]; size?: number };
          const repoName = event.repo?.name || 'unknown';

          // Cada push gera UM battle log (simples)
          commits.push({
            username,
            commitSha: `${event.id}`, // ID único do evento
            message: this.generateCommitMessage(payload, repoName),
            repoName,
            timestamp: eventDate,
            damage: this.calculateDamage(),
          });

          console.log(`✅ ${username}: found commit in ${repoName}`);
        }
      }

      return commits;
    } catch (error) {
      console.error(`Error getting commits for ${username}:`, error);
      return [];
    }
  }

  private generateCommitMessage(
    payload: { commits?: unknown[]; size?: number },
    repoName: string,
  ): string {
    const commitCount = payload.commits?.length || payload.size || 1;
    return `${commitCount} commit${commitCount > 1 ? 's' : ''} to ${repoName}`;
  }

  private calculateDamage(): number {
    // Dano simples: 15-45
    return Math.floor(Math.random() * 30) + 15;
  }
}

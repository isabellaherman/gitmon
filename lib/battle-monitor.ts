import { Temporal } from '@js-temporal/polyfill';
import { GitHubService } from './github-service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CommitData {
  sha: string;
  message: string;
  author: string;
  date: string;
  repoName: string;
  additions: number;
  deletions: number;
  filesChanged: number;
}

export class BattleMonitor {
  private githubService: GitHubService;
  private eventId = 'mad-monkey-2025';
  private eventStart = Temporal.ZonedDateTime.from('2025-11-11T00:00:00[America/Sao_Paulo]');
  private eventEnd = Temporal.ZonedDateTime.from('2025-11-18T23:59:59[America/Sao_Paulo]');

  constructor(githubToken?: string) {
    this.githubService = new GitHubService(githubToken);
  }

  // Check if commit is within event period
  private isCommitInEventPeriod(commitDate: string): boolean {
    try {
      const commit = Temporal.Instant.from(commitDate).toZonedDateTimeISO('America/Sao_Paulo');
      return commit.since(this.eventStart).sign >= 0 &&
             this.eventEnd.since(commit).sign > 0;
    } catch {
      return false;
    }
  }

  // Calculate damage based on commit content
  private calculateCommitDamage(commit: CommitData): number {
    let damage = 10; // Base damage

    const message = commit.message.toLowerCase();

    // Bonus por tipo de commit
    if (message.includes('feat:') || message.includes('feature:')) damage += 30;
    if (message.includes('fix:')) damage += 25;
    if (message.includes('refactor:')) damage += 35;
    if (message.includes('perf:') || message.includes('performance:')) damage += 40;
    if (message.includes('test:')) damage += 15;
    if (message.includes('docs:')) damage += 10;
    if (message.includes('style:') || message.includes('ui:')) damage += 20;

    // Bonus por tamanho do commit
    const totalChanges = commit.additions + commit.deletions;
    if (totalChanges > 200) damage += 50; // MEGA HIT
    else if (totalChanges > 100) damage += 30; // CRITICAL HIT
    else if (totalChanges > 50) damage += 15; // BIG HIT

    // Bonus por arquivos alterados
    if (commit.filesChanged > 10) damage += 20;
    else if (commit.filesChanged > 5) damage += 10;

    // Penalty por commits muito pequenos
    if (totalChanges < 5) damage = Math.max(5, damage - 15);

    // Keywords especiais
    if (message.includes('breaking') || message.includes('major')) damage += 25;
    if (message.includes('hotfix') || message.includes('urgent')) damage += 20;

    return Math.min(150, damage); // Max 150 damage per commit
  }

  // Generate battle message based on commit
  private generateBattleMessage(commit: CommitData, damage: number): string {
    const emojis = {
      low: ['⚔️', '🗡️'],
      medium: ['🔥', '⚡', '💥'],
      high: ['🌟', '💫', '🚀'],
      critical: ['💀', '🌋', '⭐']
    };

    let emoji = '⚔️';
    let attackType = 'ATAQUE';

    if (damage > 100) {
      emoji = emojis.critical[Math.floor(Math.random() * emojis.critical.length)];
      attackType = 'ATAQUE DEVASTADOR';
    } else if (damage > 60) {
      emoji = emojis.high[Math.floor(Math.random() * emojis.high.length)];
      attackType = 'ATAQUE CRÍTICO';
    } else if (damage > 30) {
      emoji = emojis.medium[Math.floor(Math.random() * emojis.medium.length)];
      attackType = 'ATAQUE FORTE';
    } else {
      emoji = emojis.low[Math.floor(Math.random() * emojis.low.length)];
    }

    const truncatedMessage = commit.message.length > 50
      ? commit.message.substring(0, 50) + '...'
      : commit.message;

    return `${emoji} @${commit.author} commitou "${truncatedMessage}" - ${attackType}! (-${damage} HP)`;
  }

  // Get recent commits for a user since last check
  async getRecentCommits(username: string): Promise<CommitData[]> {
    try {
      // Get last checked commit from cache
      const cache = await prisma.participantActivityCache.findUnique({
        where: {
          eventId_username: {
            eventId: this.eventId,
            username: username
          }
        }
      });

      const lastChecked = cache?.lastChecked || this.eventStart.toInstant().toString();

      // Get user's public events (limited but fast)
      const { data: events } = await this.githubService['octokit'].rest.activity.listPublicEventsForUser({
        username,
        per_page: 30
      });

      const commits: CommitData[] = [];

      for (const event of events) {
        if (event.type === 'PushEvent') {
          const payload = event.payload as any;
          const repoName = event.repo?.name || 'unknown';

          for (const commit of payload.commits || []) {
            // Skip if we've already processed this commit
            if (cache?.lastCommitSha === commit.sha) break;

            // Check if commit is in event period
            if (!this.isCommitInEventPeriod(event.created_at!)) continue;

            // Check if commit is newer than last check
            const commitDate = new Date(event.created_at!);
            if (commitDate <= new Date(lastChecked)) continue;

            commits.push({
              sha: commit.sha,
              message: commit.message,
              author: username,
              date: event.created_at!,
              repoName,
              additions: 0, // GitHub events API doesn't provide this
              deletions: 0,
              filesChanged: 1
            });
          }
        }
      }

      return commits;

    } catch (error) {
      console.error(`Error getting commits for ${username}:`, error);
      return [];
    }
  }

  // Process commits and create battle logs
  async processCommits(commits: CommitData[]): Promise<void> {
    for (const commit of commits) {
      const damage = this.calculateCommitDamage(commit);
      const message = this.generateBattleMessage(commit, damage);

      try {
        // Create battle log entry
        await prisma.battleLog.create({
          data: {
            eventId: this.eventId,
            username: commit.author,
            actionType: 'commit',
            message,
            timestamp: new Date(commit.date),
            damageDealt: damage,
            commitSha: commit.sha,
            repoName: commit.repoName,
            metadata: {
              additions: commit.additions,
              deletions: commit.deletions,
              filesChanged: commit.filesChanged,
              originalMessage: commit.message
            }
          }
        });

        // Update activity cache
        await prisma.participantActivityCache.upsert({
          where: {
            eventId_username: {
              eventId: this.eventId,
              username: commit.author
            }
          },
          update: {
            lastCommitSha: commit.sha,
            lastActivity: new Date(commit.date),
            lastChecked: new Date(),
            totalCommits: { increment: 1 },
            totalDamage: { increment: damage }
          },
          create: {
            eventId: this.eventId,
            username: commit.author,
            lastCommitSha: commit.sha,
            lastActivity: new Date(commit.date),
            lastChecked: new Date(),
            totalCommits: 1,
            totalDamage: damage
          }
        });

        console.log(`✅ Processed commit by ${commit.author}: ${damage} damage`);

      } catch (error) {
        console.error(`Error processing commit ${commit.sha}:`, error);
      }
    }
  }

  // Monitor all participants
  async monitorAllParticipants(): Promise<void> {
    try {
      console.log('🔍 Starting participant monitoring...');

      // Get all participants
      const participants = await prisma.eventParticipant.findMany({
        where: {
          eventId: 'first-community-event'
        },
        include: {
          user: {
            select: {
              githubUsername: true
            }
          }
        }
      });

      const usernames = participants
        .map(p => p.user.githubUsername || p.githubUsername)
        .filter(Boolean) as string[];

      console.log(`Found ${usernames.length} participants to monitor`);

      // Process in batches to respect rate limits
      const batchSize = 5;
      for (let i = 0; i < usernames.length; i += batchSize) {
        const batch = usernames.slice(i, i + batchSize);

        console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(usernames.length/batchSize)}`);

        const batchPromises = batch.map(async (username) => {
          const commits = await this.getRecentCommits(username);
          if (commits.length > 0) {
            console.log(`📝 ${username}: ${commits.length} new commits`);
            await this.processCommits(commits);
          }
        });

        await Promise.allSettled(batchPromises);

        // Rate limit delay: 2 seconds between batches
        if (i + batchSize < usernames.length) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      console.log('✅ Monitoring cycle completed');

    } catch (error) {
      console.error('❌ Error in monitoring cycle:', error);
    }
  }

  // Check rate limit status
  async checkRateLimit(): Promise<void> {
    try {
      const rateLimit = await this.githubService.getRateLimit();
      if (rateLimit) {
        const remaining = rateLimit.remaining;
        const total = rateLimit.limit;
        const percentage = Math.round((remaining / total) * 100);

        console.log(`🔋 GitHub API Rate Limit: ${remaining}/${total} (${percentage}% remaining)`);

        if (percentage < 20) {
          console.log('⚠️  WARNING: Rate limit running low!');
        }
      }
    } catch (error) {
      console.error('Error checking rate limit:', error);
    }
  }
}

export default BattleMonitor;
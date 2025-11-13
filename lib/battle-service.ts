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

  // REUTILIZAR o sistema de XP para buscar commits dos participantes
  async refreshBattleLogs(): Promise<{ success: boolean; message: string; stats: any }> {
    try {
      console.log('🔍 Starting battle log refresh using XP system...');

      // 1. Buscar participantes do evento (igual ao sistema original)
      const participants = await this.getEventParticipants();
      console.log(`📋 Found ${participants.length} participants`);

      const newCommits: BattleCommit[] = [];

      // 2. Para cada participante, usar a MESMA lógica do XP
      for (const username of participants) {
        try {
          console.log(`🔍 Checking ${username}...`);

          // REUTILIZAR getWeeklyXp que já funciona perfeitamente
          const weeklyXp = await this.githubService.getWeeklyXp(username, true);

          if (weeklyXp > 0) {
            // Buscar os eventos reais que geraram esse XP
            const recentCommits = await this.getRecentCommitsFromEvents(username);
            newCommits.push(...recentCommits);
          }

        } catch (error) {
          console.log(`⚠️ Error checking ${username}: ${error.message}`);
        }
      }

      console.log(`🎯 Found ${newCommits.length} total recent commits`);

      // 3. Salvar como battle logs (evitando duplicatas)
      const savedLogs = await this.saveBattleLogs(newCommits);

      return {
        success: true,
        message: `Found ${newCommits.length} commits, saved ${savedLogs} new battle logs`,
        stats: {
          participants: participants.length,
          commitsFound: newCommits.length,
          newLogsSaved: savedLogs
        }
      };

    } catch (error) {
      console.error('Battle log refresh error:', error);
      return {
        success: false,
        message: `Error: ${error.message}`,
        stats: {}
      };
    }
  }

  // Buscar participantes (igual ao sistema anterior)
  private async getEventParticipants(): Promise<string[]> {
    const participants = await prisma.eventParticipant.findMany({
      where: {
        eventId: 'first-community-event' // ID do evento real
      },
      include: {
        user: {
          select: {
            githubUsername: true
          }
        }
      }
    });

    return participants
      .map(p => p.user.githubUsername || p.githubUsername)
      .filter(Boolean) as string[];
  }

  // REUTILIZAR a lógica de eventos do GitHub Service
  private async getRecentCommitsFromEvents(username: string): Promise<BattleCommit[]> {
    try {
      // Usar a MESMA API que o sistema de XP usa
      const { data: events } = await this.githubService['octokit'].rest.activity.listPublicEventsForUser({
        username,
        per_page: 30
      });

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

          const payload = event.payload as any;
          const repoName = event.repo?.name || 'unknown';

          // Cada push gera UM battle log (simples)
          commits.push({
            username,
            commitSha: `${event.id}`, // ID único do evento
            message: this.generateCommitMessage(payload, repoName),
            repoName,
            timestamp: eventDate,
            damage: this.calculateDamage()
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

  private generateCommitMessage(payload: any, repoName: string): string {
    const commitCount = payload.commits?.length || payload.size || 1;
    return `${commitCount} commit${commitCount > 1 ? 's' : ''} to ${repoName}`;
  }

  private calculateDamage(): number {
    // Dano simples: 15-45
    return Math.floor(Math.random() * 30) + 15;
  }

  // Salvar battle logs evitando duplicatas
  private async saveBattleLogs(commits: BattleCommit[]): Promise<number> {
    let savedCount = 0;

    for (const commit of commits) {
      try {
        // Verificar se já existe (por commitSha único)
        const existing = await prisma.battleLog.findFirst({
          where: {
            commitSha: commit.commitSha,
            eventId: this.eventId
          }
        });

        if (existing) continue; // Skip duplicate

        // Criar battle log com mensagem épica
        const epicMessage = this.generateBattleMessage(commit);

        await prisma.battleLog.create({
          data: {
            eventId: this.eventId,
            username: commit.username,
            actionType: 'commit',
            message: epicMessage,
            timestamp: commit.timestamp,
            damageDealt: commit.damage,
            commitSha: commit.commitSha,
            repoName: commit.repoName,
            metadata: {
              originalMessage: commit.message,
              fromXpSystem: true
            }
          }
        });

        savedCount++;
        console.log(`💾 Saved: ${commit.username} - ${commit.repoName}`);

      } catch (error) {
        console.error(`Error saving commit ${commit.commitSha}:`, error);
      }
    }

    return savedCount;
  }

  private generateBattleMessage(commit: BattleCommit): string {
    return `@${commit.username} dealt ${commit.damage} damage to MadMonkey`;
  }

  // Buscar battle logs existentes
  async getBattleLogs(limit: number = 50) {
    return await prisma.battleLog.findMany({
      where: { eventId: this.eventId },
      orderBy: { timestamp: 'desc' },
      take: limit
    });
  }
}
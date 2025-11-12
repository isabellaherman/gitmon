import { PrismaClient } from '@prisma/client';
import { GitHubService } from './github-service';

const prisma = new PrismaClient();

interface CommitData {
  sha: string;
  message: string;
  author: string;
  date: string;
  repoName: string;
}

export class SimpleBattleService {
  private githubService: GitHubService;
  private eventId = 'mad-monkey-2025';
  // USAR PERÍODO REAL: últimos 7 dias (onde tem commits de verdade)
  private eventStartDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 dias atrás
  private eventEndDate = new Date(); // Agora

  constructor(githubToken: string) {
    this.githubService = new GitHubService(githubToken);
  }

  // MÉTODO PRINCIPAL: buscar e processar commits de todos os participantes
  async refreshAllParticipants(): Promise<{ success: boolean; message: string; stats: Record<string, unknown> }> {
    try {
      console.log('🔍 Starting battle log refresh...');

      // 1. Buscar participantes do NEON DB
      const participants = await this.getEventParticipants();
      console.log(`📋 Found ${participants.length} participants`);

      // 2. Para cada participante, buscar commits da GitHub API
      const allCommits: CommitData[] = [];
      const batchSize = 10; // Aumentar batch size (GitHub permite 5000/hora)

      for (let i = 0; i < participants.length; i += batchSize) {
        const batch = participants.slice(i, i + batchSize);
        console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(participants.length/batchSize)}`);

        const batchCommits = await Promise.allSettled(
          batch.map(username => this.getUserCommitsInEventPeriod(username))
        );

        // Flatten successful results
        batchCommits.forEach(result => {
          if (result.status === 'fulfilled') {
            allCommits.push(...result.value);
          }
        });

        // Delay reduzido: 500ms em vez de 1000ms
        if (i + batchSize < participants.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      console.log(`🎯 Found ${allCommits.length} total commits in event period`);

      // 3. Salvar novos commits como battle logs
      const newLogs = await this.saveNewBattleLogs(allCommits);

      return {
        success: true,
        message: `Refreshed successfully! Found ${allCommits.length} commits, saved ${newLogs} new battle logs`,
        stats: {
          participants: participants.length,
          commitsFound: allCommits.length,
          newLogsCreated: newLogs
        }
      };

    } catch (error) {
      console.error('Error in refreshAllParticipants:', error);
      return {
        success: false,
        message: `Error: ${error.message}`,
        stats: {}
      };
    }
  }

  // Buscar participantes do event_participants
  private async getEventParticipants(): Promise<string[]> {
    const participants = await prisma.eventParticipant.findMany({
      where: {
        eventId: 'first-community-event' // Este é o ID do seu evento
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

  // Buscar commits de um usuário no período real (últimos 7 dias)
  private async getUserCommitsInEventPeriod(username: string): Promise<CommitData[]> {
    try {
      console.log(`🔍 Getting commits for ${username} in last 7 days...`);

      // Usar GitHub Events API diretamente (como o sistema de XP)
      const { data: events } = await this.githubService['octokit'].rest.activity.listPublicEventsForUser({
        username,
        per_page: 30
      });

      const commits: CommitData[] = [];

      for (const event of events) {
        if (event.type === 'PushEvent') {
          const eventDate = new Date(event.created_at!);

          // Filtrar por período dos últimos 7 dias
          if (eventDate < this.eventStartDate) {
            continue;
          }

          const payload = event.payload as any;
          const repoName = event.repo?.name || 'unknown';
          const commitCount = payload.commits?.length || payload.size || 1;

          commits.push({
            sha: `${event.id}-${repoName}`, // ID único baseado no evento
            message: `${commitCount} commits to ${repoName}`,
            author: username,
            date: event.created_at!,
            repoName
          });
        }
      }

      if (commits.length > 0) {
        console.log(`✅ ${username}: found ${commits.length} recent commits`);
      }

      return commits;

    } catch (error) {
      console.error(`Error getting commits for ${username}:`, error);
      return [];
    }
  }

  // Salvar apenas commits novos como battle logs
  private async saveNewBattleLogs(commits: CommitData[]): Promise<number> {
    let newLogsCount = 0;

    // OTIMIZAÇÃO: buscar todos os SHAs existentes de uma vez
    const existingCommitShas = new Set(
      (await prisma.battleLog.findMany({
        where: {
          eventId: this.eventId,
          commitSha: { in: commits.map(c => c.sha) }
        },
        select: { commitSha: true }
      })).map(log => log.commitSha)
    );

    for (const commit of commits) {
      try {
        // Verificar se já existe (agora O(1) lookup)
        if (existingCommitShas.has(commit.sha)) continue;

        // Calcular dano e mensagem
        const damage = this.calculateCommitDamage(commit);
        const message = this.generateBattleMessage(commit, damage);

        // Salvar no banco
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
              originalMessage: commit.message,
              isAutoGenerated: true
            }
          }
        });

        newLogsCount++;

      } catch (error) {
        console.error(`Error saving commit ${commit.sha}:`, error);
      }
    }

    return newLogsCount;
  }

  // Algoritmo simples de dano
  private calculateCommitDamage(commit: CommitData): number {
    let damage = 15; // Base damage
    const message = commit.message.toLowerCase();

    // Bonus por tipo
    if (message.includes('feat:')) damage += 25;
    if (message.includes('fix:')) damage += 20;
    if (message.includes('refactor:')) damage += 30;
    if (message.includes('perf:')) damage += 35;

    // Random variation
    damage += Math.floor(Math.random() * 10);

    return Math.min(100, Math.max(10, damage));
  }

  // Gerar mensagem de batalha
  private generateBattleMessage(commit: CommitData, damage: number): string {
    const emojis = ['⚔️', '🗡️', '🔥', '⚡', '💥'];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];

    const attackType = damage > 50 ? 'CRITICAL HIT' : damage > 30 ? 'STRONG ATTACK' : 'ATTACK';

    const shortMessage = commit.message.length > 40
      ? commit.message.substring(0, 40) + '...'
      : commit.message;

    return `${emoji} @${commit.author} "${shortMessage}" - ${attackType}! (-${damage} HP)`;
  }

  // Buscar logs existentes
  async getBattleLogs(limit: number = 50): Promise<Record<string, unknown>[]> {
    return await prisma.battleLog.findMany({
      where: {
        eventId: this.eventId,
        // Filtrar por período se necessário
        timestamp: {
          gte: this.eventStartDate,
          lte: this.eventEndDate
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: limit
    });
  }
}
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { GitHubService } from '@/lib/github-service';

const prisma = new PrismaClient();

export async function POST() {
  try {
    console.log('🔍 Buscando commits reais dos participantes...');

    // Get a GitHub token from any logged user
    const account = await prisma.account.findFirst({
      where: {
        provider: 'github',
        access_token: { not: null }
      }
    });

    if (!account?.access_token) {
      return NextResponse.json({
        error: 'Precisa de usuário logado para acessar GitHub API',
        success: false
      }, { status: 400 });
    }

    // Get all event participants
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

    console.log(`📋 Encontrados ${usernames.length} participantes`);

    const githubService = new GitHubService(account.access_token);
    const realCommits = [];

    // Process in small batches to respect rate limits
    const batchSize = 5;
    for (let i = 0; i < Math.min(20, usernames.length); i += batchSize) {
      const batch = usernames.slice(i, i + batchSize);
      console.log(`📦 Processando batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(Math.min(20, usernames.length)/batchSize)}`);

      const batchPromises = batch.map(async (username) => {
        try {
          const { data: events } = await githubService['octokit'].rest.activity.listPublicEventsForUser({
            username,
            per_page: 10
          });

          // Get recent commits from any time (not just 2025)
          const pushEvents = events.filter(e => e.type === 'PushEvent');

          for (const event of pushEvents.slice(0, 2)) {
            const payload = event.payload as any;
            const repo = event.repo?.name || 'unknown';

            // Only include commits from November 11, 2025 onwards
            const eventDate = new Date(event.created_at!);
            const eventStartDate = new Date('2025-11-11T00:00:00Z');

            if (eventDate < eventStartDate) {
              continue; // Skip commits from before the event started
            }

            // Create logs even with minimal data from push events
            if (payload && (payload.size > 0 || payload.commits?.length > 0 || payload.head)) {
              const size = payload.size || payload.commits?.length || 1;
              const commitMsg = payload.commits?.[0]?.message || `${size} commit${size > 1 ? 's' : ''} pushed to ${repo}`;
              const damage = calculateDamage(commitMsg, size);

              realCommits.push({
                username,
                repo,
                message: commitMsg,
                date: event.created_at!,
                damage,
                sha: payload.commits?.[0]?.sha || payload.head || `event-${event.id}`,
                size: size
              });
            }
          }

        } catch (error) {
          console.log(`❌ Erro para ${username}:`, error.message);
        }
      });

      await Promise.allSettled(batchPromises);

      // Rate limit delay
      if (i + batchSize < Math.min(20, usernames.length)) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`🎯 Encontrados ${realCommits.length} commits reais`);

    // Create battle logs for real commits
    const createdLogs = [];
    for (const commit of realCommits) {
      try {
        // Check if this commit already exists
        const existingLog = await prisma.battleLog.findFirst({
          where: {
            commitSha: commit.sha,
            eventId: 'mad-monkey-2025'
          }
        });

        if (existingLog) {
          console.log(`⏭️ Commit ${commit.sha.substring(0, 8)} já existe, pulando...`);
          continue;
        }

        const battleMessage = generateBattleMessage(commit);

        const log = await prisma.battleLog.create({
          data: {
            eventId: 'mad-monkey-2025',
            username: commit.username,
            actionType: 'commit',
            message: battleMessage,
            timestamp: new Date(commit.date),
            damageDealt: commit.damage,
            commitSha: commit.sha,
            repoName: commit.repo,
            metadata: {
              originalMessage: commit.message,
              commitSize: commit.size,
              isRealCommit: true
            }
          }
        });

        createdLogs.push(log);

      } catch (error) {
        console.log(`❌ Erro criando log:`, error.message);
      }
    }

    console.log(`✅ Criados ${createdLogs.length} battle logs`);

    return NextResponse.json({
      message: `Sucesso! Encontrados ${realCommits.length} commits reais de ${Math.min(20, usernames.length)} participantes`,
      participantsChecked: Math.min(20, usernames.length),
      commitsFound: realCommits.length,
      logsCreated: createdLogs.length,
      commits: realCommits.slice(0, 5), // Show sample
      success: true
    });

  } catch (error) {
    console.error('❌ Erro geral:', error);
    return NextResponse.json({
      error: `Falha ao buscar commits reais: ${error.message}`,
      success: false
    }, { status: 500 });
  }
}

function calculateDamage(message: string, size: number): number {
  let damage = 10 + (size * 2); // Base + size bonus

  const msg = message.toLowerCase();
  if (msg.includes('feat:') || msg.includes('feature')) damage += 25;
  if (msg.includes('fix:') || msg.includes('bug')) damage += 20;
  if (msg.includes('refactor:')) damage += 30;
  if (msg.includes('breaking')) damage += 40;

  return Math.min(100, Math.max(10, damage));
}

function generateBattleMessage(commit: any): string {
  const damage = commit.damage;
  let emoji = '⚔️';

  if (damage > 80) {
    emoji = '💥';
  } else if (damage > 60) {
    emoji = '🔥';
  } else if (damage > 40) {
    emoji = '⚡';
  }

  return `${emoji} @${commit.username} attacks MadMonkey with <span style="color: red; font-weight: bold;">${damage} damage</span>`;
}
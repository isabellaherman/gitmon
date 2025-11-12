import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { GitHubService } from '@/lib/github-service';
import { Temporal } from '@js-temporal/polyfill';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get session to check if user is logged in
    const session = await getServerSession();

    // Get participants from the Mad Monkey event
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

    const participantUsernames = participants
      .map(p => p.user.githubUsername || p.githubUsername)
      .filter(Boolean) as string[];

    // Get existing battle logs
    const battleLogs = await prisma.battleLog.findMany({
      where: {
        eventId: 'mad-monkey-2025'
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 50
    });

    // Simple approach: just return existing logs
    // No automatic refresh to avoid duplication and complexity

    return NextResponse.json({
      participants: participantUsernames,
      participantCount: participantUsernames.length,
      logs: battleLogs,
      success: true
    });

  } catch (error) {
    console.error('Error in battle-logs API:', error.message);
    console.error('Stack trace:', error.stack);
    return NextResponse.json(
      { error: `Failed to fetch battle logs: ${error.message}`, success: false },
      { status: 500 }
    );
  }
}

async function refreshRecentCommits(participantUsernames: string[], session: any) {
  try {
    // Get user's GitHub access token (same as weekly XP system)
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user?.id || '',
        provider: 'github'
      }
    });

    if (!account?.access_token) {
      console.log('No GitHub token available for commit refresh');
      return;
    }

    const githubService = new GitHubService(account.access_token);
    const eventStart = Temporal.ZonedDateTime.from('2025-11-11T00:00:00[America/Sao_Paulo]');
    const now = Temporal.Now.zonedDateTimeISO('America/Sao_Paulo');

    // Check only a few users per page load (to avoid rate limits)
    const usersToCheck = participantUsernames.slice(0, 3);

    for (const username of usersToCheck) {
      // Check if we already have recent data for this user
      const lastLog = await prisma.battleLog.findFirst({
        where: {
          eventId: 'mad-monkey-2025',
          username: username
        },
        orderBy: {
          timestamp: 'desc'
        }
      });

      // Skip if we have data from the last hour
      if (lastLog && new Date().getTime() - new Date(lastLog.timestamp).getTime() < 60 * 60 * 1000) {
        continue;
      }

      // Get recent commits (same pattern as weekly XP)
      const commits = await getRecentCommits(githubService, username, eventStart, now);

      for (const commit of commits.slice(0, 3)) { // Limit to 3 most recent
        // Check if we already processed this commit
        const existingLog = await prisma.battleLog.findFirst({
          where: {
            commitSha: commit.sha
          }
        });

        if (existingLog) continue;

        const damage = calculateCommitDamage(commit);
        const message = generateBattleMessage(commit, damage);

        await prisma.battleLog.create({
          data: {
            eventId: 'mad-monkey-2025',
            username: commit.author,
            actionType: 'commit',
            message,
            timestamp: new Date(commit.date),
            damageDealt: damage,
            commitSha: commit.sha,
            repoName: commit.repoName,
            metadata: {
              originalMessage: commit.message
            }
          }
        });
      }
    }

  } catch (error) {
    console.error('Error refreshing commits:', error);
  }
}

async function getRecentCommits(githubService: GitHubService, username: string, eventStart: any, now: any) {
  try {
    const { data: events } = await githubService['octokit'].rest.activity.listPublicEventsForUser({
      username,
      per_page: 10
    });

    const commits: any[] = [];

    for (const event of events) {
      if (event.type === 'PushEvent') {
        const payload = event.payload as any;
        const repoName = event.repo?.name || 'unknown';

        // Check if event is in our time range
        const eventTime = Temporal.Instant.from(event.created_at!).toZonedDateTimeISO('America/Sao_Paulo');
        if (eventTime.since(eventStart).sign < 0 || now.since(eventTime).sign < 0) continue;

        for (const commit of (payload.commits || []).slice(0, 2)) {
          commits.push({
            sha: commit.sha,
            message: commit.message,
            author: username,
            date: event.created_at!,
            repoName
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

function calculateCommitDamage(commit: any): number {
  let damage = 10;
  const message = commit.message.toLowerCase();

  if (message.includes('feat:')) damage += 30;
  if (message.includes('fix:')) damage += 25;
  if (message.includes('refactor:')) damage += 35;
  if (message.includes('perf:')) damage += 40;

  return Math.min(100, damage);
}

function generateBattleMessage(commit: any, damage: number): string {
  const emoji = damage > 50 ? '🔥' : damage > 30 ? '⚔️' : '🗡️';
  const attackType = damage > 50 ? 'ATAQUE CRÍTICO' : 'ATAQUE';

  const truncatedMessage = commit.message.length > 50
    ? commit.message.substring(0, 50) + '...'
    : commit.message;

  return `${emoji} @${commit.author} commitou "${truncatedMessage}" - ${attackType}! (-${damage} HP)`;
}

export async function POST(request: Request) {
  try {
    const { eventId, username, actionType, message, damageDealt, commitSha, repoName, metadata } = await request.json();

    const battleLog = await prisma.battleLog.create({
      data: {
        eventId,
        username,
        actionType,
        message,
        timestamp: new Date(),
        damageDealt: damageDealt || 0,
        commitSha,
        repoName,
        metadata
      }
    });

    return NextResponse.json({ battleLog, success: true });

  } catch (error) {
    console.error('Error creating battle log:', error);
    return NextResponse.json(
      { error: 'Failed to create battle log', success: false },
      { status: 500 }
    );
  }
}
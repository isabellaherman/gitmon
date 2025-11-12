import { NextResponse } from 'next/server';
import { GitHubService } from '@/lib/github-service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Test with your current GitHub OAuth tokens from the database
    const accounts = await prisma.account.findMany({
      where: {
        provider: 'github',
        access_token: { not: null }
      },
      take: 1
    });

    if (accounts.length === 0) {
      return NextResponse.json({
        error: 'No GitHub tokens found. Please login with GitHub first.',
        success: false
      });
    }

    const account = accounts[0];
    const githubService = new GitHubService(account.access_token!);

    // Test getting commits for active participants
    console.log('Testing GitHub API with real token...');

    const testUsers = ['Yagasaki7K', 'gabsdotco', 'thelinuxlich', 'Vinccius', 'lucasgianine'];
    const allCommits = [];

    for (const username of testUsers) {
      try {
        const { data: events } = await githubService['octokit'].rest.activity.listPublicEventsForUser({
          username,
          per_page: 5
        });

        const recentEvents = events.filter(e => e.type === 'PushEvent').slice(0, 2);
        console.log(`${username}: found ${events.length} events, ${recentEvents.length} push events`);

        for (const event of recentEvents) {
          const payload = event.payload as any;
          console.log(`  Event date: ${event.created_at}, commits: ${(payload.commits || []).length}`);
          console.log(`  Payload:`, JSON.stringify(payload, null, 2));
          for (const commit of (payload.commits || []).slice(0, 1)) {
            allCommits.push({
              sha: commit.sha,
              message: commit.message,
              author: username,
              date: event.created_at,
              repo: event.repo?.name
            });
          }
        }
      } catch (error) {
        console.log(`Error for ${username}:`, error.message);
      }
    }

    const commits = allCommits;

    // Create battle logs for these real commits
    const createdLogs = [];
    for (const commit of commits) {
      const damage = calculateDamage(commit.message);
      const message = `⚔️ @${commit.author} commitou "${commit.message.substring(0, 50)}..." - ATAQUE REAL! (-${damage} HP)`;

      const log = await prisma.battleLog.create({
        data: {
          eventId: 'mad-monkey-2025',
          username: commit.author,
          actionType: 'commit',
          message,
          timestamp: new Date(commit.date),
          damageDealt: damage,
          commitSha: commit.sha,
          repoName: commit.repo,
          metadata: {
            originalMessage: commit.message,
            isRealCommit: true
          }
        }
      });

      createdLogs.push(log);
    }

    return NextResponse.json({
      message: `Found ${commits.length} real commits from participants`,
      commits,
      createdLogs: createdLogs.length,
      success: true
    });

  } catch (error) {
    console.error('Error testing real commits:', error);
    return NextResponse.json({
      error: `GitHub API error: ${error.message}`,
      success: false
    }, { status: 500 });
  }
}

function calculateDamage(message: string): number {
  let damage = 10;
  const msg = message.toLowerCase();

  if (msg.includes('feat:')) damage += 30;
  if (msg.includes('fix:')) damage += 25;
  if (msg.includes('refactor:')) damage += 35;

  return Math.min(80, damage);
}
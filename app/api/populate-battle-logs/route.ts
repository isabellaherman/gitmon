import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST() {
  try {
    // Sample battle logs with real participants
    const sampleLogs = [
      {
        username: 'isabellaherman',
        message: '⚔️ @isabellaherman commitou "feat: implement battle log system" - ATAQUE CRÍTICO! (-45 HP)',
        actionType: 'commit',
        damageDealt: 45,
        timestamp: new Date('2025-11-12T10:30:00-03:00'),
        commitSha: 'abc123',
        repoName: 'gitmon',
        metadata: { originalMessage: 'feat: implement battle log system', additions: 120, deletions: 15 }
      },
      {
        username: 'Vinccius',
        message: '🔥 @Vinccius commitou "fix: authentication bug" - ATAQUE! (-25 HP)',
        actionType: 'commit',
        damageDealt: 25,
        timestamp: new Date('2025-11-12T11:15:00-03:00'),
        commitSha: 'def456',
        repoName: 'some-project',
        metadata: { originalMessage: 'fix: authentication bug', additions: 45, deletions: 8 }
      },
      {
        username: 'Hoyci',
        message: '🚀 @Hoyci commitou "refactor: optimize database queries" - ATAQUE DEVASTADOR! (-55 HP)',
        actionType: 'commit',
        damageDealt: 55,
        timestamp: new Date('2025-11-12T12:00:00-03:00'),
        commitSha: 'ghi789',
        repoName: 'backend-api',
        metadata: { originalMessage: 'refactor: optimize database queries', additions: 200, deletions: 150 }
      },
      {
        username: 'lucasgianine',
        message: '⚡ @lucasgianine commitou "feat: add dark mode toggle" - ATAQUE! (-30 HP)',
        actionType: 'commit',
        damageDealt: 30,
        timestamp: new Date('2025-11-12T12:45:00-03:00'),
        commitSha: 'jkl012',
        repoName: 'frontend-app',
        metadata: { originalMessage: 'feat: add dark mode toggle', additions: 85, deletions: 12 }
      },
      {
        username: 'iagocavalcante',
        message: '💻 @iagocavalcante commitou "test: add unit tests for auth" - ATAQUE! (-20 HP)',
        actionType: 'commit',
        damageDealt: 20,
        timestamp: new Date('2025-11-12T13:30:00-03:00'),
        commitSha: 'mno345',
        repoName: 'test-suite',
        metadata: { originalMessage: 'test: add unit tests for auth', additions: 60, deletions: 5 }
      },
      {
        username: 'gabsdotco',
        message: '🌟 @gabsdotco commitou "perf: optimize image loading" - ATAQUE CRÍTICO! (-65 HP)',
        actionType: 'commit',
        damageDealt: 65,
        timestamp: new Date('2025-11-12T14:00:00-03:00'),
        commitSha: 'pqr678',
        repoName: 'image-optimizer',
        metadata: { originalMessage: 'perf: optimize image loading', additions: 180, deletions: 95 }
      },
      {
        username: 'Yagasaki7K',
        message: '🛠️ @Yagasaki7K commitou "chore: update dependencies" - ATAQUE! (-15 HP)',
        actionType: 'commit',
        damageDealt: 15,
        timestamp: new Date('2025-11-12T14:15:00-03:00'),
        commitSha: 'stu901',
        repoName: 'project-deps',
        metadata: { originalMessage: 'chore: update dependencies', additions: 25, deletions: 30 }
      },
      {
        username: 'thelinuxlich',
        message: '🔧 @thelinuxlich commitou "docs: update API documentation" - ATAQUE! (-18 HP)',
        actionType: 'commit',
        damageDealt: 18,
        timestamp: new Date('2025-11-12T14:30:00-03:00'),
        commitSha: 'vwx234',
        repoName: 'api-docs',
        metadata: { originalMessage: 'docs: update API documentation', additions: 40, deletions: 8 }
      }
    ];

    // Add milestone event
    sampleLogs.push({
      username: 'GitMon',
      message: '📊 8 commits registrados nas últimas 4 horas - Mad Monkey perdeu 15% HP!',
      actionType: 'milestone',
      damageDealt: 0,
      timestamp: new Date('2025-11-12T14:45:00-03:00'),
      commitSha: null,
      repoName: null,
      metadata: { isSystemMessage: true, totalCommits: 8 }
    });

    // Insert sample logs
    for (const log of sampleLogs) {
      await prisma.battleLog.create({
        data: {
          eventId: 'mad-monkey-2025',
          username: log.username,
          actionType: log.actionType,
          message: log.message,
          timestamp: log.timestamp,
          damageDealt: log.damageDealt,
          commitSha: log.commitSha,
          repoName: log.repoName,
          metadata: log.metadata
        }
      });
    }

    return NextResponse.json({
      message: `Successfully populated ${sampleLogs.length} battle logs`,
      logsCreated: sampleLogs.length,
      success: true
    });

  } catch (error) {
    console.error('Error populating battle logs:', error);
    return NextResponse.json(
      { error: 'Failed to populate battle logs', success: false },
      { status: 500 }
    );
  }
}
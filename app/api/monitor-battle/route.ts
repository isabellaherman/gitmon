import { NextResponse } from 'next/server';
import { BattleMonitor } from '@/lib/battle-monitor';

export async function POST() {
  try {
    const githubToken = process.env.GITHUB_TOKEN;

    if (!githubToken) {
      return NextResponse.json(
        { error: 'GitHub token not configured', success: false },
        { status: 500 }
      );
    }

    const monitor = new BattleMonitor(githubToken);

    // Check rate limit first
    await monitor.checkRateLimit();

    // Monitor all participants
    await monitor.monitorAllParticipants();

    return NextResponse.json({
      message: 'Battle monitoring completed successfully',
      timestamp: new Date().toISOString(),
      success: true
    });

  } catch (error) {
    console.error('Error in battle monitoring:', error);
    return NextResponse.json(
      { error: 'Battle monitoring failed', success: false },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const githubToken = process.env.GITHUB_TOKEN;

    if (!githubToken) {
      return NextResponse.json(
        { error: 'GitHub token not configured', success: false },
        { status: 500 }
      );
    }

    const monitor = new BattleMonitor(githubToken);
    await monitor.checkRateLimit();

    return NextResponse.json({
      message: 'Battle monitor is ready',
      timestamp: new Date().toISOString(),
      success: true
    });

  } catch (error) {
    console.error('Error checking battle monitor:', error);
    return NextResponse.json(
      { error: 'Battle monitor check failed', success: false },
      { status: 500 }
    );
  }
}
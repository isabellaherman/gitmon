import { NextResponse } from 'next/server';
import { getConnectionStats } from '@/lib/sse-broadcast';

export async function GET(request: Request) {
  const startTime = Date.now();

  try {
    // 1. Security: Check CRON_SECRET bearer token
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.CRON_SECRET;

    if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
      console.error('[Event Sync] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Event Sync] Starting event sync process...');

    // 2. Get connection stats to see if anyone is listening
    const connectionStats = getConnectionStats();
    console.log('[Event Sync] Current SSE connections:', connectionStats.activeConnections);

    // 3. Always run quick sync (but it's lightweight)
    const syncResponse = await fetch(`${request.url.split('/api/')[0]}/api/events/quick-sync`, {
      method: 'POST',
      headers: {
        Authorization: authHeader, // Pass through auth
      },
    });

    const syncResult = await syncResponse.json();
    const duration = Date.now() - startTime;

    // 4. Return results
    const response = {
      success: syncResult.success,
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      stats: {
        sseConnections: connectionStats.activeConnections,
        connectionUtilization: connectionStats.utilizationPercentage,
        syncStats: syncResult.stats || null,
        newCommits: syncResult.stats?.newCommits || 0,
      },
      message: syncResult.message,
    };

    console.log('[Event Sync] Completed:', {
      duration: `${duration}ms`,
      newCommits: syncResult.stats?.newCommits || 0,
      connections: connectionStats.activeConnections,
    });

    return NextResponse.json(response);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[Event Sync] Critical error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error during event sync',
        timestamp: new Date().toISOString(),
        duration: `${duration}ms`,
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

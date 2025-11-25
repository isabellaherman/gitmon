import { NextRequest } from 'next/server';
import { EventCommitService } from '@/lib/event-commit-service';
import { prisma } from '@/lib/prisma';
import { addConnection, removeConnection, sendEventToConnection } from '@/lib/sse-broadcast';

export async function GET(request: NextRequest) {
  // Get client IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';

  // Generate unique connection ID
  const connectionId = `${ip}-${Date.now()}-${Math.random()}`;

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Try to add connection with rate limiting
      const added = addConnection(connectionId, controller, ip);
      if (!added) {
        controller.error(new Error('Connection limit reached'));
        return;
      }

      // Send event helper function
      const sendEvent = (eventType: string, data: unknown) => {
        return sendEventToConnection(connectionId, eventType, data);
      };

      // Send initial stats
      const sendInitialStats = async () => {
        try {
          const githubAccount = await prisma.account.findFirst({
            where: {
              provider: 'github',
              access_token: { not: null }
            }
          });

          if (githubAccount?.access_token) {
            const commitService = new EventCommitService(githubAccount.access_token);
            const stats = await commitService.getStats();
            const recentCommits = await commitService.getRecentCommits(10);

            sendEvent('initial-data', {
              stats,
              commits: recentCommits.commits
            });
          }
        } catch (error) {
          console.error('Error fetching initial stats:', error);
          sendEvent('error', { message: 'Failed to load initial data' });
        }
      };

      // Send heartbeat every 30 seconds to keep connection alive
      const heartbeatInterval = setInterval(() => {
        sendEvent('heartbeat', { timestamp: new Date().toISOString() });
      }, 30000);

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeatInterval);
        removeConnection(connectionId);
        try {
          controller.close();
        } catch (err) {
          // Connection already closed
        }
      });

      // Send initial data
      sendInitialStats();
    },

    cancel() {
      // Connection closed by client
      removeConnection(connectionId);
    }
  });

  // Return SSE response
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}
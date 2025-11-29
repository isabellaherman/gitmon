import { useState, useEffect, useRef, useCallback } from 'react';

interface EventStats {
  totalParticipants: number;
  totalCommits: number;
  commitsLast24h: number;
  lastSyncAt: string | null;
  eventStartDate: string;
  eventEndDate: string;
  currentDate: string;
}

interface EventCommit {
  username: string;
  sha: string;
  message: string;
  repoName: string;
  committedAt: string;
  createdAt: string;
}

interface UseEventStreamReturn {
  stats: EventStats | null;
  commits: EventCommit[];
  isConnected: boolean;
  connectionError: string | null;
  lastUpdate: Date | null;
  retryConnection: () => void;
  fallbackToPolling: boolean;
}

const DEFAULT_STATS: EventStats = {
  totalParticipants: 0,
  totalCommits: 0,
  commitsLast24h: 0,
  lastSyncAt: null,
  eventStartDate: '',
  eventEndDate: '',
  currentDate: '',
};

export function useEventStream(): UseEventStreamReturn {
  const [stats, setStats] = useState<EventStats | null>(null);
  const [commits, setCommits] = useState<EventCommit[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [fallbackToPolling, setFallbackToPolling] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCount = useRef(0);

  // Fallback polling function
  const pollForUpdates = useCallback(async () => {
    if (!fallbackToPolling) return;

    try {
      const response = await fetch('/api/event-commits');
      const data = await response.json();

      if (data.success) {
        setStats(data.stats || DEFAULT_STATS);
        setCommits(data.commits || []);
        setLastUpdate(new Date());
        setConnectionError(null);
      }
    } catch (error) {
      console.error('Polling error:', error);
      setConnectionError('Failed to fetch updates');
    }
  }, [fallbackToPolling]);

  // Start polling as fallback
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) return;

    setFallbackToPolling(true);
    // Poll every 2 minutes for fallback
    pollingIntervalRef.current = setInterval(pollForUpdates, 120000);
    // Immediate poll
    pollForUpdates();
  }, [pollForUpdates]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setFallbackToPolling(false);
  }, []);

  // Connect to SSE stream
  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Clear any existing retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    try {
      console.log('🔴 [SSE] Connecting to event stream...');
      const eventSource = new EventSource('/api/events/damage-stream');
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('🔴 [SSE] Connected successfully');
        setIsConnected(true);
        setConnectionError(null);
        retryCount.current = 0;
        stopPolling(); // Stop polling if SSE works
      };

      eventSource.onmessage = event => {
        console.log('🔴 [SSE] Received message:', event.data);
      };

      eventSource.addEventListener('initial-data', event => {
        try {
          const data = JSON.parse(event.data);
          console.log('🔴 [SSE] Initial data received:', data);
          setStats(data.stats || DEFAULT_STATS);
          setCommits(data.commits || []);
          setLastUpdate(new Date());
        } catch (error) {
          console.error('Error parsing initial data:', error);
        }
      });

      eventSource.addEventListener('new-commits', event => {
        try {
          const data = JSON.parse(event.data);
          console.log('🔴 [SSE] New commits received:', data);
          setStats(data.stats || DEFAULT_STATS);
          setCommits(data.recentCommits || []);
          setLastUpdate(new Date());
        } catch (error) {
          console.error('Error parsing new commits data:', error);
        }
      });

      eventSource.addEventListener('stats-update', event => {
        try {
          const data = JSON.parse(event.data);
          console.log('🔴 [SSE] Stats update received:', data);
          setStats(data.stats || DEFAULT_STATS);
          setCommits(data.recentCommits || []);
          setLastUpdate(new Date());
        } catch (error) {
          console.error('Error parsing stats update:', error);
        }
      });

      eventSource.addEventListener('heartbeat', event => {
        // Just keep the connection alive, no UI update needed
        console.log('🔴 [SSE] Heartbeat received');
      });

      eventSource.addEventListener('error', event => {
        console.error('🔴 [SSE] Error event:', event);
      });

      eventSource.onerror = error => {
        console.error('🔴 [SSE] Connection error:', error);
        setIsConnected(false);
        setConnectionError('Connection lost');

        // Retry logic with exponential backoff
        retryCount.current += 1;
        const retryDelay = Math.min(1000 * Math.pow(2, retryCount.current), 30000); // Max 30 seconds

        if (retryCount.current <= 5) {
          console.log(`🔴 [SSE] Retrying in ${retryDelay}ms (attempt ${retryCount.current})`);
          retryTimeoutRef.current = setTimeout(() => {
            connect();
          }, retryDelay);
        } else {
          console.log('🔴 [SSE] Max retries reached, falling back to polling');
          startPolling();
        }
      };
    } catch (error) {
      console.error('🔴 [SSE] Failed to create EventSource:', error);
      setConnectionError('Failed to connect');
      startPolling();
    }
  }, [startPolling, stopPolling]);

  // Manual retry function
  const retryConnection = useCallback(() => {
    retryCount.current = 0;
    setConnectionError(null);
    stopPolling();
    connect();
  }, [connect, stopPolling]);

  // Initialize connection
  useEffect(() => {
    // Check if EventSource is supported
    if (typeof EventSource === 'undefined') {
      console.log('🔴 [SSE] EventSource not supported, using polling');
      startPolling();
      return;
    }

    connect();

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      stopPolling();
    };
  }, [connect, startPolling, stopPolling]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Page became visible, reconnect if needed
        if (!isConnected && !fallbackToPolling) {
          retryConnection();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isConnected, fallbackToPolling, retryConnection]);

  return {
    stats,
    commits,
    isConnected,
    connectionError,
    lastUpdate,
    retryConnection,
    fallbackToPolling,
  };
}

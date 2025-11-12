"use client";

import { useState, useEffect } from "react";
import { Temporal } from "@js-temporal/polyfill";

interface BattleLogEntry {
  id: string;
  eventId: string;
  username: string;
  actionType: string;
  message: string;
  timestamp: string;
  damageDealt: number;
  commitSha?: string;
  repoName?: string;
  metadata?: Record<string, unknown>;
}

interface BattleLogProps {
  currentUsername?: string;
  isParticipant?: boolean;
}

export default function BattleLog({ currentUsername, isParticipant }: BattleLogProps) {
  const [logs, setLogs] = useState<BattleLogEntry[]>([]);
  const [participantCount, setParticipantCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchBattleLogs = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch the battle logs from simplified endpoint
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch('/api/simple-battle-refresh', {
        method: 'GET',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setLogs(data.logs);
        setParticipantCount(data.participantCount);
        setError(null);
      } else {
        setError(data.error || 'Unknown error occurred');
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Battle logs request timed out');
        setError('Request timed out. Please try again.');
      } else {
        console.error('Error fetching battle logs:', error);
        setError(error.message || 'Failed to fetch battle logs');
      }
      // Don't clear logs on error, keep previous state
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCommits = async () => {
    try {
      setIsRefreshing(true);
      setError(null);

      // Use the simplified service to refresh battle logs
      const response = await fetch('/api/simple-battle-refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to refresh');
      }

      // Fetch updated battle logs
      await fetchBattleLogs();

      console.log('✅', result.message);
    } catch (error) {
      console.error('Error refreshing commits:', error);
      setError('Failed to refresh commits');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Fetch real data from database only on page load
    fetchBattleLogs();
  }, []);

  const formatTime = (timestamp: string) => {
    try {
      const logTime = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - logTime.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMinutes < 1) {
        return 'agora';
      } else if (diffHours < 1) {
        return `${diffMinutes}m`;
      } else if (diffDays < 1) {
        return `${diffHours}h`;
      } else {
        return `${diffDays}d`;
      }
    } catch {
      return '';
    }
  };

  return (
    <div className="w-full mt-8">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-green-600" style={{ fontFamily: 'Minecraftia, monospace' }}>
            BATTLE LOG
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {participantCount} participantes • {logs.length} ataques registrados • Últimos 7 dias
          </p>
        </div>
        <button
          onClick={refreshCommits}
          disabled={isRefreshing}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isRefreshing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Updating...
            </>
          ) : (
            <>
              🔄 Refresh
            </>
          )}
        </button>
      </div>

      {/* Chat Container */}
      <div className="h-96 overflow-y-auto border rounded-lg p-4 bg-background">
        <div className="space-y-2">
          {isLoading ? (
            <div className="text-center text-muted-foreground py-8">
              <p>Loading battle logs...</p>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">
              <p>Error: {error}</p>
              <button
                onClick={fetchBattleLogs}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>Aguardando atividade dos trainers...</p>
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className={`p-2 rounded transition-colors ${
                  log.username === currentUsername
                    ? 'bg-green-100 dark:bg-green-900/20 border-l-4 border-l-green-500'
                    : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm break-words"
                      dangerouslySetInnerHTML={{ __html: log.message }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatTime(log.timestamp)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 text-center">
        {isParticipant ? (
          <p className="text-xs text-green-600 font-semibold">
            ✅ PARTICIPANDO - Seus commits aparecerão aqui!
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            {currentUsername ?
              'Junte-se ao evento para seus commits aparecerem no log!' :
              'Faça login para participar da batalha!'
            }
          </p>
        )}
      </div>
    </div>
  );
}
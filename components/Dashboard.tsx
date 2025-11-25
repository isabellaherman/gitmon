import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import GitMonDashboard from "@/components/GitMonDashboard";
import StreakDisplay from "@/components/StreakDisplay";
import { useEffect, useState } from "react";

interface DashboardProps {
  selectedMonster?: {
    src: string;
    name: string;
    type: string;
  } | null;
  currentUserInLeaderboard?: {
    level?: number;
    xp?: number;
    rank?: number;
    githubUsername?: string;
  };
  session?: {
    user?: {
      level?: number;
      xp?: number;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      githubUsername?: string;
    };
  };
  gitmonSelectedAt: Date;
  leaderboardPeriod: 'week' | 'all';
}

export default function Dashboard({
  selectedMonster,
  currentUserInLeaderboard,
  session,
  gitmonSelectedAt,
  leaderboardPeriod
}: DashboardProps) {
  const router = useRouter();
  const [currentStreak, setCurrentStreak] = useState(0);

  // Fetch streak data
  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const response = await fetch('/api/streak');
        if (response.ok) {
          const data = await response.json();
          setCurrentStreak(data.currentStreak);
        }
      } catch (error) {
        console.error('Failed to load streak:', error);
      }
    };

    if (session?.user?.email) {
      fetchStreak();
    }
  }, [session]);

  return (
    <div className="bg-card rounded-xl overflow-hidden">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold" style={{ fontFamily: 'Minecraftia, monospace' }}>
              Hello {currentUserInLeaderboard?.githubUsername || (session?.user?.email ? session.user.email.split('@')[0] : 'Trainer')}
            </h2>
            <p className="text-muted-foreground">
              Welcome back to your GitMon adventure
            </p>
          </div>

          {/* <div className="flex gap-2">
            <button
              className="px-4 py-2 rounded-full border text-sm font-medium transition-colors bg-primary text-primary-foreground border-primary"
            >
              This Week
            </button>
            <button
              className="px-4 py-2 rounded-full border text-sm font-medium transition-colors bg-background text-muted-foreground hover:bg-muted/80 border-muted"
            >
              All Time
            </button>
          </div> */}
        </div>
      </div>

      <div className="px-6 py-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/gitdex')}
              className="rounded-full text-xs shadow-green-500/30 hover:shadow-green-500/50 transition-shadow drop-shadow-none"
              style={{ boxShadow: '0 0 15px rgba(34, 197, 94, 0.3)' }}
            >
              📚 GITDEX
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://github.com/isabellaherman/gitmon', '_blank')}
              className="rounded-full text-xs"
            >
              ⭐ Star Project
            </Button>
          </div>
          {session?.user?.email ? (
            <StreakDisplay streak={currentStreak} />
          ) : (
            <span className="text-xs text-muted-foreground">
              created by{" "}
              <a
                href="https://x.com/IsabellaHermn"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Isabella Herman
              </a>
            </span>
          )}
        </div>
      </div>

      <div className="p-0 md:p-6">
        {selectedMonster && (
          <div className="p-6">
            <GitMonDashboard
              selectedMonster={selectedMonster}
              currentUserInLeaderboard={currentUserInLeaderboard}
              session={session}
              gitmonSelectedAt={gitmonSelectedAt}
              leaderboardPeriod={leaderboardPeriod}
              onStreakUpdate={() => {
                // Refresh streak in top nav when interaction updates it
                if (session?.user?.email) {
                  fetch('/api/streak')
                    .then(res => res.json())
                    .then(data => setCurrentStreak(data.currentStreak))
                    .catch(err => console.error('Failed to refresh streak:', err));
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
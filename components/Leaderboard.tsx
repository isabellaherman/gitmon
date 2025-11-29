import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { monsters } from '@/lib/monsters';

interface LeaderboardEntry {
  rank: number;
  name: string;
  githubUsername?: string;
  selectedMonsterId: number;
  level: number;
  xp: number;
  rank_title: string;
  stats: {
    commits: number;
    prs: number;
    stars: number;
    streak: number;
  };
}

interface LeaderboardProps {
  leaderboard: LeaderboardEntry[];
  isLoadingLeaderboard: boolean;
  leaderboardPeriod: 'week' | 'all';
  setLeaderboardPeriod: (period: 'week' | 'all') => void;
  totalTrainers: number;
}

export default function Leaderboard({
  leaderboard,
  isLoadingLeaderboard,
  leaderboardPeriod,
  setLeaderboardPeriod,
  totalTrainers,
}: LeaderboardProps) {
  const router = useRouter();

  return (
    <div className="bg-card rounded-xl overflow-hidden">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold" style={{ fontFamily: 'Minecraftia, monospace' }}>
              Top Trainers
            </h2>
            <p className="text-muted-foreground">
              {leaderboardPeriod === 'week'
                ? "This week's coding champions"
                : 'All-time coding legends'}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setLeaderboardPeriod('week')}
              className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                leaderboardPeriod === 'week'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground hover:bg-muted/80 border-muted'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setLeaderboardPeriod('all')}
              className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                leaderboardPeriod === 'all'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground hover:bg-muted/80 border-muted'
              }`}
            >
              All Time
            </button>
          </div>
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
          <span className="text-xs text-muted-foreground">
            created by{' '}
            <a
              href="https://x.com/IsabellaHermn"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Isabella Herman
            </a>
          </span>
        </div>
      </div>

      <div className="p-0 md:p-6">
        {/* Total trainers count - only on desktop - always visible */}
        <div className="hidden md:flex items-center gap-4 bg-muted/30">
          <div className="flex-1 text-right">
            <p className="text-xs text-muted-foreground">
              {totalTrainers.toLocaleString()} TRAINERS
            </p>
          </div>
        </div>
        {isLoadingLeaderboard ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading leaderboard...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-orange-600">Leaderboard under maintenance</p>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {leaderboard.map(user => (
              <div
                key={user.rank}
                className={`flex items-center gap-4 px-4 py-2 rounded-full transition-colors ${
                  user.rank <= 3
                    ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20'
                    : 'isCurrentUser' in user && user.isCurrentUser
                      ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20'
                      : 'bg-muted/50 hover:bg-muted'
                }`}
              >
                <div className="min-w-8 flex items-center justify-center font-bold text-sm text-muted-foreground">
                  #{user.rank}
                </div>

                <div className="flex-1">
                  {/* Desktop layout */}
                  <div className="hidden md:flex items-center gap-2">
                    <a
                      href={`https://github.com/${user.githubUsername || user.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold hover:text-primary transition-colors cursor-pointer hover:underline"
                    >
                      @{user.githubUsername || user.name}
                    </a>
                    <button
                      onClick={() => router.push(`/gitdex?monster=${user.selectedMonsterId}`)}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer hover:underline"
                    >
                      {monsters[user.selectedMonsterId]?.name || 'Unknown'}
                    </button>
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      <span className="hidden md:inline">Level {user.level}</span>
                      <span className="md:hidden">Lv. {user.level}</span>
                    </span>
                  </div>
                  {/* Mobile layout - stacked */}
                  <div className="md:hidden space-y-1">
                    <a
                      href={`https://github.com/${user.githubUsername || user.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold hover:text-primary transition-colors cursor-pointer hover:underline block"
                    >
                      @{user.githubUsername || user.name}
                    </a>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {monsters[user.selectedMonsterId]?.name || 'Unknown'}
                      </span>
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        <span className="hidden md:inline">Level {user.level}</span>
                        <span className="md:hidden">Lv. {user.level}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-bold text-primary">{user.xp.toLocaleString()} XP</p>
                    {/* Hide commit/PR info on mobile */}
                    <p className="text-xs text-muted-foreground hidden md:block">
                      {user.stats.commits} commits • {user.stats.prs} PRs
                    </p>
                  </div>

                  <div className="w-16 h-16 relative">
                    <Image
                      src={monsters[user.selectedMonsterId]?.src || monsters[0].src}
                      alt={monsters[user.selectedMonsterId]?.name || 'GitMon'}
                      fill
                      className="object-contain"
                      sizes="64px"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

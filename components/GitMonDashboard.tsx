import Image from "next/image";
import { getTypeColor, formatBirthdate } from "@/lib/monsters";
import PetInteraction from "@/components/PetInteraction";
import { useEffect, useState } from "react";

interface GitMonDashboardProps {
  selectedMonster: {
    src: string;
    name: string;
    type: string;
  };
  currentUserInLeaderboard?: {
    level?: number;
    xp?: number;
    rank?: number;
    currentStreak?: number;
    longestStreak?: number;
  };
  session?: {
    user?: {
      level?: number;
      xp?: number;
      currentStreak?: number;
      longestStreak?: number;
    };
  };
  gitmonSelectedAt: Date;
  leaderboardPeriod: 'week' | 'all';
  onStreakUpdate?: () => void;
}

export default function GitMonDashboard({
  selectedMonster,
  currentUserInLeaderboard,
  session,
  gitmonSelectedAt,
  leaderboardPeriod,
  onStreakUpdate
}: GitMonDashboardProps) {
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    longestStreak: 0,
    chromaticPoints: 0,
    orbs: 0
  });

  // Fetch streak data
  useEffect(() => {
    const fetchStreakData = async () => {
      try {
        const response = await fetch('/api/streak');
        if (response.ok) {
          const data = await response.json();
          setStreakData(data);
        }
      } catch (error) {
        console.error('Failed to load streak data:', error);
      }
    };

    if (session?.user?.email) {
      fetchStreakData();
    }
  }, [session]);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column - GitMon Display */}
      <div className="text-center">
        <div className="w-48 h-48 mx-auto mb-4 relative">
          <div className="absolute inset-4 rounded-full" style={{
            background: `radial-gradient(circle, #000 1px, transparent 1px)`,
            backgroundSize: '8px 8px',
            maskImage: 'radial-gradient(circle, black 40%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(circle, black 40%, transparent 70%)'
          }}></div>
          <Image
            src={selectedMonster.src}
            alt={selectedMonster.name}
            fill
            className="object-contain relative z-10 scale-110"
            sizes="192px"
          />
        </div>

        <div className="flex items-center justify-center gap-2 mb-3">
          <h3 className="text-xl font-bold" style={{ fontFamily: 'Minecraftia, monospace' }}>{selectedMonster.name}</h3>
          <span className="text-lg font-bold text-primary border border-primary/30 bg-primary/10 rounded-full px-2 py-1" style={{ fontFamily: 'Minecraftia, monospace' }}>
            Lv.{currentUserInLeaderboard?.level || session?.user?.level || 1}
          </span>
        </div>

        <div className="flex gap-2 justify-center mb-6">
          <span className={`px-3 py-1 rounded-full text-white text-xs font-medium uppercase ${getTypeColor(selectedMonster.type)}`}>
            {selectedMonster.type}
          </span>
          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
            Born {formatBirthdate(gitmonSelectedAt)}
          </span>
        </div>

        {/* Pet Interaction System */}
        <PetInteraction
          monsterName={selectedMonster.name}
          onStreakUpdate={onStreakUpdate}
        />
      </div>

      {/* Right Column - Stats and Info */}
      <div className="space-y-4">
        {/* Stats */}
        <div className="space-y-3">
          <div className="bg-muted rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-primary">
              {currentUserInLeaderboard?.xp?.toLocaleString() || session?.user?.xp?.toLocaleString() || 0} XP
            </p>
            <p className="text-sm text-muted-foreground">
              {leaderboardPeriod === 'week' ? 'This week' : 'All time'}
            </p>
          </div>

          <div className="bg-muted rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-primary">
              #{currentUserInLeaderboard?.rank || '???'}
            </p>
            <p className="text-sm text-muted-foreground">Your rank</p>
          </div>

          {/* Streak Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-primary">
                {streakData.currentStreak}
              </p>
              <p className="text-xs text-muted-foreground">Current Streak</p>
            </div>
            <div className="bg-muted rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-primary">
                {streakData.longestStreak}
              </p>
              <p className="text-xs text-muted-foreground">Best Streak</p>
            </div>
          </div>

          {/* Currency Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-purple-600">
                {streakData.chromaticPoints}
              </p>
              <p className="text-xs text-muted-foreground">Chromatic Points</p>
            </div>
            <div className="bg-muted rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-blue-600">
                {streakData.orbs}
              </p>
              <p className="text-xs text-muted-foreground">Orbs</p>
            </div>
          </div>
        </div>

        {/* Additional dashboard content */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-semibold mb-2">Recent Activity</h4>
          <p className="text-sm text-muted-foreground">Dashboard features coming soon...</p>
        </div>
      </div>
    </div>
  );
}
import Image from 'next/image';
import PetInteraction from '@/components/PetInteraction';
import LinkManager from '@/components/LinkManager';

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
      email?: string | null;
      name?: string | null;
      image?: string | null;
      currentStreak?: number;
      longestStreak?: number;
    };
  };
  gitmonSelectedAt: Date;
  leaderboardPeriod: 'week' | 'all';
  onStreakUpdate?: () => void;
}

export default function GitMonDashboard({ selectedMonster, onStreakUpdate }: GitMonDashboardProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column - GitMon Display */}
      <div className="text-center">
        <div className="w-48 h-48 mx-auto mb-4 relative">
          <div
            className="absolute inset-4 rounded-full"
            style={{
              background: `radial-gradient(circle, #000 1px, transparent 1px)`,
              backgroundSize: '8px 8px',
              maskImage: 'radial-gradient(circle, black 40%, transparent 70%)',
              WebkitMaskImage: 'radial-gradient(circle, black 40%, transparent 70%)',
            }}
          ></div>
          <Image
            src={selectedMonster.src}
            alt={selectedMonster.name}
            fill
            className="object-contain relative z-10 scale-110"
            sizes="192px"
          />
        </div>

        {/* <div className="flex items-center justify-center gap-2 mb-3">
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
        </div> */}

        {/* Pet Interaction System */}
        <PetInteraction monsterName={selectedMonster.name} onStreakUpdate={onStreakUpdate} />
      </div>

      {/* Right Column - Stats and Info */}
      <div className="space-y-4">
        {/* Link Manager */}
        <LinkManager />
      </div>
    </div>
  );
}

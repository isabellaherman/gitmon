import Image from "next/image";
import { getTypeColor, formatBirthdate } from "@/lib/monsters";

interface GitMonCardProps {
  selectedMonster: {
    src: string;
    name: string;
    type: string;
  };
  currentUserInLeaderboard?: {
    level?: number;
    xp?: number;
    rank?: number;
  };
  session?: {
    user?: {
      level?: number;
      xp?: number;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  };
  gitmonSelectedAt: Date;
  leaderboardPeriod: 'week' | 'all';
}

export default function GitMonCard({
  selectedMonster,
  currentUserInLeaderboard,
  session,
  gitmonSelectedAt,
  leaderboardPeriod
}: GitMonCardProps) {
  return (
    <div className="text-center mb-6">
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
          sizes="128px"
        />
      </div>

      <div className="flex items-center justify-center gap-2 mb-3">
        <h4 className="text-xl font-bold" style={{ fontFamily: 'Minecraftia, monospace' }}>{selectedMonster.name}</h4>
        <span className="text-lg font-bold text-primary border border-primary/30 bg-primary/10 rounded-full px-2 py-1" style={{ fontFamily: 'Minecraftia, monospace' }}>
          Lv.{currentUserInLeaderboard?.level || session?.user?.level || 1}
        </span>
      </div>

      <div className="flex gap-2 justify-center mb-4">
        <span className={`px-3 py-1 rounded-full text-white text-xs font-medium uppercase ${getTypeColor(selectedMonster.type)}`}>
          {selectedMonster.type}
        </span>
        <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
          Born {formatBirthdate(gitmonSelectedAt)}
        </span>
      </div>

      <div className="space-y-3 mb-6">
        <div className="bg-muted rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-primary">
            {currentUserInLeaderboard?.xp?.toLocaleString() || session?.user?.xp?.toLocaleString() || 0} XP
          </p>
          <p className="text-sm text-muted-foreground">
            {leaderboardPeriod === 'week' ? 'This week' : 'All time'}
          </p>
        </div>

        <div className="bg-muted rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-primary">
            #{currentUserInLeaderboard?.rank || '???'}
          </p>
          <p className="text-sm text-muted-foreground">Your rank</p>
        </div>
      </div>
    </div>
  );
}
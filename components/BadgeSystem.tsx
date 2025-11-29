import Image from 'next/image';
import { getUserBadges } from '@/data/badges';

interface UserData {
  eventParticipations?: { eventId: string }[];
  isGitMonContributor?: boolean;
  xp?: number;
}

interface BadgeWallProps {
  userData: UserData;
}

export default function BadgeWall({ userData }: BadgeWallProps) {
  const badges = getUserBadges(userData);

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-center">
        Badge Collection ({badges.filter(b => b.earned).length}/{badges.length})
      </h4>

      <div className="flex flex-wrap md:flex-nowrap justify-center gap-y-4 gap-x-2 md:gap-0 px-4 overflow-visible">
        {badges.map((badge, index) => (
          <div
            key={badge.id}
            className={`
              relative w-24 h-24 rounded-full flex items-center justify-center flex-shrink-0
              transition-all duration-300 cursor-pointer group
              hover:-translate-y-2 hover:scale-110 active:-translate-y-2 active:scale-110
              ${index > 0 ? 'md:-ml-3' : ''}
              ${
                badge.earned && badge.image
                  ? 'hover:z-30 active:z-30'
                  : badge.earned
                    ? 'hover:z-30 active:z-30 border-4 border-yellow-400 bg-yellow-50 hover:border-yellow-500'
                    : 'hover:z-20 active:z-20 border-4 border-gray-300 bg-gray-100 hover:border-gray-400'
              }
            `}
            style={{
              zIndex: 20 - index,
            }}
          >
            {badge.earned && badge.image ? (
              <Image
                src={badge.image}
                alt={badge.name}
                fill
                className="object-cover rounded-full"
                sizes="96px"
              />
            ) : null}

            {/* Tooltip on hover */}
            <span className="absolute top-full left-0 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {badge.earned ? `${badge.name} - ${badge.description}` : badge.description}
            </span>
          </div>
        ))}
      </div>

      <div className="text-center mt-4">
        <a
          href="https://gitmon.xyz/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          GitMon.xyz
        </a>
      </div>
    </div>
  );
}

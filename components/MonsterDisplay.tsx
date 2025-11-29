import Image from 'next/image';
import { getTypeColor, getTypeTextColor, formatBirthdate } from '@/lib/monsters';

interface Monster {
  id: number;
  src: string;
  name: string;
  type: string;
}

interface MonsterDisplayProps {
  monster: Monster;
  level: number;
  birthdate?: Date | string | null;
  size?: 'small' | 'medium' | 'large';
  showDetails?: boolean;
}

export default function MonsterDisplay({
  monster,
  level,
  birthdate,
  size = 'medium',
  showDetails = true,
}: MonsterDisplayProps) {
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-48 h-48',
    large: 'w-80 h-80',
  };

  const imageSizes = {
    small: '64px',
    medium: '192px',
    large: '320px',
  };

  return (
    <div className="text-center">
      <div className={`${sizeClasses[size]} mx-auto mb-4 relative`}>
        {size !== 'small' && (
          <div
            className="absolute inset-4 rounded-full"
            style={{
              background: `radial-gradient(circle, #000 1px, transparent 1px)`,
              backgroundSize: '8px 8px',
              maskImage: 'radial-gradient(circle, black 40%, transparent 70%)',
              WebkitMaskImage: 'radial-gradient(circle, black 40%, transparent 70%)',
            }}
          ></div>
        )}
        <Image
          src={monster.src}
          alt={monster.name}
          fill
          className={`object-contain relative z-10 ${size !== 'small' ? 'scale-110' : ''}`}
          sizes={imageSizes[size]}
        />
      </div>

      {showDetails && (
        <>
          <div className="flex items-center justify-center gap-3 mb-3">
            <h4
              className={`text-3xl font-bold ${getTypeTextColor(monster.type)}`}
              style={{ fontFamily: 'Minecraftia, monospace' }}
            >
              {monster.name}
            </h4>
            <span
              className="bg-red-500 text-white text-sm font-bold rounded-full px-3 py-1"
              style={{ fontFamily: 'Minecraftia, monospace' }}
            >
              Lv.{level}
            </span>
          </div>

          <div className="flex gap-2 justify-center mb-4">
            <span
              className={`px-3 py-1 rounded-full text-white text-xs font-medium uppercase ${getTypeColor(monster.type)}`}
            >
              {monster.type}
            </span>
            {birthdate && (
              <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                Born {formatBirthdate(birthdate)}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

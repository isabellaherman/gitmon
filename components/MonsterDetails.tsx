import Image from 'next/image';
import AdoptionStatus from './AdoptionStatus';
import { getAdoptionData } from '@/data/adoptions';

interface Monster {
  id: number;
  src: string;
  name: string;
  type: string;
}

interface MonsterDetailsProps {
  monster: Monster;
}

const getTypeColor = (type: string) => {
  const colors = {
    fire: 'bg-red-500',
    water: 'bg-blue-500',
    grass: 'bg-green-500',
    electric: 'bg-yellow-500',
    ice: 'bg-cyan-500',
    psychic: 'bg-purple-500',
    shadow: 'bg-gray-800',
    light: 'bg-yellow-300',
  };
  return colors[type as keyof typeof colors] || 'bg-gray-500';
};

const getMonsterDescription = (monster: Monster) => {
  const descriptions = {
    Shadrix:
      'A mysterious shadow-type GitMon that lurks in the depths of code repositories. Shadrix wanders through digital voids, devouring lines and golden commits.',
    Fairy:
      'A fiery and passionate GitMon that brings energy to any development team. Known for explosive code deployments and hot fixes.',
    Crystalix:
      'An ice-type GitMon with crystalline precision. Specializes in clean, structured code and cooling down heated merge conflicts.',
    Guarana:
      'A grass-type GitMon emerged from the heart of the Amazon Forest. Guarana watches over every repository through countless eyes hidden in its vines.',
    Volterra:
      'An electric-type GitMon that energizes development workflows. Powers through complex algorithms and charges up team productivity.',
    Aquarus:
      'A water-type GitMon that flows seamlessly through development cycles. Adapts to any environment and keeps projects fluid.',
    Infernus:
      'A powerful fire-type GitMon with intense coding abilities. It could ignite innovation… but usually chooses a nap instead.',
    Lumenis:
      'A bright grass-type GitMon that illuminates the path to clean code. Grows robust applications and nurtures developer skills.',
    Spectra:
      'A psychic-type GitMon with mind-reading debugging abilities. Predicts bugs before they happen and telepathically optimizes code.',
  };
  return (
    descriptions[monster.name as keyof typeof descriptions] ||
    'A mysterious GitMon with unknown abilities.'
  );
};

const getMonsterStats = (monster: Monster) => {
  const stats = {
    Shadrix: { attack: 85, defense: 70, speed: 95, special: 80 },
    Fairy: { attack: 90, defense: 65, speed: 80, special: 85 },
    Crystalix: { attack: 75, defense: 95, speed: 60, special: 90 },
    Guarana: { attack: 80, defense: 85, speed: 70, special: 85 },
    Volterra: { attack: 95, defense: 70, speed: 90, special: 75 },
    Aquarus: { attack: 70, defense: 80, speed: 85, special: 90 },
    Infernus: { attack: 100, defense: 75, speed: 85, special: 70 },
    Lumenis: { attack: 85, defense: 80, speed: 75, special: 90 },
    Spectra: { attack: 75, defense: 85, speed: 80, special: 95 },
  };
  return (
    stats[monster.name as keyof typeof stats] || { attack: 75, defense: 75, speed: 75, special: 75 }
  );
};

export default function MonsterDetails({ monster }: MonsterDetailsProps) {
  const stats = getMonsterStats(monster);
  const adoptionInfo = getAdoptionData(monster.name);

  return (
    <div className="space-y-6">
      {/* Monster Image and Basic Info */}
      <div className="text-center">
        {/* Adoption Status - Above Image */}
        <AdoptionStatus monsterName={monster.name} adoptionData={adoptionInfo} />

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
            src={monster.src}
            alt={monster.name}
            fill
            className="object-contain relative z-10 scale-110"
            sizes="192px"
          />
        </div>

        <div className="flex items-center justify-center gap-3 mb-4">
          <h2 className="text-3xl font-bold" style={{ fontFamily: 'Minecraftia, monospace' }}>
            {monster.name}
          </h2>
          <span
            className={`px-3 py-2 rounded-full text-white text-sm font-medium uppercase ${getTypeColor(monster.type)}`}
          >
            {monster.type}
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h3 className="font-semibold mb-2">Description</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {getMonsterDescription(monster)}
        </p>
      </div>

      {/* depois eu vejo isso 
      <div className="bg-muted/50 rounded-lg p-4">
        <h3 className="font-semibold mb-4">Base Stats</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Attack</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 transition-all duration-500"
                  style={{ width: `${stats.attack}%` }}
                />
              </div>
              <span className="text-sm font-mono w-8">{stats.attack}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Defense</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${stats.defense}%` }}
                />
              </div>
              <span className="text-sm font-mono w-8">{stats.defense}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Speed</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 transition-all duration-500"
                  style={{ width: `${stats.speed}%` }}
                />
              </div>
              <span className="text-sm font-mono w-8">{stats.speed}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Special</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 transition-all duration-500"
                  style={{ width: `${stats.special}%` }}
                />
              </div>
              <span className="text-sm font-mono w-8">{stats.special}</span>
            </div>
          </div>
        </div>
      </div> */}

      {/* Abilities 
      <div className="bg-muted/50 rounded-lg p-4">
        <h3 className="font-semibold mb-2">Special Abilities</h3>
        <div className="text-sm text-muted-foreground">
          <p>• Code Mastery: Enhanced debugging capabilities</p>
          <p>• Version Control: Advanced Git operations</p>
          <p>• Team Synergy: Boosts collaborative development</p>
        </div>
      </div>*/}
    </div>
  );
}

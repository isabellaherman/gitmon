import Image from 'next/image';

interface Monster {
  id: number;
  src: string;
  name: string;
  type: string;
}

interface MonsterGridProps {
  monsters: Monster[];
  selectedMonster: number;
  onMonsterSelect: (monsterId: number) => void;
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

export default function MonsterGrid({
  monsters,
  selectedMonster,
  onMonsterSelect,
}: MonsterGridProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {monsters.map(monster => (
        <div
          key={monster.id}
          onClick={() => onMonsterSelect(monster.id)}
          className={`group cursor-pointer rounded-xl border p-4 text-center transition-all duration-300 ${
            selectedMonster === monster.id
              ? 'ring-primary border-primary/50 bg-primary/5 scale-105 shadow-lg ring-2'
              : 'border-muted hover:border-primary/30 hover:bg-muted/50 hover:scale-102'
          } `}
        >
          <div className="relative mx-auto mb-3 h-16 w-16">
            <Image
              src={monster.src}
              alt={monster.name}
              fill
              className="object-contain transition-transform group-hover:scale-110"
              sizes="64px"
            />
          </div>
          <p className="text-foreground mb-2 text-sm font-medium">
            {monster.name}
          </p>
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium text-white uppercase ${getTypeColor(monster.type)}`}
          >
            {monster.type}
          </span>
        </div>
      ))}
    </div>
  );
}

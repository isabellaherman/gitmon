import Image from "next/image";

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
    fire: "bg-red-500",
    water: "bg-blue-500",
    grass: "bg-green-500",
    electric: "bg-yellow-500",
    ice: "bg-cyan-500",
    psychic: "bg-purple-500",
    shadow: "bg-gray-800",
    light: "bg-yellow-300",
  };
  return colors[type as keyof typeof colors] || "bg-gray-500";
};

export default function MonsterGrid({ monsters, selectedMonster, onMonsterSelect }: MonsterGridProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {monsters.map((monster) => (
        <div
          key={monster.id}
          onClick={() => onMonsterSelect(monster.id)}
          className={`
            group cursor-pointer transition-all duration-300 p-4 text-center rounded-xl border
            ${selectedMonster === monster.id
              ? 'ring-2 ring-primary shadow-lg scale-105 border-primary/50 bg-primary/5'
              : 'hover:scale-102 border-muted hover:border-primary/30 hover:bg-muted/50'
            }
          `}
        >
          <div className="w-16 h-16 mx-auto relative mb-3">
            <Image
              src={monster.src}
              alt={monster.name}
              fill
              className="object-contain transition-transform group-hover:scale-110"
              sizes="64px"
            />
          </div>
          <p className="text-sm font-medium text-foreground mb-2">
            {monster.name}
          </p>
          <span className={`px-2 py-1 rounded-full text-white text-xs font-medium uppercase ${getTypeColor(monster.type)}`}>
            {monster.type}
          </span>
        </div>
      ))}
    </div>
  );
}
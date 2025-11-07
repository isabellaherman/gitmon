export const monsters = [
  { id: 0, src: "/monsters/monster-000.png", name: "Shadrix", type: "shadow" },
  { id: 1, src: "/monsters/monster-001-png.png", name: "Fairy", type: "fire" },
  { id: 2, src: "/monsters/monster-002-png.png", name: "Crystalix", type: "ice" },
  { id: 3, src: "/monsters/monster-003-png.png", name: "Guarana", type: "grass" },
  { id: 4, src: "/monsters/monster-004-png.png", name: "Volterra", type: "electric" },
  { id: 5, src: "/monsters/monster-005-png.png", name: "Aquarus", type: "water" },
  { id: 6, src: "/monsters/monster-006-png.png", name: "Infernus", type: "fire" },
  { id: 7, src: "/monsters/monster-007.png", name: "Lumenis", type: "grass" },
  { id: 8, src: "/monsters/monster-008.png", name: "Spectra", type: "psychic" },
];

export const getTypeColor = (type: string) => {
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

export const getTypeTextColor = (type: string) => {
  const colors = {
    fire: "text-red-500",
    water: "text-blue-500",
    grass: "text-green-500",
    electric: "text-yellow-500",
    ice: "text-cyan-500",
    psychic: "text-purple-500",
    shadow: "text-gray-800",
    light: "text-yellow-300",
  };
  return colors[type as keyof typeof colors] || "text-gray-500";
};

export const formatBirthdate = (date: string | Date | null) => {
  if (!date) return "Unknown";
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const getMonsterById = (monsterId: number | null) => {
  return monsterId !== null && monsterId !== undefined ? monsters[monsterId] : null;
};
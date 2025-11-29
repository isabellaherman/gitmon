'use client';

interface MadMonkeyHealthBarProps {
  totalDamage: number;
  totalCommits: number;
  maxHp?: number;
}

export default function MadMonkeyHealthBar({
  totalDamage,
  totalCommits,
  maxHp = 10000,
}: MadMonkeyHealthBarProps) {
  const currentHp = Math.max(0, maxHp - totalDamage);
  const healthPercentage = (currentHp / maxHp) * 100;

  // Determine bar color based on health percentage
  const getHealthBarColor = () => {
    if (healthPercentage > 60) return 'bg-green-500';
    if (healthPercentage > 30) return 'bg-yellow-500';
    if (healthPercentage > 10) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Determine if boss is defeated
  const isDefeated = currentHp <= 0;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Boss Name */}
      <div className="text-center mb-2">
        {isDefeated && (
          <div
            className="text-green-600 font-bold animate-pulse"
            style={{ fontFamily: 'Minecraftia, monospace' }}
          >
            💀 DEFEATED! 💀
          </div>
        )}
      </div>
      <br></br>

      {/* Health Bar Container */}
      <div className="relative bg-gray-800 border-4 border-gray-600 rounded-lg h-8 mb-2">
        {/* Health Bar Fill */}
        <div
          className={`h-full rounded-sm transition-all duration-500 ease-out ${getHealthBarColor()}`}
          style={{ width: `${Math.max(0, healthPercentage)}%` }}
        >
          {/* Shine Effect */}
          <div className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-20 rounded-sm"></div>
        </div>

        {/* HP Text Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-white font-bold text-sm drop-shadow-lg"
            style={{ fontFamily: 'Minecraftia, monospace' }}
          >
            {currentHp.toLocaleString()} / {maxHp.toLocaleString()} HP
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{totalCommits.toLocaleString()} total hits</span>
        <span>{totalDamage.toLocaleString()} total damage dealt</span>
        <span>{healthPercentage.toFixed(1)}% remaining</span>
      </div>

      {isDefeated && (
        <div className="text-center mt-3 p-4 bg-green-100 border border-green-300 rounded-lg">
          <p className="text-green-800 font-bold">
            🎉 Congratulations! The GitMon community has successfully defeated the Mad Monkey! 🎉
          </p>
          <p className="text-green-700 text-sm mt-1">
            Thanks to {totalCommits} commits from brave GitTrainers, the realm is safe once again!
          </p>
        </div>
      )}
    </div>
  );
}

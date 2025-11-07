interface UserStatsProps {
  xp: number;
  totalCommits: number;
  totalPRs: number;
  currentStreak: number;
  totalStars: number;
}

export default function UserStats({
  xp,
  totalCommits,
  totalPRs,
  currentStreak,
  totalStars,
}: UserStatsProps) {
  return (
    <div className="space-y-3">
      <div className="bg-muted rounded-lg p-3 text-center">
        <p className="text-2xl font-bold text-primary">
          {xp.toLocaleString()} XP
        </p>
        <p className="text-sm text-muted-foreground">Total XP</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-muted rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-primary">{totalCommits}</p>
          <p className="text-xs text-muted-foreground">Commits</p>
        </div>
        <div className="bg-muted rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-primary">{totalPRs}</p>
          <p className="text-xs text-muted-foreground">Pull Requests</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-muted rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-primary">{currentStreak}</p>
          <p className="text-xs text-muted-foreground">Current Streak</p>
        </div>
        <div className="bg-muted rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-primary">{totalStars}</p>
          <p className="text-xs text-muted-foreground">Stars Earned</p>
        </div>
      </div>
    </div>
  );
}
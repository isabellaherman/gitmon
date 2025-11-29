import React from 'react';

interface ContributionGraphProps {
  totalCommits: number;
  className?: string;
}

export default function ContributionGraph({
  totalCommits,
  className = '',
}: ContributionGraphProps) {
  const weeks = 52;
  const daysPerWeek = 7;

  const generateContributions = () => {
    const contributions = [];
    const maxDaily = Math.min(Math.floor(totalCommits / 200), 4);

    for (let week = 0; week < weeks; week++) {
      const weekData = [];
      for (let day = 0; day < daysPerWeek; day++) {
        const isWeekend = day === 0 || day === 6;
        const intensity = isWeekend
          ? Math.random() < 0.3
            ? Math.floor(Math.random() * (maxDaily + 1))
            : 0
          : Math.random() < 0.7
            ? Math.floor(Math.random() * (maxDaily + 1))
            : 0;

        weekData.push(intensity);
      }
      contributions.push(weekData);
    }
    return contributions;
  };

  const contributions = generateContributions();

  const getIntensityColor = (intensity: number) => {
    switch (intensity) {
      case 0:
        return 'bg-gray-100 dark:bg-gray-800';
      case 1:
        return 'bg-green-200 dark:bg-green-900';
      case 2:
        return 'bg-green-300 dark:bg-green-700';
      case 3:
        return 'bg-green-400 dark:bg-green-600';
      case 4:
        return 'bg-green-500 dark:bg-green-500';
      default:
        return 'bg-gray-100 dark:bg-gray-800';
    }
  };

  return (
    <div className={`${className}`}>
      <div className="flex flex-col items-center space-y-2">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {totalCommits} contributions in the last year
        </h4>

        <div className="flex gap-1 overflow-x-auto">
          {contributions.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((intensity, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={`w-2.5 h-2.5 rounded-sm ${getIntensityColor(intensity)} transition-colors`}
                  title={`${intensity} contributions`}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-2">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-2.5 h-2.5 rounded-sm bg-gray-100 dark:bg-gray-800" />
            <div className="w-2.5 h-2.5 rounded-sm bg-green-200 dark:bg-green-900" />
            <div className="w-2.5 h-2.5 rounded-sm bg-green-300 dark:bg-green-700" />
            <div className="w-2.5 h-2.5 rounded-sm bg-green-400 dark:bg-green-600" />
            <div className="w-2.5 h-2.5 rounded-sm bg-green-500 dark:bg-green-500" />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import type { ContributionCalendar } from '@/lib/github-service';

interface ContributionHeatmapProps {
  calendar: ContributionCalendar;
  totalXp: number;
}

const DAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', ''];

const LIGHT_FILLS = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];
const DARK_FILLS = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];

function getIntensityLevel(count: number): number {
  if (count === 0) return 0;
  if (count <= 3) return 1;
  if (count <= 6) return 2;
  if (count <= 9) return 3;
  return 4;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ContributionHeatmap({ calendar }: ContributionHeatmapProps) {
  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  if (!calendar.weeks.length) return null;

  // Build month labels from first day of each week
  const monthLabels: { label: string; colIndex: number }[] = [];
  let lastMonth = -1;
  calendar.weeks.forEach((week, i) => {
    const firstDay = week.contributionDays[0];
    if (!firstDay) return;
    const month = new Date(firstDay.date + 'T00:00:00').getMonth();
    if (month !== lastMonth) {
      monthLabels.push({
        label: new Date(firstDay.date + 'T00:00:00').toLocaleDateString('en-US', {
          month: 'short',
        }),
        colIndex: i,
      });
      lastMonth = month;
    }
  });

  const cellSize = 12;
  const cellGap = 2;
  const step = cellSize + cellGap;
  const dayLabelWidth = 32;
  const headerHeight = 20;

  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-sm font-medium text-muted-foreground text-center">
        {(calendar.totalContributions * 5).toLocaleString()} XP in the last year
      </h4>

      <div className="overflow-x-auto mx-auto">
        <svg
          width={dayLabelWidth + calendar.weeks.length * step}
          height={headerHeight + 7 * step}
          className="block"
        >
          {/* Month labels */}
          {monthLabels.map((m, i) => (
            <text
              key={i}
              x={dayLabelWidth + m.colIndex * step}
              y={12}
              className="fill-muted-foreground"
              fontSize={10}
            >
              {m.label}
            </text>
          ))}

          {/* Day labels */}
          {DAY_LABELS.map(
            (label, i) =>
              label && (
                <text
                  key={i}
                  x={0}
                  y={headerHeight + i * step + cellSize - 2}
                  className="fill-muted-foreground"
                  fontSize={10}
                >
                  {label}
                </text>
              ),
          )}

          {/* Light mode cells */}
          <g className="block dark:hidden">
            {calendar.weeks.map((week, wi) =>
              week.contributionDays.map((day, di) => {
                const level = getIntensityLevel(day.contributionCount);
                return (
                  <rect
                    key={`${wi}-${di}`}
                    x={dayLabelWidth + wi * step}
                    y={headerHeight + di * step}
                    width={cellSize}
                    height={cellSize}
                    rx={2}
                    fill={LIGHT_FILLS[level]}
                    onMouseEnter={e => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltip({
                        text: `${day.contributionCount * 5} XP on ${formatDate(day.date)}`,
                        x: rect.left + rect.width / 2,
                        y: rect.top,
                      });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                );
              }),
            )}
          </g>

          {/* Dark mode cells */}
          <g className="hidden dark:block">
            {calendar.weeks.map((week, wi) =>
              week.contributionDays.map((day, di) => {
                const level = getIntensityLevel(day.contributionCount);
                return (
                  <rect
                    key={`${wi}-${di}`}
                    x={dayLabelWidth + wi * step}
                    y={headerHeight + di * step}
                    width={cellSize}
                    height={cellSize}
                    rx={2}
                    fill={DARK_FILLS[level]}
                    onMouseEnter={e => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltip({
                        text: `${day.contributionCount * 5} XP on ${formatDate(day.date)}`,
                        x: rect.left + rect.width / 2,
                        y: rect.top,
                      });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                );
              }),
            )}
          </g>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center text-xs text-muted-foreground gap-2">
        <span>Less</span>
        <div className="flex gap-1">
          {LIGHT_FILLS.map((_, i) => (
            <div key={i} className="w-3 h-3 rounded-sm">
              <svg width="12" height="12">
                <rect
                  width="12"
                  height="12"
                  rx={2}
                  className="block dark:hidden"
                  fill={LIGHT_FILLS[i]}
                />
                <rect
                  width="12"
                  height="12"
                  rx={2}
                  className="hidden dark:block"
                  fill={DARK_FILLS[i]}
                />
              </svg>
            </div>
          ))}
        </div>
        <span>More</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-2 py-1 text-xs bg-popover text-popover-foreground border rounded shadow-md pointer-events-none whitespace-nowrap"
          style={{
            left: tooltip.x,
            top: tooltip.y - 32,
            transform: 'translateX(-50%)',
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}

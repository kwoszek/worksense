export const STREAK_THRESHOLDS = [7, 14, 30, 90, 180, 365];

export function streakLevel(streak: number): number {
  let level = 0;
  for (let i = 0; i < STREAK_THRESHOLDS.length; i++) {
    if ((streak || 0) >= STREAK_THRESHOLDS[i]) level = i + 1;
  }
  return level;
}

export function getStreakColor(streak: number | undefined): string {
  const level = streakLevel(streak ?? 0);
  switch (level) {
    case 1:
      return '#f97316'; // orange
    case 2:
      return '#fb7185'; // pink
    case 3:
      return '#8b5cf6'; // violet
    case 4:
      return '#06b6d4'; // cyan
    case 5:
      return '#3b82f6'; // blue
    case 6:
      return '#10b981'; // green
    default:
      return '#94a3b8'; // gray for no streak
  }
}

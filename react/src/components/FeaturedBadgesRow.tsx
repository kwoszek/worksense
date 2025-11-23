import { badgeGradientStyle } from '@/utils/badgeColors';
import type { FeaturedBadgeSummary } from '@/services/forumApi';

interface Props {
  badges?: FeaturedBadgeSummary[] | null;
  className?: string;
  limit?: number;
}

export default function FeaturedBadgesRow({ badges, className = '', limit = 3 }: Props) {
  if (!badges || !badges.length) return null;
  const subset = badges.slice(0, limit);
  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {subset.map((badge) => {
        const style = badgeGradientStyle(badge.key) || {};
        const label = `${badge.name}${badge.level && badge.level > 1 ? ` • ${badge.level}` : ''}`;
        return (
          <span
            key={`${badge.key}-${badge.level ?? 0}`}
            className="inline-flex items-center rounded-full px-2 py-0.5 text-[0.7rem] font-medium text-white shadow-sm"
            style={style}
          >
            {label}
          </span>
        );
      })}
    </div>
  );
}

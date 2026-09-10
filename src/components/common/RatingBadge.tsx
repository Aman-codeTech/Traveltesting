import React from 'react';
import { Star } from 'lucide-react';

interface RatingBadgeProps {
  rating?: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export const RatingBadge: React.FC<RatingBadgeProps> = ({
  rating = 4.5,
  reviewCount,
  size = 'md',
  showCount = true,
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-0.5',
    lg: 'text-sm px-2.5 py-1',
  };

  const starSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <div className="flex items-center space-x-1">
      <span className={`inline-flex items-center space-x-1 font-bold rounded-lg bg-amber-50 text-amber-800 border border-amber-200/70 shadow-2xs ${sizeClasses[size]}`}>
        <Star className={`${starSizes[size]} fill-amber-400 text-amber-500`} />
        <span>{Number(rating).toFixed(1)}</span>
      </span>
      {showCount && reviewCount !== undefined && (
        <span className="text-slate-400 text-xs">({reviewCount.toLocaleString()})</span>
      )}
    </div>
  );
};

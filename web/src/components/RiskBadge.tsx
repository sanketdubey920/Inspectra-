import React from 'react';

interface RiskBadgeProps {
  score?: number;
  level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ score, level = 'LOW', size = 'md' }) => {
  const normalizedLevel = (level || 'LOW').toUpperCase();

  let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
  let dotColor = 'bg-emerald-500';

  if (normalizedLevel === 'MEDIUM') {
    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
    dotColor = 'bg-amber-500';
  } else if (normalizedLevel === 'HIGH') {
    badgeColor = 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800';
    dotColor = 'bg-orange-500';
  } else if (normalizedLevel === 'CRITICAL') {
    badgeColor = 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800';
    dotColor = 'bg-red-500 animate-pulse';
  }

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5 font-bold',
  }[size];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-semibold tracking-wide uppercase shadow-2xs ${badgeColor} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
      <span>{normalizedLevel}</span>
      {score !== undefined && <span className="opacity-80">({score}/100)</span>}
    </span>
  );
};

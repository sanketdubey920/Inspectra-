import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const s = (status || 'PENDING').toUpperCase();

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';

  if (['RESOLVED', 'COMPLIANT', 'COMPLETED', 'ACTIVE', 'LOCATION_VERIFIED', 'PASS'].includes(s)) {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
  } else if (['IN_PROGRESS', 'UNDER_REVIEW', 'SUBMITTED', 'ASSIGNED'].includes(s)) {
    colorClasses = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
  } else if (['PARTIALLY_COMPLIANT', 'PENDING', 'CLARIFICATION_REQUIRED'].includes(s)) {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
  } else if (['OVERDUE', 'NON_COMPLIANT', 'REJECTED', 'LOCATION_MISMATCH', 'FAIL', 'FLAGGED'].includes(s)) {
    colorClasses = 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800';
  }

  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center rounded-full border font-semibold tracking-wide uppercase ${colorClasses} ${sizeClass}`}>
      {s.replace(/_/g, ' ')}
    </span>
  );
};

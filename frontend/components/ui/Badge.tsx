import { ReactNode } from 'react';

const COLORS = {
  indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300',
  emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  red: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
} as const;

type BadgeColor = keyof typeof COLORS;

interface BadgeProps {
  color?: BadgeColor;
  className?: string;
  children?: ReactNode;
}

export default function Badge({ color = 'indigo', className = '', children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${COLORS[color]} ${className}`}>
      {children}
    </span>
  );
}

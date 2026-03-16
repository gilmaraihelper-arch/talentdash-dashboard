import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'red';
  className?: string;
}

const colorVariants = {
  blue: {
    bg: 'bg-blue-500',
    light: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
  },
  green: {
    bg: 'bg-emerald-500',
    light: 'bg-emerald-50',
    text: 'text-emerald-600',
    border: 'border-emerald-200',
  },
  yellow: {
    bg: 'bg-amber-500',
    light: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-amber-200',
  },
  purple: {
    bg: 'bg-violet-500',
    light: 'bg-violet-50',
    text: 'text-violet-600',
    border: 'border-violet-200',
  },
  orange: {
    bg: 'bg-orange-500',
    light: 'bg-orange-50',
    text: 'text-orange-600',
    border: 'border-orange-200',
  },
  red: {
    bg: 'bg-rose-500',
    light: 'bg-rose-50',
    text: 'text-rose-600',
    border: 'border-rose-200',
  },
};

export function StatsCard({ label, value, icon: Icon, color, className }: StatsCardProps) {
  const colors = colorVariants[color];

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl border bg-white',
        'hover:shadow-sm transition-all duration-200',
        colors.border,
        className
      )}
    >
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center text-white', colors.bg)}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className={cn('text-lg font-bold', colors.text)}>{value}</p>
      </div>
    </div>
  );
}

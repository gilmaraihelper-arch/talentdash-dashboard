import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SecondaryKPIProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'red';
  subtitle?: string;
  className?: string;
}

const colorVariants = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    icon: 'text-blue-600',
    iconBg: 'bg-blue-100',
    text: 'text-blue-900',
    subtitle: 'text-blue-600/70',
  },
  green: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    icon: 'text-emerald-600',
    iconBg: 'bg-emerald-100',
    text: 'text-emerald-900',
    subtitle: 'text-emerald-600/70',
  },
  yellow: {
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    icon: 'text-amber-600',
    iconBg: 'bg-amber-100',
    text: 'text-amber-900',
    subtitle: 'text-amber-600/70',
  },
  purple: {
    bg: 'bg-violet-50',
    border: 'border-violet-100',
    icon: 'text-violet-600',
    iconBg: 'bg-violet-100',
    text: 'text-violet-900',
    subtitle: 'text-violet-600/70',
  },
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-100',
    icon: 'text-orange-600',
    iconBg: 'bg-orange-100',
    text: 'text-orange-900',
    subtitle: 'text-orange-600/70',
  },
  red: {
    bg: 'bg-rose-50',
    border: 'border-rose-100',
    icon: 'text-rose-600',
    iconBg: 'bg-rose-100',
    text: 'text-rose-900',
    subtitle: 'text-rose-600/70',
  },
};

export function SecondaryKPI({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
  className,
}: SecondaryKPIProps) {
  const colors = colorVariants[color];

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl p-4 border transition-all duration-300',
        'hover:shadow-md hover:-translate-y-0.5',
        colors.bg,
        colors.border,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={cn('text-sm font-medium mb-1', colors.subtitle)}>{title}</p>
          <p className={cn('text-2xl font-bold', colors.text)}>{value}</p>
          {subtitle && <p className={cn('text-xs mt-1', colors.subtitle)}>{subtitle}</p>}
        </div>
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', colors.iconBg)}>
          <Icon className={cn('w-5 h-5', colors.icon)} />
        </div>
      </div>
    </div>
  );
}

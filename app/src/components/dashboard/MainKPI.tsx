import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MainKPIProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export function MainKPI({ title, value, subtitle, trend, className }: MainKPIProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-6 text-white shadow-lg',
        'bg-gradient-to-br from-[#FF6B35] to-[#F7931E]',
        className
      )}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />

      <div className="relative">
        <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
        <p className="text-4xl lg:text-5xl font-bold tracking-tight mb-2">{value}</p>
        {subtitle && <p className="text-white/70 text-sm">{subtitle}</p>}
        {trend && (
          <div className="flex items-center gap-1.5 mt-3">
            <span
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                trend.isPositive ? 'bg-white/20 text-white' : 'bg-red-500/20 text-red-100'
              )}
            >
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </span>
            <span className="text-white/60 text-xs">vs mês anterior</span>
          </div>
        )}
      </div>
    </div>
  );
}

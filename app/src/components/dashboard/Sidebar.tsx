import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeItem?: string;
  onNavigate?: (item: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'candidates', label: 'Candidatos', icon: '👥' },
  { id: 'jobs', label: 'Vagas', icon: '💼' },
  { id: 'analytics', label: 'Analytics', icon: '📈' },
  { id: 'settings', label: 'Configurações', icon: '⚙️' },
];

export function Sidebar({ activeItem = 'dashboard', onNavigate }: SidebarProps) {
  return (
    <aside className="w-16 lg:w-60 h-screen bg-white border-r border-slate-200 flex flex-col shrink-0 transition-all duration-300">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF6B35] to-[#F7931E] flex items-center justify-center text-white font-bold text-sm">
          TD
        </div>
        <span className="hidden lg:block ml-3 font-bold text-slate-900">TalentDash</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 lg:px-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate?.(item.id)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
              activeItem === item.id
                ? 'bg-[#FFF7ED] text-[#F7931E]'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            )}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="hidden lg:block">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
            GM
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-slate-900">Gilmar</p>
            <p className="text-xs text-slate-500">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

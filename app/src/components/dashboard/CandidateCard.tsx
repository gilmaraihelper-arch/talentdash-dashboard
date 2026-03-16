import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { SkillBadge } from './SkillBadge';
import type { Candidate, CandidateStatus, Job } from '@/types';
import { STATUS_COLORS, STATUS_LABELS } from '@/types';

interface CandidateCardProps {
  candidate: Candidate;
  job: Job;
  onClick?: () => void;
}

const statusVariants: Record<CandidateStatus, { bg: string; text: string; border: string }> = {
  triagem: {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
  },
  entrevista: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  teste: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  offer: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
  },
  contratado: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  reprovado: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
  },
};

export function CandidateCard({ candidate, job, onClick }: CandidateCardProps) {
  const initials = candidate.nome
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const statusStyle = statusVariants[candidate.status];

  // Detectar skills do candidato baseado nos customFields
  const skills: Array<{ type: 'en' | 'es' | 'rh' | 'tech'; value?: string }> = [];

  Object.entries(candidate.customFields).forEach(([key, value]) => {
    const field = job.customFields.find((f) => f.id === key);
    if (field) {
      const name = field.name.toLowerCase();
      if (name.includes('inglês') || name.includes('ingles') || name.includes('english')) {
        if (value && value !== 'Básico') {
          skills.push({ type: 'en', value });
        }
      }
      if (name.includes('espanhol') || name.includes('español') || name.includes('spanish')) {
        if (value && value !== 'Básico') {
          skills.push({ type: 'es', value });
        }
      }
    }
  });

  // Calcular anos de experiência
  const experienceField = job.customFields.find((f) =>
    f.name.toLowerCase().includes('experiência') || f.name.toLowerCase().includes('experiencia')
  );
  const yearsExp = experienceField
    ? candidate.customFields[experienceField.id]
    : null;

  return (
    <div
      onClick={onClick}
      className={cn(
        'group bg-white rounded-xl border border-slate-200 p-4 cursor-pointer',
        'hover:shadow-lg hover:border-slate-300 transition-all duration-200'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
          {initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm truncate">{candidate.nome}</h3>
              <p className="text-xs text-slate-500">
                {candidate.cidade} {candidate.salarioAtual > 0 && `• ${candidate.salarioAtual.toLocaleString('pt-BR')}`}
              </p>
            </div>
            <Badge
              variant="secondary"
              className={cn(
                'text-[10px] px-2 py-0.5 font-medium shrink-0',
                statusStyle.bg,
                statusStyle.text,
                statusStyle.border
              )}
            >
              {STATUS_LABELS[candidate.status]}
            </Badge>
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {skills.map((skill, idx) => (
                <SkillBadge key={idx} type={skill.type} value={skill.value} />
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Pretensão:</span>
              <span className="text-sm font-semibold text-[#F7931E]">
                R$ {candidate.pretensaoSalarial.toLocaleString('pt-BR')}
              </span>
            </div>
            {yearsExp && (
              <span className="text-xs text-slate-500">
                {yearsExp} anos exp.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Users, 
  TrendingUp, 
  LayoutGrid,
  Table as TableIcon,
  Search,
  Eye,
  Trash2,
  Plus,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp as TrendingUpIcon,
  Share2,
  Check,
  Edit3,
  Filter,
  Palette,
  FileSpreadsheet,
  FileText,
  Download,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  STATUS_LABELS, 
  COLOR_THEMES,
  DASHBOARD_MODELS,
  type CandidateStatus,
  type ColorTheme 
} from '@/types';
import { DashboardEditor, getDefaultWidgets } from '@/components/ui/custom';
import type { DashboardWidget } from '@/components/ui/custom/DashboardEditor';
import { StatusBadge, FieldRenderer } from '@/components/ui/custom';
import { mockCandidates } from '@/data/mock';
import type { Store } from '@/hooks/useStore';
import { exportToExcel, exportToPDF, generateAdvancedExcelTemplate, generateGoogleSheetsLink } from '@/utils/export';

// Cores refinadas e mais sofisticadas
const THEME_COLORS: Record<ColorTheme, { 
  primary: string; 
  secondary: string; 
  accent: string; 
  light: string;
  chartColors: string[]; 
}> = {
  blue: { 
    primary: '#4F46E5', // Indigo 600
    secondary: '#6366F1', // Indigo 500
    accent: '#818CF8', // Indigo 400
    light: '#EEF2FF', // Indigo 50
    chartColors: ['#4F46E5', '#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE'],
  },
  green: { 
    primary: '#059669', // Emerald 600
    secondary: '#10B981', // Emerald 500
    accent: '#34D399', // Emerald 400
    light: '#ECFDF5', // Emerald 50
    chartColors: ['#059669', '#10B981', '#34D399', '#6EE7B7', '#A7F3D0'],
  },
  purple: { 
    primary: '#7C3AED', // Violet 600
    secondary: '#8B5CF6', // Violet 500
    accent: '#A78BFA', // Violet 400
    light: '#F5F3FF', // Violet 50
    chartColors: ['#7C3AED', '#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE'],
  },
  orange: { 
    primary: '#EA580C', // Orange 600
    secondary: '#F97316', // Orange 500
    accent: '#FB923C', // Orange 400
    light: '#FFF7ED', // Orange 50
    chartColors: ['#EA580C', '#F97316', '#FB923C', '#FDBA74', '#FED7AA'],
  },
  red: { 
    primary: '#DC2626', // Red 600
    secondary: '#EF4444', // Red 500
    accent: '#F87171', // Red 400
    light: '#FEF2F2', // Red 50
    chartColors: ['#DC2626', '#EF4444', '#F87171', '#FCA5A5', '#FECACA'],
  },
  teal: { 
    primary: '#0D9488', // Teal 600
    secondary: '#14B8A6', // Teal 500
    accent: '#2DD4BF', // Teal 400
    light: '#F0FDFA', // Teal 50
    chartColors: ['#0D9488', '#14B8A6', '#2DD4BF', '#5EEAD4', '#99F6E4'],
  },
};

interface DashboardPageProps {
  store: Store;
}

// Componente de KPI Card refinado
function KPICard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  trendUp, 
  icon: Icon, 
  color,
  onClick 
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string;
  trend?: string;
  trendUp?: boolean;
  icon: any;
  color: string;
  onClick?: () => void;
}) {
  return (
    <Card 
      className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer group ${onClick ? '' : ''}`}
      onClick={onClick}
    >
      <div className="absolute top-0 right-0 w-24 h-24 opacity-5 rounded-full -translate-y-1/2 translate-x-1/2" style={{ backgroundColor: color }} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
            {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
            {trend && (
              <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                <TrendingUpIcon className={`w-3 h-3 ${trendUp ? '' : 'rotate-180'}`} />
                {trend}
              </div>
            )}
          </div>
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
            style={{ backgroundColor: `${color}15` }}
          >
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente de Card de Candidato refinado
function CandidateCard({ 
  candidate, 
  job, 
  theme, 
  onView, 
  onDelete 
}: { 
  candidate: any; 
  job: any; 
  theme: any; 
  onView: () => void;
  onDelete: () => void;
}) {
  const initials = candidate.nome.split(' ').map((n: string) => n[0]).join('').slice(0, 2);
  
  return (
    <div 
      onClick={onView}
      className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-lg hover:border-slate-300 transition-all cursor-pointer group"
    >
      <div className="flex items-start gap-3">
        <Avatar className="w-12 h-12 ring-2 ring-white shadow-sm" style={{ backgroundColor: theme.primary }}>
          <AvatarFallback className="text-white font-semibold">{initials}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-slate-900 truncate">{candidate.nome}</h3>
              <p className="text-sm text-slate-500">{candidate.idade} anos • {candidate.cidade}</p>
            </div>
            <StatusBadge status={candidate.status} size="sm" />
          </div>
          
          <div className="mt-3 flex items-center gap-4">
            <div>
              <p className="text-xs text-slate-400">Pretensão</p>
              <p className="text-sm font-semibold" style={{ color: theme.primary }}>
                R$ {candidate.pretensaoSalarial.toLocaleString('pt-BR')}
              </p>
            </div>
            {candidate.salarioAtual && (
              <div>
                <p className="text-xs text-slate-400">Atual</p>
                <p className="text-sm text-slate-600">
                  R$ {candidate.salarioAtual.toLocaleString('pt-BR')}
                </p>
              </div>
            )}
          </div>
          
          {/* Campos personalizados visíveis */}
          {job.customFields.filter((f: any) => f.visibility.card).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {job.customFields
                .filter((f: any) => f.visibility.card)
                .slice(0, 3)
                .map((field: any) => (
                  <div 
                    key={field.id} 
                    className="px-2 py-1 rounded-md text-xs flex items-center gap-1"
                    style={{ backgroundColor: theme.light, color: theme.primary }}
                  >
                    <span className="font-medium">{field.name}:</span>
                    <FieldRenderer field={field} value={candidate.customFields[field.id]} size="sm" />
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Ações (visíveis no hover) */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs" onClick={(e) => { e.stopPropagation(); onView(); }}>
          <Eye className="w-3.5 h-3.5 mr-1" />
          Ver perfil
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function DashboardPage({ store }: DashboardPageProps) {
  const { navigateTo, state, selectCandidate, deleteCandidate, getJobCandidates } = store;
  const job = state.selectedJob;
  
  // Tema de cores
  const [colorTheme, setColorTheme] = useState<ColorTheme>(job?.colorTheme || 'blue');
  const theme = THEME_COLORS[colorTheme];
  
  // Estados
  const [isEditing, setIsEditing] = useState(false);
  const [widgets, setWidgets] = useState<DashboardWidget[]>(getDefaultWidgets());
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CandidateStatus | 'all'>('all');
  const [shareCopied, setShareCopied] = useState(false);
  
  // Estado do dialog de confirmação
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; candidateId: string | null }>({
    isOpen: false,
    candidateId: null,
  });

  // Candidatos
  const jobCandidates = useMemo(() => {
    if (!job) return [];
    const stateCandidates = getJobCandidates(job.id);
    if (stateCandidates.length > 0) return stateCandidates;
    return mockCandidates.filter(c => c.jobId === job.id || job.id === 'demo-job');
  }, [job, getJobCandidates, state.candidates]);

  if (!job) {
    navigateTo('landing');
    return null;
  }

  // Filtrar candidatos
  const filteredCandidates = useMemo(() => {
    return jobCandidates.filter(candidate => {
      const matchesSearch = candidate.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          candidate.cidade.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [jobCandidates, searchQuery, statusFilter]);

  // Estatísticas
  const stats = useMemo(() => {
    const total = jobCandidates.length;
    const byStatus = {
      triagem: jobCandidates.filter(c => c.status === 'triagem').length,
      entrevista: jobCandidates.filter(c => c.status === 'entrevista').length,
      teste: jobCandidates.filter(c => c.status === 'teste').length,
      offer: jobCandidates.filter(c => c.status === 'offer').length,
      contratado: jobCandidates.filter(c => c.status === 'contratado').length,
      reprovado: jobCandidates.filter(c => c.status === 'reprovado').length,
    };
    const avgSalary = total > 0 
      ? Math.round(jobCandidates.reduce((sum, c) => sum + c.pretensaoSalarial, 0) / total)
      : 0;
    const conversionRate = total > 0 ? Math.round((byStatus.contratado / total) * 100) : 0;
    
    return { total, byStatus, avgSalary, conversionRate };
  }, [jobCandidates]);

  // Dados para gráficos
  const funnelData = useMemo(() => {
    return [
      { name: 'Triagem', value: stats.byStatus.triagem, color: '#94A3B8' },
      { name: 'Entrevista', value: stats.byStatus.entrevista, color: theme.secondary },
      { name: 'Teste', value: stats.byStatus.teste, color: theme.accent },
      { name: 'Offer', value: stats.byStatus.offer, color: '#F59E0B' },
      { name: 'Contratado', value: stats.byStatus.contratado, color: '#10B981' },
    ].filter(d => d.value > 0);
  }, [stats, theme]);

  // Handlers
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}?job=${job?.id || 'demo'}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  const handleViewCandidate = (candidate: any) => {
    selectCandidate(candidate);
    navigateTo('candidate-detail');
  };

  const handleDeleteCandidate = (candidateId: string) => {
    setDeleteDialog({ isOpen: true, candidateId });
  };

  const confirmDeleteCandidate = () => {
    if (deleteDialog.candidateId) {
      deleteCandidate(deleteDialog.candidateId);
    }
    setDeleteDialog({ isOpen: false, candidateId: null });
  };

  // Renderizar widget
  const renderWidget = (widget: DashboardWidget) => {
    switch (widget.type) {
      case 'kpi-total':
        return (
          <div className="h-full flex flex-col justify-center p-4">
            <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-sm text-slate-500">Total de candidatos</div>
            <div className="mt-2 text-xs text-emerald-600 font-medium">+12% vs mês anterior</div>
          </div>
        );
      case 'kpi-entrevista':
        return (
          <div className="h-full flex flex-col justify-center p-4">
            <div className="text-3xl font-bold" style={{ color: theme.primary }}>{stats.byStatus.entrevista}</div>
            <div className="text-sm text-slate-500">Em entrevista</div>
            <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5">
              <div className="h-1.5 rounded-full transition-all" style={{ width: `${stats.total > 0 ? (stats.byStatus.entrevista / stats.total) * 100 : 0}%`, backgroundColor: theme.primary }} />
            </div>
          </div>
        );
      case 'kpi-contratados':
        return (
          <div className="h-full flex flex-col justify-center p-4">
            <div className="text-3xl font-bold text-emerald-600">{stats.byStatus.contratado}</div>
            <div className="text-sm text-slate-500">Contratados</div>
            <div className="mt-2 text-xs text-slate-400">Taxa de conversão: {stats.conversionRate}%</div>
          </div>
        );
      case 'kpi-media-salarial':
        return (
          <div className="h-full flex flex-col justify-center p-4">
            <div className="text-2xl font-bold" style={{ color: theme.secondary }}>
              R$ {(stats.avgSalary / 1000).toFixed(1)}k
            </div>
            <div className="text-sm text-slate-500">Média salarial</div>
            <div className="mt-2 text-xs text-slate-400">
              Total: R$ {jobCandidates.reduce((s, c) => s + c.pretensaoSalarial, 0).toLocaleString('pt-BR')}
            </div>
          </div>
        );
      case 'chart-funnel':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnelData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <RechartsTooltip 
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                cursor={{ fill: '#F1F5F9' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      case 'chart-pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={funnelData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={60}
                paddingAngle={3}
                dataKey="value"
              >
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'candidate-cards':
        return (
          <div className="p-4 grid grid-cols-1 gap-3 overflow-auto">
            {filteredCandidates.slice(0, 4).map((candidate) => (
              <div 
                key={candidate.id} 
                onClick={() => handleViewCandidate(candidate)}
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <Avatar className="w-8 h-8" style={{ backgroundColor: theme.primary }}>
                  <AvatarFallback className="text-white text-xs">
                    {candidate.nome.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{candidate.nome}</p>
                  <p className="text-xs text-slate-500">{candidate.cidade}</p>
                </div>
                <StatusBadge status={candidate.status} size="sm" />
              </div>
            ))}
          </div>
        );
      default:
        return <div className="p-4 text-slate-400 text-sm">Widget não configurado</div>;
    }
  };

  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col bg-slate-50">
        {/* Header refinado */}
        <header className="bg-white border-b border-slate-200 shrink-0">
          <div className="flex items-center justify-between h-14 px-4 lg:px-8">
            {/* Left */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigateTo('landing')} className="shrink-0">
                <ArrowLeft className="w-5 h-5 text-slate-500" />
              </Button>
              
              {job.companyLogo && (
                <img src={job.companyLogo} alt="" className="w-8 h-8 rounded-lg object-cover" />
              )}
              
              <div>
                <h1 className="font-semibold text-slate-900">{job.name}</h1>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                    {DASHBOARD_MODELS[job.dashboardModel || 'padrao'].name}
                  </Badge>
                  <span>•</span>
                  <span>{jobCandidates.length} candidatos</span>
                </div>
              </div>
            </div>
            
            {/* Center - Quick Actions */}
            <div className="hidden md:flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={isEditing ? "default" : "ghost"} 
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className={isEditing ? "" : "text-slate-600"}
                    style={isEditing ? { backgroundColor: theme.primary } : {}}
                  >
                    <Edit3 className="w-4 h-4 mr-1" />
                    {isEditing ? 'Editando' : 'Editar'}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Personalizar dashboard</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={handleShare} className="text-slate-600">
                    {shareCopied ? <Check className="w-4 h-4 mr-1 text-emerald-500" /> : <Share2 className="w-4 h-4 mr-1" />}
                    {shareCopied ? 'Copiado!' : 'Compartilhar'}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copiar link</TooltipContent>
              </Tooltip>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-slate-600">
                    <Palette className="w-4 h-4 mr-1" />
                    Tema
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {Object.entries(COLOR_THEMES).map(([key, config]) => (
                    <DropdownMenuItem key={key} onClick={() => setColorTheme(key as ColorTheme)}>
                      <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: config.primary }} />
                      {config.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Export Buttons */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-slate-600">
                    <Download className="w-4 h-4 mr-1" />
                    Exportar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuItem onClick={() => exportToExcel(job, filteredCandidates)}>
                    <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-600" />
                    Exportar para Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportToPDF(job, filteredCandidates, { includeSummary: true })}>
                    <FileText className="w-4 h-4 mr-2 text-rose-600" />
                    Exportar para PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportToPDF(job, filteredCandidates, { includeSummary: true, anonymous: true })}>
                    <FileText className="w-4 h-4 mr-2 text-amber-600" />
                    PDF Anônimo (sem nomes)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportToPDF(job, filteredCandidates, { includeSummary: true, processOnly: true })}>
                    <FileText className="w-4 h-4 mr-2 text-blue-600" />
                    Apenas Dados do Processo
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => generateAdvancedExcelTemplate(job)}>
                    <FileSpreadsheet className="w-4 h-4 mr-2 text-blue-600" />
                    Baixar Template Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.open(generateGoogleSheetsLink(job), '_blank')}>
                    <ExternalLink className="w-4 h-4 mr-2 text-green-600" />
                    Abrir no Google Sheets
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {/* Right */}
            <div className="flex items-center gap-2">
              <div className="relative hidden sm:block">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-48 h-8 text-sm bg-slate-100 border-0 focus:bg-white"
                />
              </div>
              
              <Button 
                size="sm" 
                onClick={() => navigateTo('add-candidates')} 
                className="shrink-0 text-white"
                style={{ backgroundColor: theme.primary }}
              >
                <Plus className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Adicionar</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {isEditing ? (
            <DashboardEditor
              widgets={widgets}
              onWidgetsChange={setWidgets}
              isEditing={isEditing}
              onSave={() => setIsEditing(false)}
              renderWidget={renderWidget}
            />
          ) : (
            <div className="h-full overflow-auto px-4 lg:px-8 py-4">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <KPICard
                  title="Total de Candidatos"
                  value={stats.total}
                  trend="+12%"
                  trendUp={true}
                  icon={Users}
                  color={theme.primary}
                />
                <KPICard
                  title="Em Entrevista"
                  value={stats.byStatus.entrevista}
                  subtitle={`${stats.total > 0 ? Math.round((stats.byStatus.entrevista / stats.total) * 100) : 0}% do total`}
                  icon={TrendingUp}
                  color={theme.secondary}
                />
                <KPICard
                  title="Contratados"
                  value={stats.byStatus.contratado}
                  subtitle={`Taxa: ${stats.conversionRate}%`}
                  icon={Check}
                  color="#10B981"
                />
                <KPICard
                  title="Média Salarial"
                  value={`R$ ${(stats.avgSalary / 1000).toFixed(1)}k`}
                  subtitle="Pretensão média"
                  icon={TrendingUpIcon}
                  color={theme.accent}
                />
              </div>

              {/* Charts Row */}
              <div className="grid lg:grid-cols-3 gap-4 mb-6">
                <Card className="lg:col-span-2 border-0 shadow-sm">
                  <CardHeader className="py-3 px-4">
                    <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-700">
                      <BarChart3 className="w-4 h-4" style={{ color: theme.primary }} />
                      Distribuição por Etapa
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={funnelData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94A3B8" axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11 }} stroke="#94A3B8" axisLine={false} tickLine={false} />
                        <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {funnelData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader className="py-3 px-4">
                    <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-700">
                      <PieChartIcon className="w-4 h-4" style={{ color: theme.primary }} />
                      Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={funnelData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {funnelData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Candidates Section */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-700">
                    <Users className="w-4 h-4" style={{ color: theme.primary }} />
                    Candidatos ({filteredCandidates.length})
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="flex border rounded-lg overflow-hidden">
                      <button
                        onClick={() => setViewMode('cards')}
                        className={`p-2 transition-colors ${viewMode === 'cards' ? 'bg-slate-100 text-slate-900' : 'bg-white text-slate-400 hover:text-slate-600'}`}
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('table')}
                        className={`p-2 transition-colors ${viewMode === 'table' ? 'bg-slate-100 text-slate-900' : 'bg-white text-slate-400 hover:text-slate-600'}`}
                      >
                        <TableIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8">
                          <Filter className="w-4 h-4 mr-1" />
                          Filtros
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                          Todos os status
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {Object.entries(STATUS_LABELS).map(([key, label]) => (
                          <DropdownMenuItem key={key} onClick={() => setStatusFilter(key as CandidateStatus)}>
                            {label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  {filteredCandidates.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-slate-500">Nenhum candidato encontrado</p>
                      <Button variant="outline" className="mt-4" onClick={() => navigateTo('add-candidates')}>
                        <Plus className="w-4 h-4 mr-1" />
                        Adicionar Candidato
                      </Button>
                    </div>
                  ) : viewMode === 'cards' ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                      {filteredCandidates.map((candidate) => (
                        <CandidateCard
                          key={candidate.id}
                          candidate={candidate}
                          job={job}
                          theme={theme}
                          onView={() => handleViewCandidate(candidate)}
                          onDelete={() => handleDeleteCandidate(candidate.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="text-left py-3 px-4 font-medium text-sm text-slate-600">Candidato</th>
                            <th className="text-left py-3 px-4 font-medium text-sm text-slate-600">Idade</th>
                            <th className="text-left py-3 px-4 font-medium text-sm text-slate-600">Cidade</th>
                            <th className="text-left py-3 px-4 font-medium text-sm text-slate-600">Status</th>
                            <th className="text-left py-3 px-4 font-medium text-sm text-slate-600">Pretensão</th>
                            {job.customFields.filter((f: any) => f.visibility.table).slice(0, 3).map((field: any) => (
                              <th key={field.id} className="text-left py-3 px-4 font-medium text-sm text-slate-600">{field.name}</th>
                            ))}
                            <th className="text-left py-3 px-4 font-medium text-sm text-slate-600">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCandidates.map((candidate) => (
                            <tr 
                              key={candidate.id} 
                              className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                              onClick={() => handleViewCandidate(candidate)}
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <Avatar className="w-8 h-8" style={{ backgroundColor: theme.primary }}>
                                    <AvatarFallback className="text-white text-xs">{candidate.nome.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium">{candidate.nome}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">{candidate.idade}</td>
                              <td className="py-3 px-4">{candidate.cidade}</td>
                              <td className="py-3 px-4"><StatusBadge status={candidate.status} size="sm" /></td>
                              <td className="py-3 px-4 font-medium" style={{ color: theme.primary }}>
                                R$ {candidate.pretensaoSalarial.toLocaleString('pt-BR')}
                              </td>
                              {job.customFields.filter((f: any) => f.visibility.table).slice(0, 3).map((field: any) => (
                                <td key={field.id} className="py-3 px-4">
                                  <FieldRenderer field={field} value={candidate.customFields[field.id]} size="sm" />
                                </td>
                              ))}
                              <td className="py-3 px-4">
                                <div className="flex gap-2">
                                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleViewCandidate(candidate); }}>
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDeleteCandidate(candidate.id); }} className="text-rose-500">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
      
      {/* Dialog de confirmação de exclusão */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, candidateId: null })}
        onConfirm={confirmDeleteCandidate}
        title="Excluir candidato"
        description="Tem certeza que deseja excluir este candidato? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
      />
    </TooltipProvider>
  );
}

import { useState, useMemo, useCallback } from 'react';
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
  Check,
  Edit3,
  Filter,
  Palette,
  FileSpreadsheet,
  FileText,
  Download,
  ExternalLink,
  Wallet,
  Briefcase,
  Calendar,
  Globe,
  MapPin,
  Building2,
  MoreHorizontal,
  ChevronDown,
  Menu,
  X,
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
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import {
  STATUS_LABELS,
  COLOR_THEMES,
  DASHBOARD_MODELS,
  type CandidateStatus,
  type ColorTheme,
  STATUS_COLORS,
} from '@/types';
import { DashboardEditor, getDefaultWidgets } from '@/components/ui/custom';
import type { DashboardWidget } from '@/components/ui/custom/DashboardEditor';
import { StatusBadge, FieldRenderer } from '@/components/ui/custom';
import { mockCandidates } from '@/data/mock';
import type { Store } from '@/hooks/useStore';
import {
  exportToExcel,
  exportToPDF,
  generateAdvancedExcelTemplate,
  generateGoogleSheetsLink,
} from '@/utils/export';

// Importar componentes do dashboard
import {
  Sidebar,
  MainKPI,
  SecondaryKPI,
  StatsCard,
  CandidateCard,
  HorizontalBarChart,
  DonutChart,
  VerticalBarChart,
  CompanyRankingTable,
} from '@/components/dashboard';

interface DashboardPageProps {
  store: Store;
}

export function DashboardPage({ store }: DashboardPageProps) {
  const { navigateTo, state, selectCandidate, deleteCandidate, getJobCandidates } = store;
  const job = state.selectedJob;

  // Tema de cores
  const [colorTheme, setColorTheme] = useState<ColorTheme>(job?.colorTheme || 'orange');
  const [themeSelectorOpen, setThemeSelectorOpen] = useState(false);

  // Estados
  const [isEditing, setIsEditing] = useState(false);
  const [widgets, setWidgets] = useState<DashboardWidget[]>(getDefaultWidgets());
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CandidateStatus | 'all'>('all');
  const [shareCopied, setShareCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Estado do dialog de confirmação
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    candidateId: string | null;
  }>({
    isOpen: false,
    candidateId: null,
  });

  // Estado de loading para exportações
  const [exportLoading, setExportLoading] = useState<{
    excel: boolean;
    pdf: boolean;
    pdfAnonymous: boolean;
    pdfProcessOnly: boolean;
    template: boolean;
  }>({
    excel: false,
    pdf: false,
    pdfAnonymous: false,
    pdfProcessOnly: false,
    template: false,
  });

  // Candidatos
  const jobCandidates = useMemo(() => {
    if (!job) return [];
    const stateCandidates = getJobCandidates(job.id);
    if (stateCandidates.length > 0) return stateCandidates;
    return mockCandidates.filter((c) => c.jobId === job.id || job.id === 'demo-job');
  }, [job, getJobCandidates, state.candidates]);

  if (!job) {
    navigateTo('landing');
    return null;
  }

  // Filtrar candidatos
  const filteredCandidates = useMemo(() => {
    return jobCandidates.filter((candidate) => {
      const matchesSearch =
        candidate.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.cidade.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || candidate.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [jobCandidates, searchQuery, statusFilter]);

  // Estatísticas calculadas
  const stats = useMemo(() => {
    const total = jobCandidates.length;
    const byStatus = {
      triagem: jobCandidates.filter((c) => c.status === 'triagem').length,
      entrevista: jobCandidates.filter((c) => c.status === 'entrevista').length,
      teste: jobCandidates.filter((c) => c.status === 'teste').length,
      offer: jobCandidates.filter((c) => c.status === 'offer').length,
      contratado: jobCandidates.filter((c) => c.status === 'contratado').length,
      reprovado: jobCandidates.filter((c) => c.status === 'reprovado').length,
    };
    const avgSalary =
      total > 0
        ? Math.round(
            jobCandidates.reduce((sum, c) => sum + c.pretensaoSalarial, 0) / total
          )
        : 0;
    const avgAge =
      total > 0
        ? Math.round(
            jobCandidates.reduce((sum, c) => sum + c.idade, 0) / total
          )
        : 0;
    const avgExp =
      total > 0
        ? Math.round(
            jobCandidates.reduce((sum, c) => {
              const expField = job?.customFields.find((f) =>
                f.name.toLowerCase().includes('experiência') ||
                f.name.toLowerCase().includes('experiencia')
              );
              const exp = expField
                ? Number(c.customFields[expField.id]) || 0
                : 0;
              return sum + exp;
            }, 0) / total
          )
        : 0;
    const conversionRate =
      total > 0 ? Math.round((byStatus.contratado / total) * 100) : 0;

    // Contar candidatos com inglês
    const withEnglish = jobCandidates.filter((c) => {
      const field = job?.customFields.find((f) =>
        f.name.toLowerCase().includes('inglês') ||
        f.name.toLowerCase().includes('ingles')
      );
      if (field) {
        const value = c.customFields[field.id];
        return value && (value === 'Avançado' || value === 'Fluente');
      }
      return false;
    }).length;
    const englishPercentage = total > 0 ? Math.round((withEnglish / total) * 100) : 0;

    // Cidades únicas
    const uniqueCities = new Set(jobCandidates.map((c) => c.cidade)).size;

    return {
      total,
      byStatus,
      avgSalary,
      avgAge,
      avgExp,
      conversionRate,
      englishPercentage,
      uniqueCities,
    };
  }, [jobCandidates, job?.customFields]);

  // Dados para gráficos
  const cityData = useMemo(() => {
    const cityCounts: Record<string, number> = {};
    jobCandidates.forEach((c) => {
      const city = c.cidade.split(',')[0];
      cityCounts[city] = (cityCounts[city] || 0) + 1;
    });
    return Object.entries(cityCounts)
      .map(([name, value]) => ({ name, value, color: '#F7931E' }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [jobCandidates]);

  const phaseData = useMemo(() => {
    return [
      { name: 'Triagem', value: stats.byStatus.triagem, color: '#94A3B8' },
      { name: 'Entrevista', value: stats.byStatus.entrevista, color: '#3B82F6' },
      { name: 'Teste', value: stats.byStatus.teste, color: '#F59E0B' },
      { name: 'Offer', value: stats.byStatus.offer, color: '#8B5CF6' },
      { name: 'Contratado', value: stats.byStatus.contratado, color: '#10B981' },
    ].filter((d) => d.value > 0);
  }, [stats.byStatus]);

  const salaryDistribution = useMemo(() => {
    const ranges = [
      { min: 0, max: 5000, label: 'Até 5k' },
      { min: 5000, max: 8000, label: '5k-8k' },
      { min: 8000, max: 12000, label: '8k-12k' },
      { min: 12000, max: 20000, label: '12k-20k' },
      { min: 20000, max: Infinity, label: '20k+' },
    ];

    return ranges.map((range) => ({
      name: range.label,
      value: jobCandidates.filter(
        (c) =>
          c.pretensaoSalarial >= range.min && c.pretensaoSalarial < range.max
      ).length,
      color: '#F7931E',
    }));
  }, [jobCandidates]);

  // Dados mockados para ranking de empresas
  const companyRankingData = useMemo(
    () => [
      {
        id: '1',
        name: 'TechCorp',
        logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop',
        candidates: 12,
        avgSalary: 8500,
        avgAge: 29,
        englishPercentage: 75,
      },
      {
        id: '2',
        name: 'InnovaSoft',
        logo: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=100&h=100&fit=crop',
        candidates: 8,
        avgSalary: 7200,
        avgAge: 27,
        englishPercentage: 50,
      },
      {
        id: '3',
        name: 'GlobalTech',
        candidates: 6,
        avgSalary: 9500,
        avgAge: 32,
        englishPercentage: 83,
      },
      {
        id: '4',
        name: 'StartUp BR',
        candidates: 5,
        avgSalary: 6500,
        avgAge: 26,
        englishPercentage: 40,
      },
    ],
    []
  );

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

  // Handlers de exportação
  const handleExportExcel = useCallback(async () => {
    setExportLoading((prev) => ({ ...prev, excel: true }));
    try {
      await exportToExcel(job, filteredCandidates);
    } finally {
      setExportLoading((prev) => ({ ...prev, excel: false }));
    }
  }, [job, filteredCandidates]);

  const handleExportPDF = useCallback(async () => {
    setExportLoading((prev) => ({ ...prev, pdf: true }));
    try {
      await exportToPDF(job, filteredCandidates, { includeSummary: true });
    } finally {
      setExportLoading((prev) => ({ ...prev, pdf: false }));
    }
  }, [job, filteredCandidates]);

  const handleExportPDFAnonymous = useCallback(async () => {
    setExportLoading((prev) => ({ ...prev, pdfAnonymous: true }));
    try {
      await exportToPDF(job, filteredCandidates, {
        includeSummary: true,
        anonymous: true,
      });
    } finally {
      setExportLoading((prev) => ({ ...prev, pdfAnonymous: false }));
    }
  }, [job, filteredCandidates]);

  const handleExportPDFProcessOnly = useCallback(async () => {
    setExportLoading((prev) => ({ ...prev, pdfProcessOnly: true }));
    try {
      await exportToPDF(job, filteredCandidates, {
        includeSummary: true,
        processOnly: true,
      });
    } finally {
      setExportLoading((prev) => ({ ...prev, pdfProcessOnly: false }));
    }
  }, [job, filteredCandidates]);

  const handleGenerateTemplate = useCallback(async () => {
    setExportLoading((prev) => ({ ...prev, template: true }));
    try {
      await generateAdvancedExcelTemplate(job);
    } finally {
      setExportLoading((prev) => ({ ...prev, template: false }));
    }
  }, [job]);

  const theme = COLOR_THEMES[colorTheme];

  // Função de navegação da sidebar
  const handleSidebarNavigate = useCallback((item: string) => {
    switch (item) {
      case 'dashboard':
        // Já está no dashboard
        break;
      case 'candidates':
        // Scroll para a seção de candidatos
        const candidatesSection = document.getElementById('candidates-section');
        if (candidatesSection) {
          candidatesSection.scrollIntoView({ behavior: 'smooth' });
        }
        break;
      case 'jobs':
        navigateTo('landing');
        break;
      case 'analytics':
        // Scroll para a seção de gráficos
        const chartsSection = document.getElementById('charts-section');
        if (chartsSection) {
          chartsSection.scrollIntoView({ behavior: 'smooth' });
        }
        break;
      case 'settings':
        // Abrir configurações do tema
        setThemeSelectorOpen(true);
        break;
      default:
        break;
    }
    setMobileMenuOpen(false);
  }, [navigateTo]);

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-[#F8F9FA]">
        {/* Sidebar Desktop */}
        <div className="hidden lg:block">
          <Sidebar activeItem="dashboard" onNavigate={handleSidebarNavigate} />
        </div>

        {/* Mobile Menu */}
        <Drawer
          open={mobileMenuOpen}
          onOpenChange={setMobileMenuOpen}
          direction="left"
        >
          <DrawerContent className="p-0 w-64" data-vaul-drawer-direction="left">
            <Sidebar activeItem="dashboard" onNavigate={handleSidebarNavigate} />
          </DrawerContent>
        </Drawer>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white border-b border-slate-200 shrink-0">
            <div className="flex items-center justify-between h-16 px-4 lg:px-6">
              {/* Left - Breadcrumbs & Mobile Menu */}
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setMobileMenuOpen(true)}
                >
                  <Menu className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateTo('landing')}
                  className="hidden sm:flex"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-500" />
                </Button>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500">Vagas</span>
                  <span className="text-slate-300">/</span>
                  <span className="font-medium text-slate-900 truncate max-w-[150px] sm:max-w-[200px]">
                    {job.name}
                  </span>
                </div>
              </div>

              {/* Center - Search */}
              <div className="hidden md:flex flex-1 max-w-md mx-4">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Buscar candidatos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full h-10 bg-slate-50 border-slate-200 focus:bg-white"
                  />
                </div>
              </div>

              {/* Right - Actions */}
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="hidden sm:flex">
                      <Filter className="w-4 h-4 mr-1.5" />
                      Filtros
                      <ChevronDown className="w-3 h-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                      Todos os status
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {Object.entries(STATUS_LABELS).map(([key, label]) => (
                      <DropdownMenuItem
                        key={key}
                        onClick={() => setStatusFilter(key as CandidateStatus)}
                      >
                        <div
                          className="w-2 h-2 rounded-full mr-2"
                          style={{ backgroundColor: STATUS_COLORS[key as CandidateStatus] }}
                        />
                        {label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="hidden sm:flex">
                      <Palette className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {Object.entries(COLOR_THEMES).map(([key, config]) => (
                      <DropdownMenuItem
                        key={key}
                        onClick={() => setColorTheme(key as ColorTheme)}
                      >
                        <div
                          className="w-4 h-4 rounded-full mr-2"
                          style={{ backgroundColor: config.primary }}
                        />
                        {config.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Download className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem
                      onClick={handleExportExcel}
                      disabled={exportLoading.excel}
                    >
                      <FileSpreadsheet
                        className={`w-4 h-4 mr-2 text-emerald-600 ${
                          exportLoading.excel ? 'animate-pulse' : ''
                        }`}
                      />
                      {exportLoading.excel ? 'Gerando...' : 'Exportar Excel'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleExportPDF}
                      disabled={exportLoading.pdf}
                    >
                      <FileText
                        className={`w-4 h-4 mr-2 text-rose-600 ${
                          exportLoading.pdf ? 'animate-pulse' : ''
                        }`}
                      />
                      {exportLoading.pdf ? 'Gerando...' : 'Exportar PDF'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleGenerateTemplate}
                      disabled={exportLoading.template}
                    >
                      <FileSpreadsheet
                        className={`w-4 h-4 mr-2 text-blue-600 ${
                          exportLoading.template ? 'animate-pulse' : ''
                        }`}
                      />
                      Template Excel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  size="sm"
                  onClick={() => navigateTo('add-candidates')}
                  className="bg-gradient-to-r from-[#FF6B35] to-[#F7931E] hover:opacity-90 text-white"
                >
                  <Plus className="w-4 h-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">Adicionar</span>
                </Button>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <div className="flex-1 overflow-auto p-4 lg:p-6">
            {isEditing ? (
              <DashboardEditor
                widgets={widgets}
                onWidgetsChange={setWidgets}
                isEditing={isEditing}
                onSave={() => setIsEditing(false)}
                renderWidget={() => null}
              />
            ) : (
              <div className="space-y-6">
                {/* KPI Principal + Secundários */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* Main KPI */}
                  <div className="lg:col-span-4">
                    <MainKPI
                      title="Total de Candidatos"
                      value={stats.total}
                      subtitle="Processo seletivo ativo"
                      trend={{ value: '12%', isPositive: true }}
                    />
                  </div>

                  {/* Secondary KPIs */}
                  <div className="lg:col-span-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <SecondaryKPI
                      title="Salário Médio"
                      value={`R$ ${(stats.avgSalary / 1000).toFixed(1)}k`}
                      subtitle="Pretensão"
                      icon={Wallet}
                      color="blue"
                    />
                    <SecondaryKPI
                      title="Pretensão Média"
                      value={`R$ ${(stats.avgSalary / 1000).toFixed(1)}k`}
                      subtitle="Base total"
                      icon={TrendingUp}
                      color="green"
                    />
                    <SecondaryKPI
                      title="Idade Média"
                      value={`${stats.avgAge} anos`}
                      subtitle="Perfil"
                      icon={Calendar}
                      color="yellow"
                    />
                    <SecondaryKPI
                      title="Experiência Média"
                      value={`${stats.avgExp} anos`}
                      subtitle="Média"
                      icon={Briefcase}
                      color="purple"
                    />
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatsCard
                    label="Inglês Avançado"
                    value={`${stats.englishPercentage}%`}
                    icon={Globe}
                    color="blue"
                  />
                  <StatsCard
                    label="Espanhol"
                    value="23%"
                    icon={Globe}
                    color="yellow"
                  />
                  <StatsCard
                    label="Analytics"
                    value="45%"
                    icon={TrendingUp}
                    color="green"
                  />
                  <StatsCard
                    label="Cidades"
                    value={stats.uniqueCities}
                    icon={MapPin}
                    color="orange"
                  />
                </div>

                {/* Charts Row */}
                <div id="charts-section" className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <HorizontalBarChart
                    title="Por Cidade"
                    data={cityData}
                    className="lg:col-span-1"
                  />
                  <DonutChart
                    title="Por Fase"
                    data={phaseData}
                    centerValue={stats.total}
                    centerLabel="Total"
                  />
                  <VerticalBarChart
                    title="Distribuição Salarial"
                    data={salaryDistribution}
                  />
                </div>

                {/* Ranking + Lista de Candidatos */}
                <div id="candidates-section" className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Lista de Candidatos */}
                  <div className="lg:col-span-2">
                    <Card className="border-0 shadow-sm">
                      <CardHeader className="py-4 px-4 flex flex-row items-center justify-between border-b border-slate-100">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                          <Users className="w-4 h-4 text-[#F7931E]" />
                          Candidatos ({filteredCandidates.length})
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <div className="flex border rounded-lg overflow-hidden">
                            <button
                              onClick={() => setViewMode('cards')}
                              className={cn(
                                'p-2 transition-colors',
                                viewMode === 'cards'
                                  ? 'bg-slate-100 text-slate-900'
                                  : 'bg-white text-slate-400 hover:text-slate-600'
                              )}
                            >
                              <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setViewMode('table')}
                              className={cn(
                                'p-2 transition-colors',
                                viewMode === 'table'
                                  ? 'bg-slate-100 text-slate-900'
                                  : 'bg-white text-slate-400 hover:text-slate-600'
                              )}
                            >
                              <TableIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        {filteredCandidates.length === 0 ? (
                          <div className="text-center py-12">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Users className="w-8 h-8 text-slate-400" />
                            </div>
                            <p className="text-slate-500">Nenhum candidato encontrado</p>
                            <Button
                              variant="outline"
                              className="mt-4"
                              onClick={() => navigateTo('add-candidates')}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Adicionar Candidato
                            </Button>
                          </div>
                        ) : viewMode === 'cards' ? (
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredCandidates.map((candidate) => (
                              <CandidateCard
                                key={candidate.id}
                                candidate={candidate}
                                job={job}
                                onClick={() => handleViewCandidate(candidate)}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b border-slate-200">
                                  <th className="text-left py-3 px-4 font-medium text-sm text-slate-600">
                                    Candidato
                                  </th>
                                  <th className="text-left py-3 px-4 font-medium text-sm text-slate-600">
                                    Idade
                                  </th>
                                  <th className="text-left py-3 px-4 font-medium text-sm text-slate-600">
                                    Cidade
                                  </th>
                                  <th className="text-left py-3 px-4 font-medium text-sm text-slate-600">
                                    Status
                                  </th>
                                  <th className="text-left py-3 px-4 font-medium text-sm text-slate-600">
                                    Pretensão
                                  </th>
                                  <th className="text-left py-3 px-4 font-medium text-sm text-slate-600">
                                    Ações
                                  </th>
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
                                        <Avatar className="w-8 h-8">
                                          <AvatarFallback className="bg-slate-400 text-white text-xs">
                                            {candidate.nome.charAt(0)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium text-sm">{candidate.nome}</span>
                                      </div>
                                    </td>
                                    <td className="py-3 px-4">{candidate.idade}</td>
                                    <td className="py-3 px-4">{candidate.cidade}</td>
                                    <td className="py-3 px-4">
                                      <Badge
                                        variant="secondary"
                                        className="text-[10px]"
                                        style={{
                                          backgroundColor: `${STATUS_COLORS[candidate.status]}20`,
                                          color: STATUS_COLORS[candidate.status],
                                          borderColor: STATUS_COLORS[candidate.status],
                                        }}
                                      >
                                        {STATUS_LABELS[candidate.status]}
                                      </Badge>
                                    </td>
                                    <td className="py-3 px-4">
                                      <span className="font-medium text-[#F7931E]">
                                        R${' '}
                                        {candidate.pretensaoSalarial.toLocaleString('pt-BR')}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4">
                                      <div className="flex gap-1">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleViewCandidate(candidate);
                                          }}
                                        >
                                          <Eye className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-rose-500"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteCandidate(candidate.id);
                                          }}
                                        >
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

                  {/* Ranking de Empresas */}
                  <div className="lg:col-span-1">
                    <CompanyRankingTable data={companyRankingData} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dialog de confirmação */}
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
      </div>
    </TooltipProvider>
  );
}

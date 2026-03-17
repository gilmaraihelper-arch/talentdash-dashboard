import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Check, 
  Users, 
  BarChart3, 
  FileSpreadsheet, 
  Zap, 
  ArrowRight,
  Briefcase,
  Star,
  LayoutDashboard,
  Play,
  Sparkles,
  Target,
  TrendingUp,
  CheckCircle2,
  Clock,
  Award,
  PieChart,
  Eye,
  Palette,
  Menu,
  X,
  Rocket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PLANS, COLOR_THEMES } from '@/types';
import { Stepper } from '@/components/ui/custom';
import type { Store } from '@/hooks/useStore';

interface LandingPageProps {
  store: Store;
}

const howItWorksSteps = [
  { id: 'step1', title: 'Crie em 1 minuto', description: 'Escolha um template pronto ou comece do zero. Nossa IA sugere os melhores critérios.', icon: Rocket, color: 'from-blue-500 to-blue-600' },
  { id: 'step2', title: 'Importe seus dados', description: 'Arraste sua planilha ou conecte com LinkedIn. Tudo organizado automaticamente.', icon: FileSpreadsheet, color: 'from-purple-500 to-purple-600' },
  { id: 'step3', title: 'Visualize insights', description: 'Dashboards automáticos mostram exatamente onde cada candidato está no processo.', icon: Eye, color: 'from-amber-500 to-amber-600' },
  { id: 'step4', title: 'Contrate melhor', description: 'Compare lado a lado, colabore com sua equipe e tome decisões baseadas em dados.', icon: CheckCircle2, color: 'from-green-500 to-green-600' },
];

const demoSteps = [
  { id: 'template', title: 'Template', description: 'Escolha o tipo' },
  { id: 'personalize', title: 'Personalize', description: 'Ajuste critérios' },
  { id: 'importe', title: 'Importe', description: 'Carregue dados' },
  { id: 'dashboard', title: 'Dashboard', description: 'Visualize tudo' },
];

const features = [
  { icon: LayoutDashboard, title: 'Dashboards Editáveis', description: 'Arraste, redimensione e personalize cada widget. Controle total do visual.', color: 'from-blue-500 to-indigo-600' },
  { icon: PieChart, title: 'Análise Visual Completa', description: 'Gráficos automáticos de funil, distribuição, tendências e métricas customizadas.', color: 'from-purple-500 to-pink-600' },
  { icon: Eye, title: 'Visão 360° do Candidato', description: 'Perfil completo com avaliações, histórico e todas as informações em um lugar.', color: 'from-amber-500 to-orange-600' },
  { icon: Target, title: 'Comparação Inteligente', description: 'Compare candidatos lado a lado usando os critérios que você definiu.', color: 'from-emerald-500 to-teal-600' },
  { icon: FileSpreadsheet, title: 'Importação em Segundos', description: 'Arraste sua planilha CSV/Excel e veja tudo automaticamente organizado.', color: 'from-rose-500 to-red-600' },
  { icon: Palette, title: 'Temas Personalizáveis', description: '6 paletas de cores profissionais. Escolha o visual que combina com sua marca.', color: 'from-cyan-500 to-blue-600' },
];

const planList = [
  { key: 'free', plan: PLANS.free, recommended: false },
  { key: 'pro', plan: PLANS.pro, recommended: true },
  { key: 'advanced', plan: PLANS.advanced, recommended: false },
  { key: 'enterprise', plan: PLANS.enterprise, recommended: false },
];

const stats = [
  { value: '10K+', label: 'Candidatos mapeados', icon: Users },
  { value: '500+', label: 'Empresas usando', icon: Briefcase },
  { value: '98%', label: 'Taxa de satisfação', icon: Award },
  { value: '5min', label: 'Setup inicial', icon: Clock },
];

const dashboardModels = [
  { id: 'padrao', name: 'Padrão', description: 'Dashboard equilibrado com visão geral completa', theme: 'blue' as const },
  { id: 'analitico', name: 'Analítico', description: 'Métricas detalhadas e múltiplos gráficos', theme: 'purple' as const },
  { id: 'comparativo', name: 'Comparativo', description: 'Compare candidatos lado a lado', theme: 'green' as const },
  { id: 'minimalista', name: 'Minimalista', description: 'Visual limpo e direto ao ponto', theme: 'teal' as const },
  { id: 'executivo', name: 'Executivo', description: 'Focado em KPIs e métricas de alto nível', theme: 'orange' as const },
  { id: 'operacional', name: 'Operacional', description: 'Acompanhamento diário do funil', theme: 'red' as const },
  { id: 'equipe', name: 'Em Equipe', description: 'Colaborativo com atribuições', theme: 'blue' as const },
  { id: 'avancado', name: 'Avançado', description: 'Analytics completo com predições', theme: 'purple' as const },
];

// Candidatos demo super completos - 20 candidatos com dados ricos
const demoCandidates = [
  {
    id: 'demo-1',
    jobId: 'demo',
    nome: 'Ana Carolina Silva',
    idade: 28,
    cidade: 'São Paulo, SP',
    curriculo: 'https://linkedin.com/in/ana-silva',
    pretensaoSalarial: 8500,
    salarioAtual: 6500,
    status: 'entrevista' as const,
    observacoes: 'Excelente conhecimento em React e TypeScript. Comunicação clara.',
    customFields: { 'cf1': 4, 'cf2': 5, 'cf3': 'Avançado', 'cf4': true, 'cf5': 'React', 'cf6': 4 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'demo-2',
    jobId: 'demo',
    nome: 'Bruno Mendes Costa',
    idade: 32,
    cidade: 'Rio de Janeiro, RJ',
    curriculo: 'https://linkedin.com/in/bruno-costa',
    pretensaoSalarial: 12000,
    salarioAtual: 10000,
    status: 'teste' as const,
    observacoes: 'Sênior com experiência em grandes projetos. Liderou equipe de 5 devs.',
    customFields: { 'cf1': 8, 'cf2': 5, 'cf3': 'Fluente', 'cf4': true, 'cf5': 'Node.js', 'cf6': 5 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'demo-3',
    jobId: 'demo',
    nome: 'Carla Oliveira Santos',
    idade: 25,
    cidade: 'Belo Horizonte, MG',
    curriculo: 'https://linkedin.com/in/carla-santos',
    pretensaoSalarial: 6000,
    salarioAtual: 4500,
    status: 'triagem' as const,
    observacoes: 'Plena em transição de carreira. Perfil promissor.',
    customFields: { 'cf1': 3, 'cf2': 4, 'cf3': 'Intermediário', 'cf4': false, 'cf5': 'Vue.js', 'cf6': 3 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'demo-4',
    jobId: 'demo',
    nome: 'Daniel Pereira Lima',
    idade: 30,
    cidade: 'Curitiba, PR',
    curriculo: 'https://linkedin.com/in/daniel-lima',
    pretensaoSalarial: 9500,
    salarioAtual: 8000,
    status: 'offer' as const,
    observacoes: 'Excelente fit cultural. Aguardando resposta da proposta.',
    customFields: { 'cf1': 6, 'cf2': 4, 'cf3': 'Avançado', 'cf4': true, 'cf5': 'Python', 'cf6': 4 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'demo-5',
    jobId: 'demo',
    nome: 'Elena Rodrigues',
    idade: 27,
    cidade: 'Porto Alegre, RS',
    curriculo: 'https://linkedin.com/in/elena-rodrigues',
    pretensaoSalarial: 7500,
    salarioAtual: 6000,
    status: 'contratado' as const,
    observacoes: 'Contratada! Início previsto para próxima semana.',
    customFields: { 'cf1': 5, 'cf2': 5, 'cf3': 'Intermediário', 'cf4': true, 'cf5': 'Angular', 'cf6': 4 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'demo-6',
    jobId: 'demo',
    nome: 'Felipe Andrade',
    idade: 35,
    cidade: 'São Paulo, SP',
    curriculo: 'https://linkedin.com/in/felipe-andrade',
    pretensaoSalarial: 15000,
    salarioAtual: 13000,
    status: 'reprovado' as const,
    observacoes: 'Pretensão acima do budget aprovado para a posição.',
    customFields: { 'cf1': 10, 'cf2': 5, 'cf3': 'Fluente', 'cf4': true, 'cf5': 'Java', 'cf6': 5 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'demo-7',
    jobId: 'demo',
    nome: 'Gabriela Martins',
    idade: 26,
    cidade: 'Florianópolis, SC',
    curriculo: 'https://linkedin.com/in/gabriela-martins',
    pretensaoSalarial: 7000,
    salarioAtual: 5500,
    status: 'triagem' as const,
    observacoes: 'Júnior com bom potencial. Proativa e comunicativa.',
    customFields: { 'cf1': 2, 'cf2': 3, 'cf3': 'Básico', 'cf4': true, 'cf5': 'React', 'cf6': 3 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'demo-8',
    jobId: 'demo',
    nome: 'Henrique Souza',
    idade: 29,
    cidade: 'Brasília, DF',
    curriculo: 'https://linkedin.com/in/henrique-souza',
    pretensaoSalarial: 9000,
    salarioAtual: 7500,
    status: 'entrevista' as const,
    observacoes: 'Boa experiência com Next.js e arquitetura de sistemas.',
    customFields: { 'cf1': 5, 'cf2': 4, 'cf3': 'Avançado', 'cf4': true, 'cf5': 'Next.js', 'cf6': 4 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'demo-9',
    jobId: 'demo',
    nome: 'Isabela Ferreira',
    idade: 31,
    cidade: 'São Paulo, SP',
    curriculo: 'https://linkedin.com/in/isabela-ferreira',
    pretensaoSalarial: 11000,
    salarioAtual: 9000,
    status: 'teste' as const,
    observacoes: 'Tech lead com experiência em transformação digital.',
    customFields: { 'cf1': 9, 'cf2': 5, 'cf3': 'Fluente', 'cf4': true, 'cf5': 'React', 'cf6': 5 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'demo-10',
    jobId: 'demo',
    nome: 'João Pedro Almeida',
    idade: 24,
    cidade: 'Campinas, SP',
    curriculo: 'https://linkedin.com/in/joao-almeida',
    pretensaoSalarial: 5500,
    salarioAtual: 4000,
    status: 'triagem' as const,
    observacoes: 'Recém formado, busca primeira oportunidade como dev.',
    customFields: { 'cf1': 1, 'cf2': 3, 'cf3': 'Intermediário', 'cf4': true, 'cf5': 'JavaScript', 'cf6': 3 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'demo-11',
    jobId: 'demo',
    nome: 'Karina Lima',
    idade: 33,
    cidade: 'São Paulo, SP',
    curriculo: 'https://linkedin.com/in/karina-lima',
    pretensaoSalarial: 13000,
    salarioAtual: 11000,
    status: 'entrevista' as const,
    observacoes: 'Arquiteta de software com foco em cloud e microserviços.',
    customFields: { 'cf1': 10, 'cf2': 5, 'cf3': 'Fluente', 'cf4': true, 'cf5': 'AWS', 'cf6': 5 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'demo-12',
    jobId: 'demo',
    nome: 'Lucas Mendonça',
    idade: 27,
    cidade: 'Rio de Janeiro, RJ',
    curriculo: 'https://linkedin.com/in/lucas-mendonca',
    pretensaoSalarial: 8000,
    salarioAtual: 6500,
    status: 'offer' as const,
    observacoes: 'Full stack versátil, já trabalhou em startups.',
    customFields: { 'cf1': 4, 'cf2': 4, 'cf3': 'Avançado', 'cf4': true, 'cf5': 'Node.js', 'cf6': 4 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'demo-13',
    jobId: 'demo',
    nome: 'Mariana Costa',
    idade: 29,
    cidade: 'Belo Horizonte, MG',
    curriculo: 'https://linkedin.com/in/mariana-costa',
    pretensaoSalarial: 9200,
    salarioAtual: 7800,
    status: 'contratado' as const,
    observacoes: 'Contratada! Excelente perfil para a cultura da empresa.',
    customFields: { 'cf1': 6, 'cf2': 5, 'cf3': 'Avançado', 'cf4': true, 'cf5': 'React', 'cf6': 4 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'demo-14',
    jobId: 'demo',
    nome: 'Nathan Oliveira',
    idade: 26,
    cidade: 'São Paulo, SP',
    curriculo: 'https://linkedin.com/in/nathan-oliveira',
    pretensaoSalarial: 7200,
    salarioAtual: 5800,
    status: 'teste' as const,
    observacoes: 'Bom desempenho no teste técnico. Aguardando revisão.',
    customFields: { 'cf1': 3, 'cf2': 4, 'cf3': 'Intermediário', 'cf4': true, 'cf5': 'Python', 'cf6': 3 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'demo-15',
    jobId: 'demo',
    nome: 'Olivia Santos',
    idade: 30,
    cidade: 'Curitiba, PR',
    curriculo: 'https://linkedin.com/in/olivia-santos',
    pretensaoSalarial: 9800,
    salarioAtual: 8200,
    status: 'entrevista' as const,
    observacoes: 'Product-minded developer com visão de negócio.',
    customFields: { 'cf1': 7, 'cf2': 4, 'cf3': 'Fluente', 'cf4': false, 'cf5': 'React', 'cf6': 4 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'demo-16',
    jobId: 'demo',
    nome: 'Pedro Henrique',
    idade: 34,
    cidade: 'Porto Alegre, RS',
    curriculo: 'https://linkedin.com/in/pedro-henrique',
    pretensaoSalarial: 11500,
    salarioAtual: 9500,
    status: 'reprovado' as const,
    observacoes: 'Bom perfil técnico mas não alinhado com a cultura.',
    customFields: { 'cf1': 8, 'cf2': 4, 'cf3': 'Avançado', 'cf4': true, 'cf5': 'Java', 'cf6': 4 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'demo-17',
    jobId: 'demo',
    nome: 'Raquel Diniz',
    idade: 28,
    cidade: 'São Paulo, SP',
    curriculo: 'https://linkedin.com/in/raquel-diniz',
    pretensaoSalarial: 8800,
    salarioAtual: 7000,
    status: 'triagem' as const,
    observacoes: 'UX Engineer com background em design e desenvolvimento.',
    customFields: { 'cf1': 5, 'cf2': 5, 'cf3': 'Intermediário', 'cf4': true, 'cf5': 'React', 'cf6': 4 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'demo-18',
    jobId: 'demo',
    nome: 'Samuel Torres',
    idade: 32,
    cidade: 'Brasília, DF',
    curriculo: 'https://linkedin.com/in/samuel-torres',
    pretensaoSalarial: 10500,
    salarioAtual: 8800,
    status: 'offer' as const,
    observacoes: 'DevOps Engineer com experiência em CI/CD e Kubernetes.',
    customFields: { 'cf1': 7, 'cf2': 4, 'cf3': 'Fluente', 'cf4': true, 'cf5': 'DevOps', 'cf6': 5 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'demo-19',
    jobId: 'demo',
    nome: 'Tatiane Martins',
    idade: 25,
    cidade: 'Florianópolis, SC',
    curriculo: 'https://linkedin.com/in/tatiane-martins',
    pretensaoSalarial: 6500,
    salarioAtual: 5000,
    status: 'teste' as const,
    observacoes: 'Mobile developer com foco em React Native.',
    customFields: { 'cf1': 3, 'cf2': 4, 'cf3': 'Básico', 'cf4': true, 'cf5': 'React Native', 'cf6': 3 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'demo-20',
    jobId: 'demo',
    nome: 'Victor Hugo',
    idade: 29,
    cidade: 'Rio de Janeiro, RJ',
    curriculo: 'https://linkedin.com/in/victor-hugo',
    pretensaoSalarial: 9500,
    salarioAtual: 7800,
    status: 'entrevista' as const,
    observacoes: 'Backend specialist com expertise em arquitetura escalável.',
    customFields: { 'cf1': 6, 'cf2': 4, 'cf3': 'Avançado', 'cf4': true, 'cf5': 'Node.js', 'cf6': 4 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export function LandingPage({ store }: LandingPageProps) {
  const { navigateTo } = store;
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeModel, setActiveModel] = useState('padrao');

  const goToDemo = (modelId: string) => {
    const model = dashboardModels.find(m => m.id === modelId);
    const demoJobId = `demo-${modelId}`;
    
    store.selectJob({
      id: demoJobId,
      name: `Processo Seletivo - Desenvolvedor Full Stack`,
      plan: 'pro',
      createdAt: new Date(),
      template: 'ti',
      dashboardModel: modelId as any,
      colorTheme: model?.theme || 'blue',
      description: 'Processo seletivo para desenvolvedor full stack com experiência em React e Node.js',
      customFields: [
        { id: 'cf1', name: 'Anos de experiência', type: 'number', icon: 'Briefcase', visibility: { card: false, table: true, detail: true } },
        { id: 'cf2', name: 'Avaliação Técnica', type: 'rating', icon: 'Star', visibility: { card: true, table: false, detail: true }, maxRating: 5 },
        { id: 'cf3', name: 'Nível de Inglês', type: 'select', icon: 'Globe', visibility: { card: true, table: true, detail: true }, options: ['Básico', 'Intermediário', 'Avançado', 'Fluente'] },
        { id: 'cf4', name: 'Disponível remoto', type: 'boolean', icon: 'CheckCircle', visibility: { card: true, table: true, detail: true } },
        { id: 'cf5', name: 'Especialidade', type: 'select', icon: 'Code', visibility: { card: true, table: true, detail: true }, options: ['React', 'Node.js', 'Python', 'Java', 'Angular', 'Vue.js', 'AWS', 'DevOps', 'React Native', 'JavaScript'] },
        { id: 'cf6', name: 'Fit Cultural', type: 'rating', icon: 'Users', visibility: { card: true, table: false, detail: true }, maxRating: 5 },
      ],
    });
    
    // Adicionar candidatos localmente (sem API) para o demo
    const demoCandidatesWithJobId = demoCandidates.map(candidate => ({
      ...candidate,
      id: `${candidate.id}-${modelId}`,
      jobId: demoJobId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    
    // Adicionar candidatos diretamente ao estado do store
    store.addLocalCandidates(demoCandidatesWithJobId);
    
    navigateTo('dashboard');
  };

  const goToColorDemo = (key: string) => {
    const demoJobId = `demo-${key}`;
    store.selectJob({
      id: demoJobId,
      name: `Demo - Processo Seletivo Tech`,
      plan: 'pro',
      createdAt: new Date(),
      template: 'ti',
      dashboardModel: 'padrao',
      colorTheme: key as any,
      customFields: [
        { id: 'cf1', name: 'Anos de experiência', type: 'number', icon: 'Briefcase', visibility: { card: false, table: true, detail: true } },
        { id: 'cf2', name: 'Avaliação Técnica', type: 'rating', icon: 'Star', visibility: { card: true, table: false, detail: true }, maxRating: 5 },
        { id: 'cf3', name: 'Nível de Inglês', type: 'select', icon: 'Globe', visibility: { card: true, table: true, detail: true }, options: ['Básico', 'Intermediário', 'Avançado', 'Fluente'] },
        { id: 'cf4', name: 'Disponível remoto', type: 'boolean', icon: 'CheckCircle', visibility: { card: true, table: true, detail: true } },
        { id: 'cf5', name: 'Especialidade', type: 'select', icon: 'Code', visibility: { card: true, table: true, detail: true }, options: ['React', 'Node.js', 'Python', 'Java', 'Angular', 'Vue.js', 'AWS', 'DevOps', 'React Native', 'JavaScript'] },
        { id: 'cf6', name: 'Fit Cultural', type: 'rating', icon: 'Users', visibility: { card: true, table: false, detail: true }, maxRating: 5 },
      ],
    });
    // Adicionar candidatos localmente (sem API) para o demo
    const demoCandidatesWithJobId = demoCandidates.map(candidate => ({
      ...candidate,
      id: `${candidate.id}-${key}`,
      jobId: demoJobId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    
    store.addLocalCandidates(demoCandidatesWithJobId);
    navigateTo('dashboard');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src="/logo.jpg" alt="taldash" className="h-20 w-auto object-contain" />
            </div>
            
            <nav className="hidden lg:flex items-center gap-1">
              {['Como Funciona', 'Modelos', 'Recursos', 'Planos'].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">{item}</a>
              ))}
            </nav>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={() => navigateTo('login')}
                className="hidden sm:flex text-slate-600 hover:text-indigo-600"
              >
                Entrar
              </Button>
              <Button 
                onClick={() => navigateTo('register')} 
                className="hidden sm:flex bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg hover:shadow-xl transition-shadow"
              >
                Começar Grátis
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
        
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-100">
            <div className="px-4 py-4 space-y-2">
              {['Como Funciona', 'Modelos', 'Recursos', 'Planos'].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="block px-4 py-3 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>{item}</a>
              ))}
              <div className="pt-2 space-y-2">
                <Button 
                  variant="outline" 
                  onClick={() => { navigateTo('login'); setMobileMenuOpen(false); }} 
                  className="w-full"
                >
                  Entrar
                </Button>
                <Button 
                  onClick={() => { navigateTo('register'); setMobileMenuOpen(false); }} 
                  className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
                >
                  Começar Grátis
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-indigo-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-200/30 rounded-full blur-3xl" />
        
        <div className="relative w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 rounded-full">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-semibold text-indigo-700">Dashboards Editáveis • Templates Prontos</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                {t('landing.hero.title')}
              </h1>
              
              <p className="text-lg text-slate-600 max-w-xl">{t('landing.hero.subtitle')}</p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={() => navigateTo('register')} className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xl hover:shadow-2xl transition-shadow h-14 px-8">
                  <Zap className="w-5 h-5 mr-2" />
                  {t('landing.hero.cta')}
                </Button>
                <Button variant="outline" size="lg" onClick={() => goToDemo('padrao')} className="h-14 px-8 border-2 hover:bg-slate-50">
                  <Play className="w-5 h-5 mr-2" />
                  {t('landing.hero.models')}
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold">{String.fromCharCode(64 + i)}</div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                    <span className="ml-2 text-sm font-semibold">4.9/5</span>
                  </div>
                  <p className="text-sm text-slate-500">+500 gestores de RH confiam</p>
                </div>
              </div>
            </div>

            <div className="hidden lg:block relative">
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-xs text-slate-500">Processo Seletivo Tech</span>
                  <Palette className="w-4 h-4 text-slate-400" />
                </div>
                
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-4 gap-2">
                    {[{ label: 'Total', value: '24' }, { label: 'Entrevista', value: '8' }, { label: 'Contratados', value: '3' }, { label: 'Média', value: 'R$8K' }].map((kpi, i) => (
                      <div key={i} className="bg-slate-50 rounded-lg p-2 text-center">
                        <div className="w-6 h-6 bg-indigo-500 rounded mx-auto mb-1" />
                        <div className="text-sm font-bold">{kpi.value}</div>
                        <div className="text-[10px] text-slate-500">{kpi.label}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="text-xs font-medium text-slate-600 mb-2">Distribuição</div>
                      <div className="flex items-end gap-1 h-12">
                        {[40, 65, 45, 80, 55, 70].map((h, i) => <div key={i} className="flex-1 bg-indigo-500 rounded-t" style={{ height: `${h}%` }} />)}
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full border-4 border-indigo-500 border-r-violet-500 border-b-purple-500" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {[{ name: 'Ana Carolina', role: 'Frontend' }, { name: 'Bruno Mendes', role: 'Backend' }].map((cand, i) => (
                      <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-lg p-2">
                        <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">{cand.name.split(' ').map(n => n[0]).join('')}</div>
                        <div className="flex-1">
                          <div className="text-xs font-medium">{cand.name}</div>
                          <div className="text-[10px] text-slate-500">{cand.role}</div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">Entrevista</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-3 -left-3 bg-white rounded-lg shadow-lg p-3 border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold">Dados prontos!</div>
                    <div className="text-[10px] text-slate-500">Visualize em segundos</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-3 -right-3 bg-white rounded-lg shadow-lg p-3 border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-xl font-bold">128</div>
                    <div className="text-[10px] text-slate-500">Candidatos</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-slate-900">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/20 mb-4">
                  <stat.icon className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                <p className="text-slate-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="como-funciona" className="py-20 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-indigo-100 text-indigo-700">Simples e Rápido</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Como funciona o <span className="text-indigo-600">taldash</span></h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Em apenas 4 passos, você tem uma visão completa dos seus candidatos</p>
          </div>

          <div className="max-w-4xl mx-auto mb-12">
            <Stepper steps={demoSteps} currentStep={3} />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorksSteps.map((step, index) => (
              <Card key={step.id} className="relative hover:shadow-xl transition-all border-0 shadow-lg">
                <div className={`absolute -top-4 left-6 w-10 h-10 bg-gradient-to-br ${step.color} rounded-lg flex items-center justify-center text-white font-bold shadow-lg`}>{index + 1}</div>
                <CardHeader className="pt-8">
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 text-sm">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button size="lg" onClick={() => navigateTo('register')} className="bg-gradient-to-r from-indigo-600 to-violet-600 h-14 px-8">
              Criar Conta Grátis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Dashboard Models */}
      <section id="modelos" className="py-20 bg-slate-50">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-amber-100 text-amber-700">Personalização Total</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Escolha o visual perfeito</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">4 modelos de dashboard e 6 paletas de cores para personalizar</p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {dashboardModels.map((model) => (
              <button key={model.id} onClick={() => setActiveModel(model.id)} className={`px-5 py-2.5 rounded-lg font-medium transition-all ${activeModel === model.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}>
                {model.name}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">{dashboardModels.find(m => m.id === activeModel)?.name}</h3>
                <span className="text-sm text-slate-500">{dashboardModels.find(m => m.id === activeModel)?.description}</span>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-2">
                  {[{ label: 'Total', value: '24' }, { label: 'Entrevista', value: '8' }, { label: 'Contratados', value: '3' }, { label: 'Média', value: 'R$8K' }].map((kpi, i) => (
                    <div key={i} className="bg-slate-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-slate-800">{kpi.value}</div>
                      <div className="text-xs text-slate-500">{kpi.label}</div>
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-lg p-4 h-32 flex items-end gap-1">
                    {[40, 65, 45, 80, 55, 70].map((h, i) => <div key={i} className="flex-1 bg-indigo-500 rounded-t" style={{ height: `${h}%` }} />)}
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 h-32 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full border-8 border-indigo-500 border-r-violet-500 border-b-purple-500 border-l-amber-500" />
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <Button onClick={() => goToDemo(activeModel)} className="w-full bg-gradient-to-r from-indigo-600 to-violet-600">
                  <Play className="w-4 h-4 mr-2" />
                  Experimentar Este Modelo
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Escolha sua paleta de cores</h3>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(COLOR_THEMES).map(([key, theme]) => (
                  <button key={key} onClick={() => goToColorDemo(key)} className="p-4 rounded-xl border-2 border-slate-100 hover:border-indigo-300 hover:shadow-md transition-all text-center">
                    <div className="w-10 h-10 rounded-full mx-auto mb-2" style={{ backgroundColor: theme.primary }} />
                    <span className="text-sm font-medium text-slate-700">{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="recursos" className="py-20 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-emerald-100 text-emerald-700">Recursos Poderosos</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Tudo que você precisa</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">Ferramentas completas para mapear, comparar e analisar candidatos</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-xl transition-all border-0 shadow-lg">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="planos" className="py-20 bg-slate-50">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-violet-100 text-violet-700">Planos Flexíveis</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Escolha o plano ideal</h2>
            <p className="text-lg text-slate-600">Comece grátis e evolua conforme suas necessidades</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {planList.map(({ key, plan, recommended }) => (
              <Card key={key} className={`relative flex flex-col ${recommended ? 'border-2 border-indigo-500 shadow-xl scale-105' : 'border border-slate-200 shadow-md'}`}>
                {recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-indigo-600 text-white"><Star className="w-3 h-3 mr-1" />Mais Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <div className="mt-3">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    {plan.price !== 'Sob consulta' && plan.price !== 'Grátis' && <span className="text-slate-500 text-sm">/mês</span>}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-2 mb-6 flex-1">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    variant={recommended ? 'default' : 'outline'} 
                    className={recommended ? 'bg-gradient-to-r from-indigo-600 to-violet-600' : ''} 
                    onClick={() => navigateTo('register')}
                  >
                    {recommended ? 'Começar Grátis' : 'Escolher'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 to-violet-700">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Pronto para contratar melhor?</h2>
          <p className="text-lg text-indigo-100 mb-8">Crie seu primeiro mapeamento gratuitamente e tenha insights claros para suas decisões.</p>
          <Button size="lg" variant="secondary" onClick={() => navigateTo('register')} className="bg-white text-indigo-600 hover:bg-indigo-50 h-14 px-8">
            <Zap className="w-5 h-5 mr-2" />
            Criar Conta Grátis
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-slate-900 text-slate-400">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/logo.jpg" alt="taldash" className="h-16 w-auto object-contain" />
            </div>
            <p className="text-sm">© 2024 taldash. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { Suspense, lazy } from 'react';
import { useStore } from '@/hooks/useStore';
import { PageLoader } from '@/components/PageLoader';
import './App.css';

// TalentDash - Sistema de Recrutamento Inteligente
// MVP Visual com fluxo passo a passo
// Otimizado com Code Splitting e Lazy Loading

// ============================================
// LAZY LOADED COMPONENTS - CHUNKS SEPARADOS
// ============================================

// Landing page - carregada imediatamente (primeira impressão)
const LandingPage = lazy(() => import('@/sections/LandingPage').then(m => ({ default: m.LandingPage })));

// AUTH CHUNK - Sistema de autenticação (Login, Register)
// Carregado apenas quando usuário acessa páginas de auth
const LoginPage = lazy(() => import(/* webpackChunkName: "auth" */ '@/sections/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import(/* webpackChunkName: "auth" */ '@/sections/RegisterPage').then(m => ({ default: m.RegisterPage })));

// DASHBOARD CHUNK - Área logada pesada (UserDashboard, CreateJob, etc)
// Contém componentes pesados como Recharts
const UserDashboardPage = lazy(() => import(/* webpackChunkName: "dashboard" */ '@/sections/UserDashboardPage').then(m => ({ default: m.UserDashboardPage })));
const CreateJobPage = lazy(() => import(/* webpackChunkName: "dashboard" */ '@/sections/CreateJobPage').then(m => ({ default: m.CreateJobPage })));
const DataStructurePage = lazy(() => import(/* webpackChunkName: "dashboard" */ '@/sections/DataStructurePage').then(m => ({ default: m.DataStructurePage })));
const AddCandidatesPage = lazy(() => import(/* webpackChunkName: "dashboard" */ '@/sections/AddCandidatesPage').then(m => ({ default: m.AddCandidatesPage })));
const DashboardPage = lazy(() => import(/* webpackChunkName: "dashboard" */ '@/sections/DashboardPage').then(m => ({ default: m.DashboardPage })));
const CandidateDetailPage = lazy(() => import(/* webpackChunkName: "dashboard" */ '@/sections/CandidateDetailPage').then(m => ({ default: m.CandidateDetailPage })));

function App() {
  const store = useStore();
  const { state } = store;

  // Renderiza a tela atual baseada no estado de navegação
  // Com Suspense para mostrar loading enquanto os chunks carregam
  switch (state.currentView) {
    case 'landing':
      return (
        <Suspense fallback={<PageLoader message="Carregando TalentDash..." />}>
          <LandingPage store={store} />
        </Suspense>
      );
    
    case 'login':
      return (
        <Suspense fallback={<PageLoader message="Carregando login..." />}>
          <LoginPage store={store} />
        </Suspense>
      );
    
    case 'register':
      return (
        <Suspense fallback={<PageLoader message="Carregando cadastro..." />}>
          <RegisterPage store={store} />
        </Suspense>
      );
    
    case 'user-dashboard':
      return (
        <Suspense fallback={<PageLoader message="Carregando dashboard..." />}>
          <UserDashboardPage store={store} />
        </Suspense>
      );
    
    case 'create-job':
      return (
        <Suspense fallback={<PageLoader message="Carregando criador de vagas..." />}>
          <CreateJobPage store={store} />
        </Suspense>
      );
    
    case 'data-structure':
      return (
        <Suspense fallback={<PageLoader message="Carregando estrutura de dados..." />}>
          <DataStructurePage store={store} />
        </Suspense>
      );
    
    case 'add-candidates':
      return (
        <Suspense fallback={<PageLoader message="Carregando gestão de candidatos..." />}>
          <AddCandidatesPage store={store} />
        </Suspense>
      );
    
    case 'dashboard':
      return (
        <Suspense fallback={<PageLoader message="Carregando analytics..." />}>
          <DashboardPage store={store} />
        </Suspense>
      );
    
    case 'candidate-detail':
      return (
        <Suspense fallback={<PageLoader message="Carregando detalhes..." />}>
          <CandidateDetailPage store={store} />
        </Suspense>
      );
    
    default:
      return (
        <Suspense fallback={<PageLoader message="Carregando..." />}>
          <LandingPage store={store} />
        </Suspense>
      );
  }
}

export default App;

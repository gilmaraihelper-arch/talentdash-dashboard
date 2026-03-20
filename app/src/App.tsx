import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useStore } from '@/hooks/useStore';
import { PageLoader } from '@/components/PageLoader';
import './App.css';

// taldash - Sistema de Recrutamento Inteligente
// MVP Visual com fluxo passo a passo
// Otimizado com Code Splitting e Lazy Loading

// ============================================
// LAZY LOADED COMPONENTS - CHUNKS SEPARADOS
// ============================================

// Landing page - carregada imediatamente (primeira impressão)
const LandingPage = lazy(() => import('@/sections/LandingPage').then(m => ({ default: m.LandingPage })));

// AUTH CHUNK - Sistema de autenticação (Login, Register)
const LoginPage = lazy(() => import(/* webpackChunkName: "auth" */ '@/sections/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import(/* webpackChunkName: "auth" */ '@/sections/RegisterPage').then(m => ({ default: m.RegisterPage })));

// DASHBOARD CHUNK - Área logada pesada
const UserDashboardPage = lazy(() => import(/* webpackChunkName: "dashboard" */ '@/sections/UserDashboardPage').then(m => ({ default: m.UserDashboardPage })));
const CreateJobPage = lazy(() => import(/* webpackChunkName: "dashboard" */ '@/sections/CreateJobPage').then(m => ({ default: m.CreateJobPage })));
const DataStructurePage = lazy(() => import(/* webpackChunkName: "dashboard" */ '@/sections/DataStructurePage').then(m => ({ default: m.DataStructurePage })));
const AddCandidatesPage = lazy(() => import(/* webpackChunkName: "dashboard" */ '@/sections/AddCandidatesPage').then(m => ({ default: m.AddCandidatesPage })));
const DashboardPage = lazy(() => import(/* webpackChunkName: "dashboard" */ '@/sections/DashboardPage').then(m => ({ default: m.DashboardPage })));
const CandidateDetailPage = lazy(() => import(/* webpackChunkName: "dashboard" */ '@/sections/CandidateDetailPage').then(m => ({ default: m.CandidateDetailPage })));
const AdminPage = lazy(() => import(/* webpackChunkName: "dashboard" */ '@/sections/AdminPage').then(m => ({ default: m.AdminPage })));

// ============================================
// PROTECTED ROUTE - Redirects to /login if not authenticated
// ============================================
function ProtectedRoute({ 
  children, 
  adminOnly = false,
  store,
}: { 
  children: React.ReactNode;
  adminOnly?: boolean;
  store: ReturnType<typeof useStore>;
}) {
  const location = useLocation();

  if (!store.state.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && store.state.user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function App() {
  const store = useStore();

  return (
    <Suspense fallback={<PageLoader message="Carregando..." />}>
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={<LandingPage store={store} />}
        />
        <Route
          path="/login"
          element={<LoginPage store={store} />}
        />
        <Route
          path="/register"
          element={<RegisterPage store={store} />}
        />

        {/* Protected dashboard routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute store={store}>
              <UserDashboardPage store={store} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/create-job"
          element={
            <ProtectedRoute store={store}>
              <CreateJobPage store={store} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/data-structure"
          element={
            <ProtectedRoute store={store}>
              <DataStructurePage store={store} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/add-candidates"
          element={
            <ProtectedRoute store={store}>
              <AddCandidatesPage store={store} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/analytics"
          element={
            <ProtectedRoute store={store}>
              <DashboardPage store={store} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/candidate/:id"
          element={
            <ProtectedRoute store={store}>
              <CandidateDetailPage store={store} />
            </ProtectedRoute>
          }
        />

        {/* Admin route */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly store={store}>
              <AdminPage onBack={() => store.navigateTo('user-dashboard')} />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;

import { useState } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Users, 
  TrendingUp,
  CreditCard,
  Crown,
  LogOut,
  Edit3,
  Trash2,
  Briefcase,
  Calendar,
  Check,
  Eye,
  Building2,
  Mail,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PLANS, type PlanType } from '@/types';
import type { Store } from '@/hooks/useStore';

interface UserDashboardPageProps {
  store: Store;
}

export function UserDashboardPage({ store }: UserDashboardPageProps) {
  const { 
    state, 
    navigateTo, 
    logout, 
    selectJob, 
    updateUserProfile, 
    changePlan,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod
  } = store;
  
  const { user, jobs } = state;
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [, setEditingJob] = useState<string | null>(null);
  
  // Estado do dialog de confirmação de exclusão
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; jobId: string | null }>({
    isOpen: false,
    jobId: null,
  });
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    companyName: user?.companyName || '',
  });
  
  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    cardName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
  });

  const filteredJobs = jobs.filter(job => 
    job.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    logout();
    navigateTo('landing');
  };

  const handleSaveProfile = () => {
    updateUserProfile(profileForm);
    setShowProfileDialog(false);
  };

  const handleAddPayment = () => {
    const last4 = paymentForm.cardNumber.slice(-4);
    addPaymentMethod({
      type: 'credit_card',
      last4,
      brand: 'Visa',
      expiryMonth: paymentForm.expiryMonth,
      expiryYear: paymentForm.expiryYear,
      isDefault: user?.paymentMethods?.length === 0,
    });
    setPaymentForm({
      cardNumber: '',
      cardName: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
    });
    setShowPaymentDialog(false);
  };

  const handleDeleteJob = (jobId: string) => {
    setDeleteDialog({ isOpen: true, jobId });
  };

  const confirmDeleteJob = () => {
    if (deleteDialog.jobId) {
      // Implementar exclusão no store
      console.log('Excluindo mapeamento:', deleteDialog.jobId);
    }
    setDeleteDialog({ isOpen: false, jobId: null });
  };

  const getJobStats = (jobId: string) => {
    const jobCandidates = state.candidates.filter(c => c.jobId === jobId);
    return {
      total: jobCandidates.length,
      byStatus: {
        triagem: jobCandidates.filter(c => c.status === 'triagem').length,
        entrevista: jobCandidates.filter(c => c.status === 'entrevista').length,
        teste: jobCandidates.filter(c => c.status === 'teste').length,
        offer: jobCandidates.filter(c => c.status === 'offer').length,
        contratado: jobCandidates.filter(c => c.status === 'contratado').length,
        reprovado: jobCandidates.filter(c => c.status === 'reprovado').length,
      }
    };
  };

  if (!user) {
    navigateTo('login');
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img src="/logo.jpg" alt="taldash" className="h-10 w-auto object-contain" />
            </div>
            
            {/* User Menu */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPlanDialog(true)}
                className="hidden sm:flex items-center gap-2"
              >
                <Crown className="w-4 h-4 text-amber-500" />
                <span className="capitalize">{PLANS[user.plan || 'free'].name}</span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 hover:bg-slate-100 rounded-lg p-2 transition-colors">
                    <Avatar className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-500">
                      <AvatarFallback className="text-white text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block text-sm font-medium text-slate-700">
                      {user.name}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowProfileDialog(true)}>
                    <User className="w-4 h-4 mr-2" />
                    Editar perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowPlanDialog(true)}>
                    <Crown className="w-4 h-4 mr-2" />
                    Meu plano
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowPaymentDialog(true)}>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pagamentos
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-rose-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Olá, {user.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-slate-600 mt-1">
            Gerencie seus mapeamentos e acompanhe seus candidatos
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{jobs.length}</p>
                  <p className="text-xs text-slate-500">Mapeamentos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{state.candidates.length}</p>
                  <p className="text-xs text-slate-500">Candidatos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {state.candidates.filter(c => c.status === 'entrevista').length}
                  </p>
                  <p className="text-xs text-slate-500">Em entrevista</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                  <Check className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {state.candidates.filter(c => c.status === 'contratado').length}
                  </p>
                  <p className="text-xs text-slate-500">Contratados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Jobs Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Meus Mapeamentos</CardTitle>
              <CardDescription>
                Gerencie seus processos seletivos
              </CardDescription>
            </div>
            <Button 
              onClick={() => navigateTo('create-job')}
              className="bg-gradient-to-r from-indigo-600 to-violet-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Mapeamento
            </Button>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar mapeamentos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Jobs List */}
            {filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-500 mb-4">
                  {searchQuery ? 'Nenhum mapeamento encontrado' : 'Você ainda não tem mapeamentos'}
                </p>
                <Button 
                  onClick={() => navigateTo('create-job')}
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar primeiro mapeamento
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredJobs.map((job) => {
                  const stats = getJobStats(job.id);
                  return (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${PLANS[job.plan || 'free'].name === 'Free' ? '#94a3b8' : '#4F46E5'}15` }}
                        >
                          <Briefcase 
                            className="w-6 h-6"
                            style={{ color: PLANS[job.plan || 'free'].name === 'Free' ? '#94a3b8' : '#4F46E5' }}
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{job.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span>{stats.total} candidatos</span>
                            <span>•</span>
                            <span className="capitalize">{PLANS[job.plan || 'free'].name}</span>
                            <span>•</span>
                            <span>{new Date(job.createdAt).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Status indicators */}
                        <div className="hidden md:flex items-center gap-2 mr-4">
                          {stats.byStatus.entrevista > 0 && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                              {stats.byStatus.entrevista} entrevista
                            </Badge>
                          )}
                          {stats.byStatus.contratado > 0 && (
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                              {stats.byStatus.contratado} contratado
                            </Badge>
                          )}
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            selectJob(job);
                            navigateTo('dashboard');
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              selectJob(job);
                              navigateTo('dashboard');
                            }}>
                              <Eye className="w-4 h-4 mr-2" />
                              Ver dashboard
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEditingJob(job.id)}>
                              <Edit3 className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteJob(job.id)}
                              className="text-rose-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Profile Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
            <DialogDescription>
              Atualize suas informações pessoais
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Empresa</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={profileForm.companyName}
                  onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })}
                  className="pl-10"
                  placeholder="Nome da empresa"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowProfileDialog(false)}>
              Cancelar
            </Button>
            <Button className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600" onClick={handleSaveProfile}>
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Plan Dialog */}
      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              Gerenciar Plano
            </DialogTitle>
            <DialogDescription>
              Seu plano atual: <span className="font-medium capitalize">{PLANS[user.plan || 'free'].name}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {(Object.keys(PLANS) as PlanType[]).map((planKey) => {
              const plan = PLANS[planKey];
              const isCurrent = user.plan === planKey;
              
              return (
                <Card 
                  key={planKey} 
                  className={`${isCurrent ? 'ring-2 ring-indigo-500 border-indigo-500' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{plan.name}</h3>
                          {isCurrent && (
                            <Badge className="bg-indigo-100 text-indigo-700">
                              Atual
                            </Badge>
                          )}
                        </div>
                        <p className="text-2xl font-bold mt-1">{plan.price}</p>
                        <ul className="mt-2 space-y-1">
                          {plan.features.slice(0, 3).map((feature, idx) => (
                            <li key={idx} className="text-sm text-slate-600 flex items-center gap-2">
                              <Check className="w-3 h-3 text-emerald-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Button
                        variant={isCurrent ? 'outline' : 'default'}
                        disabled={isCurrent}
                        onClick={() => {
                          changePlan(planKey);
                          setShowPlanDialog(false);
                        }}
                        className={!isCurrent ? 'bg-gradient-to-r from-indigo-600 to-violet-600' : ''}
                      >
                        {isCurrent ? 'Atual' : 'Escolher'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Formas de Pagamento
            </DialogTitle>
            <DialogDescription>
              Gerencie seus métodos de pagamento
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">Meus cartões</TabsTrigger>
              <TabsTrigger value="add">Adicionar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="list" className="space-y-3">
              {(user.paymentMethods?.length ?? 0) === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">Nenhum cartão cadastrado</p>
                </div>
              ) : (
                user.paymentMethods?.map((pm) => (
                  <Card key={pm.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-slate-600" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {pm.brand} •••• {pm.last4}
                            </p>
                            <p className="text-sm text-slate-500">
                              Expira {pm.expiryMonth}/{pm.expiryYear}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {pm.isDefault && (
                            <Badge variant="secondary" className="text-xs">
                              Padrão
                            </Badge>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {!pm.isDefault && (
                                <DropdownMenuItem onClick={() => setDefaultPaymentMethod(pm.id)}>
                                  Definir como padrão
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => removePaymentMethod(pm.id)}
                                className="text-rose-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remover
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
            
            <TabsContent value="add" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Número do cartão</label>
                <Input
                  placeholder="0000 0000 0000 0000"
                  value={paymentForm.cardNumber}
                  onChange={(e) => setPaymentForm({ ...paymentForm, cardNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome no cartão</label>
                <Input
                  placeholder="NOME COMO ESTÁ NO CARTÃO"
                  value={paymentForm.cardName}
                  onChange={(e) => setPaymentForm({ ...paymentForm, cardName: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mês</label>
                  <Input
                    placeholder="MM"
                    maxLength={2}
                    value={paymentForm.expiryMonth}
                    onChange={(e) => setPaymentForm({ ...paymentForm, expiryMonth: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ano</label>
                  <Input
                    placeholder="AA"
                    maxLength={2}
                    value={paymentForm.expiryYear}
                    onChange={(e) => setPaymentForm({ ...paymentForm, expiryYear: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">CVV</label>
                  <Input
                    placeholder="123"
                    maxLength={4}
                    type="password"
                    value={paymentForm.cvv}
                    onChange={(e) => setPaymentForm({ ...paymentForm, cvv: e.target.value })}
                  />
                </div>
              </div>
              <Button 
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600"
                onClick={handleAddPayment}
                disabled={!paymentForm.cardNumber || !paymentForm.cardName}
              >
                Adicionar cartão
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      
      {/* Dialog de confirmação de exclusão */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, jobId: null })}
        onConfirm={confirmDeleteJob}
        title="Excluir mapeamento"
        description="Tem certeza que deseja excluir este mapeamento? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  );
}

import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  MapPin, 
  Calendar, 
  DollarSign, 
  FileText,
  ExternalLink,
  Briefcase,
  MessageSquare,
  User,
  Star,
  CheckCircle,
  Link as LinkIcon,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { StatusBadge, FieldRenderer, InfoBox } from '@/components/ui/custom';
import { STATUS_LABELS } from '@/types';
import { mockCandidates } from '@/data/mock';
import type { Store } from '@/hooks/useStore';

interface CandidateDetailPageProps {
  store: Store;
}

// Função para validar URL segura (prevenção XSS)
const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

export function CandidateDetailPage({ store }: CandidateDetailPageProps) {
  const { navigateTo, state, deleteCandidate, updateCandidate } = store;
  const candidate = state.selectedCandidate;
  const job = state.selectedJob;
  
  // Fallback para mockados na demo
  const displayCandidate = candidate || mockCandidates[0];
  const displayJob = job || { 
    customFields: [],
    name: 'Desenvolvedor Frontend React'
  };
  
  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir este candidato?')) {
      deleteCandidate(displayCandidate.id);
      navigateTo('dashboard');
    }
  };
  
  const handleStatusChange = (newStatus: string) => {
    updateCandidate(displayCandidate.id, { status: newStatus as any });
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigateTo('dashboard')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold">Detalhes do Candidato</h1>
                <p className="text-sm text-slate-500">{displayJob.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleDelete} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <span className="cursor-pointer hover:text-slate-700" onClick={() => navigateTo('dashboard')}>Dashboard</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-900 font-medium">{displayCandidate.nome}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header do Candidato */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                    {displayCandidate.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h2 className="text-2xl font-bold">{displayCandidate.nome}</h2>
                      <StatusBadge status={displayCandidate.status} />
                    </div>
                    <p className="text-slate-500 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {displayCandidate.idade} anos • {displayCandidate.cidade}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Pretensão Salarial</p>
                      <p className="font-medium">{formatCurrency(displayCandidate.pretensaoSalarial)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Salário Atual</p>
                      <p className="font-medium">{formatCurrency(displayCandidate.salarioAtual)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Currículo</p>
                      {displayCandidate.curriculo && isValidUrl(displayCandidate.curriculo) ? (
                        <a 
                          href={displayCandidate.curriculo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:underline flex items-center gap-1"
                        >
                          Ver currículo
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <p className="text-slate-400">
                          {displayCandidate.curriculo ? 'Link inválido' : 'Não informado'}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Data de Cadastro</p>
                      <p className="font-medium">
                        {new Date(displayCandidate.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Observações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Observações da Entrevista
                </CardTitle>
              </CardHeader>
              <CardContent>
                {displayCandidate.observacoes ? (
                  <p className="text-slate-700 whitespace-pre-wrap">
                    {displayCandidate.observacoes}
                  </p>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-slate-400 italic">Nenhuma observação registrada</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Edit className="w-4 h-4 mr-2" />
                      Adicionar Observação
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Campos Personalizados */}
            {displayJob.customFields.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Campos Personalizados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {displayJob.customFields
                      .filter(field => field.visibility.detail)
                      .map((field) => (
                        <div key={field.id} className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            {field.type === 'rating' && <Star className="w-5 h-5 text-slate-600" />}
                            {field.type === 'boolean' && <CheckCircle className="w-5 h-5 text-slate-600" />}
                            {field.type === 'link' && <LinkIcon className="w-5 h-5 text-slate-600" />}
                            {field.type === 'number' && <span className="text-lg font-bold text-slate-600">#</span>}
                            {field.type === 'select' && <span className="text-lg font-bold text-slate-600">≡</span>}
                            {field.type === 'text' && <span className="text-lg font-bold text-slate-600">T</span>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-500">{field.name}</p>
                            <div className="mt-1">
                              <FieldRenderer 
                                field={field} 
                                value={displayCandidate.customFields[field.id]} 
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Ações Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Alterar Status</label>
                  <InfoBox type="tip" className="text-xs">
                    Mude o status para acompanhar a evolução do candidato no funil
                  </InfoBox>
                  <select
                    value={displayCandidate.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  >
                    {Object.entries(STATUS_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                
                <Separator />
                
                <Button variant="outline" className="w-full" onClick={() => {}}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Candidato
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full text-red-600"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir Candidato
                </Button>
              </CardContent>
            </Card>

            {/* Resumo */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Status atual</span>
                  <StatusBadge status={displayCandidate.status} size="sm" />
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Idade</span>
                  <span className="font-medium">{displayCandidate.idade} anos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cidade</span>
                  <span className="font-medium">{displayCandidate.cidade}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-slate-500">Diferença salarial</span>
                  <span className={`font-medium ${
                    displayCandidate.pretensaoSalarial > displayCandidate.salarioAtual 
                      ? 'text-green-600' 
                      : 'text-slate-600'
                  }}`}>
                    +{formatCurrency(displayCandidate.pretensaoSalarial - displayCandidate.salarioAtual)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Histórico</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Candidato cadastrado</p>
                      <p className="text-xs text-slate-500">
                        {new Date(displayCandidate.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  {displayCandidate.status !== 'triagem' && (
                    <div className="flex gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Status alterado</p>
                        <p className="text-xs text-slate-500">
                          Para: {STATUS_LABELS[displayCandidate.status]}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-slate-300 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-400">Última atualização</p>
                      <p className="text-xs text-slate-400">
                        {new Date(displayCandidate.updatedAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

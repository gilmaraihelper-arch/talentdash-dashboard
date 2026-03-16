import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Briefcase, 
  Star, 
  Type, 
  Hash, 
  List, 
  CheckCircle, 
  Link as LinkIcon,
  AlertCircle,
  Eye,
  Table,
  LayoutGrid,
  Lightbulb,
  ChevronRight,
  ChevronLeft,
  Check,
  TrendingUp,
  Code,
  Settings,
  FileText,
  LayoutDashboard,
  BarChart3,
  Columns,
  Minimize2,
  Palette,
  Sparkles,
  Copy,
  CheckCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  PLANS, 
  BASIC_FIELDS, 
  FIELD_ICONS, 
  JOB_TEMPLATES, 
  DASHBOARD_MODELS, 
  COLOR_THEMES,
  type PlanType, 
  type CustomField, 
  type FieldType,
  type JobTemplateType,
  type DashboardModel,
  type ColorTheme
} from '@/types';
import { Stepper, InfoBox, HelpTooltip } from '@/components/ui/custom';
import { jobInfoSchema, customFieldSchema, type JobInfoFormData, type CustomFieldFormData } from '@/lib/validation';
import type { Store } from '@/hooks/useStore';

interface CreateJobPageProps {
  store: Store;
}

const FIELD_TYPE_CONFIG: Record<FieldType, { label: string; icon: any; description: string; example: string }> = {
  text: { 
    label: 'Texto livre', 
    icon: Type, 
    description: 'Para textos curtos ou longos',
    example: 'Ex: "Resumo da entrevista", "Experiência anterior"'
  },
  number: { 
    label: 'Número', 
    icon: Hash, 
    description: 'Valores numéricos',
    example: 'Ex: "Anos de experiência", "Nota técnica"'
  },
  rating: { 
    label: 'Avaliação por estrelas', 
    icon: Star, 
    description: 'Nota de 1 a 5 estrelas',
    example: 'Ex: "Domínio de React", "Nível de inglês"'
  },
  select: { 
    label: 'Seleção (dropdown)', 
    icon: List, 
    description: 'Opções pré-definidas',
    example: 'Ex: "Nível de inglês: Básico/Intermediário/Avançado/Fluente"'
  },
  boolean: { 
    label: 'Sim/Não', 
    icon: CheckCircle, 
    description: 'Verdadeiro ou falso',
    example: 'Ex: "Disponível para viagens?", "Tem certificação?"'
  },
  link: { 
    label: 'Link', 
    icon: LinkIcon, 
    description: 'URLs e links externos',
    example: 'Ex: "LinkedIn", "GitHub", "Portfólio"'
  },
};

const TEMPLATE_ICONS: Record<string, any> = {
  FileText,
  TrendingUp,
  Code,
  Settings,
};

const DASHBOARD_ICONS: Record<string, any> = {
  LayoutDashboard,
  BarChart3,
  Columns,
  Minimize2,
};

const createJobSteps = [
  { id: 'template', title: 'Template', description: 'Escolha o tipo' },
  { id: 'info', title: 'Informações', description: 'Nome e descrição' },
  { id: 'personalizados', title: 'Critérios', description: 'Configure análises' },
  { id: 'dashboard', title: 'Dashboard', description: 'Modelo e cores' },
  { id: 'revisao', title: 'Revisão', description: 'Confirme tudo' },
];

export function CreateJobPage({ store }: CreateJobPageProps) {
  const { navigateTo, createJob } = store;
  
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('pro');
  const [selectedTemplate, setSelectedTemplate] = useState<JobTemplateType>('blank');
  const [selectedDashboardModel, setSelectedDashboardModel] = useState<DashboardModel>('padrao');
  const [selectedColorTheme, setSelectedColorTheme] = useState<ColorTheme>('blue');
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [showAddFieldDialog, setShowAddFieldDialog] = useState(false);
  const [showTemplateConfirmDialog, setShowTemplateConfirmDialog] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<JobTemplateType | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form de informações básicas
  const {
    register,
    formState: { errors: infoErrors },
    watch: watchInfo,
    trigger: triggerInfo,
  } = useForm<JobInfoFormData>({
    resolver: zodResolver(jobInfoSchema),
    mode: 'onChange',
    defaultValues: {
      jobName: '',
      jobDescription: '',
    },
  });

  const jobInfo = watchInfo();
  
  // Form de novo campo personalizado
  const {
    register: registerField,
    handleSubmit: handleSubmitField,
    formState: { errors: fieldErrors },
    watch: watchField,
    reset: resetField,
  } = useForm<CustomFieldFormData>({
    resolver: zodResolver(customFieldSchema),
    mode: 'onChange',
    defaultValues: {
      fieldName: '',
      fieldType: 'text',
      fieldOptions: '',
      fieldIcon: 'Star',
      visibility: { card: true, table: true, detail: true },
    },
  });

  const fieldFormValues = watchField();
  
  const maxFields = PLANS[selectedPlan].maxCustomFields;
  const remainingFields = maxFields === Infinity ? 'Ilimitado' : maxFields - customFields.length;
  const canAddMore = maxFields === Infinity || customFields.length < maxFields;
  
  const handleNext = async () => {
    let canProceed = false;
    
    switch (currentStep) {
      case 0: // Template - sempre pode avançar
        canProceed = true;
        break;
      case 1: // Informações - valida o form
        canProceed = await triggerInfo();
        break;
      case 2: // Campos personalizados - sempre pode avançar
        canProceed = true;
        break;
      case 3: // Dashboard - sempre pode avançar
        canProceed = true;
        break;
      default:
        canProceed = true;
    }
    
    if (canProceed && currentStep < createJobSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleTemplateSelect = (template: JobTemplateType) => {
    if (customFields.length > 0 && template !== selectedTemplate) {
      setPendingTemplate(template);
      setShowTemplateConfirmDialog(true);
    } else {
      applyTemplate(template);
    }
  };
  
  const applyTemplate = (template: JobTemplateType) => {
    setSelectedTemplate(template);
    const templateConfig = JOB_TEMPLATES[template];
    
    if (templateConfig.suggestedFields && templateConfig.suggestedFields.length > 0) {
      const fields: CustomField[] = templateConfig.suggestedFields.map((field, index) => ({
        id: `cf-template-${index}-${Date.now()}`,
        name: field.name || '',
        type: (field.type as FieldType) || 'text',
        icon: field.icon || 'Star',
        visibility: field.visibility || { card: true, table: true, detail: true },
        ...(field.options ? { options: field.options } : {}),
        ...(field.type === 'rating' ? { maxRating: 5 } : {}),
      }));
      setCustomFields(fields);
    } else {
      setCustomFields([]);
    }
    setShowTemplateConfirmDialog(false);
    setPendingTemplate(null);
  };
  
  const onAddField = (data: CustomFieldFormData) => {
    const field: CustomField = {
      id: `cf-${Date.now()}`,
      name: data.fieldName.trim(),
      type: data.fieldType,
      icon: data.fieldIcon,
      visibility: { ...data.visibility },
      ...(data.fieldType === 'select' && data.fieldOptions 
        ? { options: data.fieldOptions.split(',').map(o => o.trim()).filter(Boolean) }
        : {}),
      ...(data.fieldType === 'rating' ? { maxRating: 5 } : {}),
    };
    
    setCustomFields([...customFields, field]);
    resetField();
    setShowAddFieldDialog(false);
  };
  
  const handleRemoveField = (id: string) => {
    setCustomFields(customFields.filter(f => f.id !== id));
  };
  
  const handleCreateJob = () => {
    if (!jobInfo.jobName.trim()) return;
    
    setIsCreating(true);
    
    // Simula um pequeno delay para mostrar loading
    setTimeout(() => {
      createJob(jobInfo.jobName.trim(), selectedPlan, customFields, {
        template: selectedTemplate,
        dashboardModel: selectedDashboardModel,
        colorTheme: selectedColorTheme,
        description: jobInfo.jobDescription,
      });
      navigateTo('data-structure');
      setIsCreating(false);
    }, 500);
  };
  
  const getFieldTypeIcon = (type: FieldType) => {
    const Icon = FIELD_TYPE_CONFIG[type].icon;
    return <Icon className="w-4 h-4" />;
  };

  const getInputClassName = (hasError: boolean, isValid: boolean) => {
    if (hasError) {
      return 'border-rose-500 focus:border-rose-500 focus:ring-rose-200';
    }
    if (isValid) {
      return 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-200';
    }
    return '';
  };

  const currentTheme = COLOR_THEMES[selectedColorTheme];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigateTo('landing')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <h1 className="text-lg font-semibold">Novo Mapeamento</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stepper */}
        <div className="mb-8">
          <Stepper 
            steps={createJobSteps} 
            currentStep={currentStep}
            onStepClick={(step) => {
              if (step < currentStep) setCurrentStep(step);
            }}
          />
        </div>

        {/* Conteúdo da Etapa */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2">
            {/* ETAPA 0: Template */}
            {currentStep === 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <CardTitle>Escolha um Template</CardTitle>
                      <CardDescription>
                        Comece com campos pré-configurados para seu tipo de vaga
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <InfoBox type="tip" title="Dica">
                    Os templates economizam tempo ao pré-configurar critérios comuns para cada tipo de vaga. 
                    Escolha o que mais se aproxima do seu caso ou comece do zero.
                  </InfoBox>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(Object.keys(JOB_TEMPLATES) as JobTemplateType[]).map((templateKey) => {
                      const template = JOB_TEMPLATES[templateKey];
                      const Icon = TEMPLATE_ICONS[template.icon] || FileText;
                      const isSelected = selectedTemplate === templateKey;
                      
                      return (
                        <button
                          key={templateKey}
                          onClick={() => handleTemplateSelect(templateKey)}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                              : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isSelected ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'
                            }`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold">{template.name}</span>
                                {isSelected && <Check className="w-4 h-4 text-blue-500" />}
                              </div>
                              <p className="text-xs text-slate-500 mt-1">{template.description}</p>
                              {template.suggestedFields.length > 0 && (
                                <div className="flex items-center gap-1 mt-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {template.suggestedFields.length} campos sugeridos
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {selectedTemplate !== 'blank' && customFields.length > 0 && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 text-green-800">
                        <CheckCheck className="w-4 h-4" />
                        <span className="font-medium">Template aplicado!</span>
                      </div>
                      <p className="text-sm text-green-700 mt-1">
                        {customFields.length} critérios de análise foram pré-configurados. 
                        Você pode editá-los no próximo passo.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* ETAPA 1: Informações Básicas */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-bold">2</span>
                    </div>
                    <div>
                      <CardTitle>Informações do Mapeamento</CardTitle>
                      <CardDescription>
                        Defina um nome e descrição para identificar sua análise
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <InfoBox type="tip" title="Dica">
                    Escolha um nome que identifique o grupo de candidatos que você vai analisar. 
                    Exemplos: "Processo Seletivo Dev Frontend", "Análise de Vendedores Q1"
                  </InfoBox>

                  <div className="space-y-2">
                    <Label htmlFor="jobName">
                      Nome do Mapeamento *
                      <HelpTooltip 
                        content="Este nome será usado para identificar seu dashboard e relatórios de análise."
                        className="ml-2"
                      />
                    </Label>
                    <div className="space-y-1">
                      <Input
                        id="jobName"
                        placeholder="Ex: Análise Candidatos Frontend"
                        className={getInputClassName(!!infoErrors.jobName, !!jobInfo.jobName && !infoErrors.jobName)}
                        {...register('jobName')}
                      />
                      {infoErrors.jobName && (
                        <div className="flex items-center gap-1.5 text-xs text-rose-500">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{infoErrors.jobName.message}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jobDescription">
                      Descrição (opcional)
                      <HelpTooltip 
                        content="Uma breve descrição ajuda a identificar o objetivo deste mapeamento."
                        className="ml-2"
                      />
                    </Label>
                    <div className="space-y-1">
                      <Textarea
                        id="jobDescription"
                        placeholder="Ex: Processo seletivo para equipe de vendas do segundo semestre"
                        className={getInputClassName(!!infoErrors.jobDescription, !!jobInfo.jobDescription && !infoErrors.jobDescription)}
                        {...register('jobDescription')}
                        rows={3}
                      />
                      {infoErrors.jobDescription && (
                        <div className="flex items-center gap-1.5 text-xs text-rose-500">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{infoErrors.jobDescription.message}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label>
                      Plano
                      <HelpTooltip 
                        content="O plano determina quantos critérios de análise você pode adicionar aos seus dashboards."
                        className="ml-2"
                      />
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {(Object.keys(PLANS) as PlanType[]).map((plan) => (
                        <button
                          key={plan}
                          onClick={() => setSelectedPlan(plan)}
                          className={`p-4 rounded-lg border text-left transition-all ${
                            selectedPlan === plan
                              ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold capitalize">{PLANS[plan].name}</span>
                            <Badge variant={selectedPlan === plan ? 'default' : 'secondary'}>
                              {PLANS[plan].price}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500">
                            {PLANS[plan].maxCustomFields === Infinity 
                              ? 'Campos ilimitados' 
                              : `Até ${PLANS[plan].maxCustomFields} campos personalizados`}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ETAPA 2: Campos Personalizados */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 font-bold">3</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <CardTitle>Critérios de Análise</CardTitle>
                        <Badge variant={remainingFields === 'Ilimitado' || (typeof remainingFields === 'number' && remainingFields > 0) ? 'default' : 'destructive'}>
                          {remainingFields === 'Ilimitado' 
                            ? 'Ilimitado' 
                            : `${remainingFields} restantes`}
                        </Badge>
                      </div>
                      <CardDescription>
                        Adicione critérios específicos para enriquecer sua análise comparativa
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InfoBox type="info">
                    <strong>Critérios de análise</strong> permitem avaliar aspectos específicos dos candidatos. 
                    Adicione avaliações técnicas, níveis de idioma, certificações e outros pontos relevantes para sua decisão.
                  </InfoBox>

                  {/* Campos Básicos */}
                  <div className="space-y-2">
                    <Label className="text-sm text-slate-500">Dados Básicos (sempre incluídos)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {BASIC_FIELDS.slice(0, 6).map((field) => (
                        <div 
                          key={field.id}
                          className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg text-sm"
                        >
                          <Check className="w-3 h-3 text-green-500" />
                          <span className="text-slate-600">{field.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-4">
                    <Label className="text-sm text-slate-500 mb-2 block">Critérios Personalizados</Label>
                    
                    {customFields.length === 0 ? (
                      <div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                        <Lightbulb className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-slate-600 mb-1 font-medium">Nenhum critério adicionado</p>
                        <p className="text-sm text-slate-500 mb-3">
                          Adicione critérios para comparar candidatos
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {customFields.map((field, index) => (
                          <div 
                            key={field.id}
                            className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-300 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-slate-400 text-sm font-mono">#{index + 1}</span>
                              <div className="flex items-center gap-2">
                                {getFieldTypeIcon(field.type)}
                                <span className="font-medium text-sm">{field.name}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {FIELD_TYPE_CONFIG[field.type].label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 text-sm text-slate-500">
                                {field.visibility.table && <Table className="w-3 h-3" />}
                                {field.visibility.card && <LayoutGrid className="w-3 h-3" />}
                                {field.visibility.detail && <Eye className="w-3 h-3" />}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleRemoveField(field.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <Button
                    variant="outline"
                    className="w-full py-4 border-dashed"
                    onClick={() => setShowAddFieldDialog(true)}
                    disabled={!canAddMore}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Critério de Análise
                  </Button>
                  
                  {!canAddMore && (
                    <Alert variant="destructive">
                      <AlertCircle className="w-4 h-4" />
                      <AlertDescription>
                        Você atingiu o limite de campos do plano {PLANS[selectedPlan].name}. 
                        Faça upgrade para adicionar mais campos.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {/* ETAPA 3: Dashboard */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Palette className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <CardTitle>Personalize seu Dashboard</CardTitle>
                      <CardDescription>
                        Escolha o modelo de visualização e as cores do seu mapeamento
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Modelo de Dashboard */}
                  <div className="space-y-3">
                    <Label>Modelo de Dashboard</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(Object.keys(DASHBOARD_MODELS) as DashboardModel[]).map((model) => {
                        const config = DASHBOARD_MODELS[model];
                        const Icon = DASHBOARD_ICONS[config.icon] || LayoutDashboard;
                        const isSelected = selectedDashboardModel === model;
                        
                        return (
                          <button
                            key={model}
                            onClick={() => setSelectedDashboardModel(model)}
                            className={`p-4 rounded-lg border-2 text-left transition-all ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                isSelected ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'
                              }`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-medium">{config.name}</div>
                                <p className="text-xs text-slate-500">{config.description}</p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tema de Cores */}
                  <div className="space-y-3">
                    <Label>Tema de Cores</Label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                      {(Object.keys(COLOR_THEMES) as ColorTheme[]).map((theme) => {
                        const config = COLOR_THEMES[theme];
                        const isSelected = selectedColorTheme === theme;
                        
                        return (
                          <button
                            key={theme}
                            onClick={() => setSelectedColorTheme(theme)}
                            className={`p-3 rounded-lg border-2 text-center transition-all ${
                              isSelected
                                ? 'border-slate-800 ring-2 ring-offset-2 ring-slate-300'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div 
                              className="w-8 h-8 rounded-full mx-auto mb-2"
                              style={{ backgroundColor: config.primary }}
                            />
                            <span className="text-xs font-medium">{config.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="space-y-2">
                    <Label>Preview do Tema</Label>
                    <div 
                      className="p-4 rounded-lg border"
                      style={{ 
                        borderColor: currentTheme.primary,
                        background: `linear-gradient(135deg, ${currentTheme.primary}10, ${currentTheme.secondary}10)` 
                      }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                          style={{ backgroundColor: currentTheme.primary }}
                        >
                          <BarChart3 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold">{jobInfo.jobName || 'Seu Mapeamento'}</div>
                          <div className="text-xs text-slate-500">{DASHBOARD_MODELS[selectedDashboardModel].name}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2 rounded bg-white/80 text-center">
                          <div 
                            className="text-lg font-bold"
                            style={{ color: currentTheme.primary }}
                          >
                            12
                          </div>
                          <div className="text-xs text-slate-500">Candidatos</div>
                        </div>
                        <div className="p-2 rounded bg-white/80 text-center">
                          <div 
                            className="text-lg font-bold"
                            style={{ color: currentTheme.secondary }}
                          >
                            5
                          </div>
                          <div className="text-xs text-slate-500">Em análise</div>
                        </div>
                        <div className="p-2 rounded bg-white/80 text-center">
                          <div 
                            className="text-lg font-bold"
                            style={{ color: currentTheme.accent }}
                          >
                            3
                          </div>
                          <div className="text-xs text-slate-500">Aprovados</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ETAPA 4: Revisão */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <CardTitle>Revisão</CardTitle>
                      <CardDescription>
                        Confira as informações antes de criar seu mapeamento
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <InfoBox type="tip" title="Quase lá!">
                    Revise as informações abaixo. Depois de criar, você poderá importar seus dados e começar a visualizar insights.
                  </InfoBox>

                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-500 mb-1">Nome do Mapeamento</p>
                      <p className="text-lg font-semibold">{jobInfo.jobName || '-'}</p>
                      {jobInfo.jobDescription && (
                        <p className="text-sm text-slate-600 mt-1">{jobInfo.jobDescription}</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-500 mb-1">Template</p>
                        <div className="flex items-center gap-2">
                          {(() => {
                            const Icon = TEMPLATE_ICONS[JOB_TEMPLATES[selectedTemplate].icon] || FileText;
                            return <Icon className="w-4 h-4 text-slate-600" />;
                          })()}
                          <span className="font-medium">{JOB_TEMPLATES[selectedTemplate].name}</span>
                        </div>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-500 mb-1">Plano</p>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{PLANS[selectedPlan].name}</span>
                          <Badge variant="secondary">{PLANS[selectedPlan].price}</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-500 mb-1">Modelo Dashboard</p>
                        <div className="flex items-center gap-2">
                          {(() => {
                            const Icon = DASHBOARD_ICONS[DASHBOARD_MODELS[selectedDashboardModel].icon] || LayoutDashboard;
                            return <Icon className="w-4 h-4 text-slate-600" />;
                          })()}
                          <span className="font-medium">{DASHBOARD_MODELS[selectedDashboardModel].name}</span>
                        </div>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-500 mb-1">Tema de Cores</p>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: COLOR_THEMES[selectedColorTheme].primary }}
                          />
                          <span className="font-medium">{COLOR_THEMES[selectedColorTheme].name}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-500 mb-1">Dados Básicos</p>
                        <p className="text-2xl font-bold text-blue-600">{BASIC_FIELDS.length}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-500 mb-1">Critérios de Análise</p>
                        <p className="text-2xl font-bold text-purple-600">{customFields.length}</p>
                      </div>
                    </div>

                    {customFields.length > 0 && (
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-500 mb-2">Critérios Configurados</p>
                        <div className="flex flex-wrap gap-2">
                          {customFields.map((field) => (
                            <Badge key={field.id} variant="outline" className="py-1">
                              {getFieldTypeIcon(field.type)}
                              <span className="ml-1">{field.name}</span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navegação */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              
              {currentStep < createJobSteps.length - 1 ? (
                <Button
                  onClick={handleNext}
                >
                  Próximo
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleCreateJob}
                  disabled={!jobInfo.jobName.trim() || isCreating}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isCreating ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Criar Mapeamento
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar - Dicas */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    Dica do Passo {currentStep + 1}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {currentStep === 0 && (
                    <p className="text-sm text-slate-600">
                      Os templates economizam tempo ao pré-configurar critérios comuns para cada tipo de vaga. 
                      Escolha o que mais se aproxima do seu caso ou comece do zero.
                    </p>
                  )}
                  {currentStep === 1 && (
                    <p className="text-sm text-slate-600">
                      O nome do mapeamento será usado para identificar seu dashboard e relatórios de análise. 
                      Escolha algo que facilite encontrar depois.
                    </p>
                  )}
                  {currentStep === 2 && (
                    <p className="text-sm text-slate-600">
                      Critérios de análise permitem comparar candidatos por aspectos específicos. 
                      Adicione os critérios que são importantes para sua decisão.
                    </p>
                  )}
                  {currentStep === 3 && (
                    <p className="text-sm text-slate-600">
                      O modelo de dashboard define como seus dados serão apresentados. 
                      O tema de cores ajuda a personalizar a aparência do seu mapeamento.
                    </p>
                  )}
                  {currentStep === 4 && (
                    <p className="text-sm text-slate-600">
                      Depois de criar, você poderá importar seus dados e começar a visualizar insights e comparar candidatos!
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Resumo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Template:</span>
                    <span className="font-medium">{JOB_TEMPLATES[selectedTemplate].name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Nome:</span>
                    <span className="font-medium truncate max-w-[150px]">{jobInfo.jobName || '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Plano:</span>
                    <span className="font-medium">{PLANS[selectedPlan].name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Dashboard:</span>
                    <span className="font-medium">{DASHBOARD_MODELS[selectedDashboardModel].name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Tema:</span>
                    <span className="font-medium">{COLOR_THEMES[selectedColorTheme].name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Critérios:</span>
                    <span className="font-medium">{BASIC_FIELDS.length + customFields.length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Dialog - Adicionar Campo */}
      <Dialog open={showAddFieldDialog} onOpenChange={setShowAddFieldDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Critério de Análise</DialogTitle>
            <DialogDescription>
              Configure um novo critério para comparar seus candidatos
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmitField(onAddField)} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fieldName">Nome do Campo *</Label>
              <div className="space-y-1">
                <Input
                  id="fieldName"
                  placeholder="Ex: Anos de experiência"
                  className={getInputClassName(!!fieldErrors.fieldName, !!fieldFormValues.fieldName && !fieldErrors.fieldName)}
                  {...registerField('fieldName')}
                />
                {fieldErrors.fieldName && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-500">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{fieldErrors.fieldName.message}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Tipo do Campo</Label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(FIELD_TYPE_CONFIG) as FieldType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => registerField('fieldType').onChange({ target: { value: type } })}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      fieldFormValues.fieldType === type
                        ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {(() => {
                        const Icon = FIELD_TYPE_CONFIG[type].icon;
                        return <Icon className="w-4 h-4" />;
                      })()}
                      <span className="text-sm font-medium">{FIELD_TYPE_CONFIG[type].label}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {FIELD_TYPE_CONFIG[type].description}
                    </p>
                  </button>
                ))}
              </div>
              <InfoBox type="tip" className="mt-2">
                <strong>Exemplo:</strong> {FIELD_TYPE_CONFIG[fieldFormValues.fieldType].example}
              </InfoBox>
            </div>
            
            {fieldFormValues.fieldType === 'select' && (
              <div className="space-y-2">
                <Label htmlFor="fieldOptions">
                  Opções (separadas por vírgula)
                  <HelpTooltip 
                    content="Digite as opções que aparecerão no dropdown, separadas por vírgula."
                    className="ml-2"
                  />
                </Label>
                <Input
                  id="fieldOptions"
                  placeholder="Ex: Básico, Intermediário, Avançado, Fluente"
                  {...registerField('fieldOptions')}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Ícone</Label>
              <Select 
                value={fieldFormValues.fieldIcon} 
                onValueChange={(value) => registerField('fieldIcon').onChange({ target: { value } })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_ICONS.map((icon) => (
                    <SelectItem key={icon} value={icon}>
                      {icon}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>
                Visibilidade
                <HelpTooltip 
                  content="Escolha onde este campo será exibido: na tabela, nos cards ou na página de detalhes do candidato."
                  className="ml-2"
                />
              </Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox 
                    checked={fieldFormValues.visibility.card}
                    onCheckedChange={(checked) => 
                      registerField('visibility.card').onChange({ target: { value: checked } })
                    }
                  />
                  <span className="text-sm">Card</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox 
                    checked={fieldFormValues.visibility.table}
                    onCheckedChange={(checked) => 
                      registerField('visibility.table').onChange({ target: { value: checked } })
                    }
                  />
                  <span className="text-sm">Tabela</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox 
                    checked={fieldFormValues.visibility.detail}
                    onCheckedChange={(checked) => 
                      registerField('visibility.detail').onChange({ target: { value: checked } })
                    }
                  />
                  <span className="text-sm">Detalhe</span>
                </label>
              </div>
            </div>
            
            <DialogFooter className="pt-4">
              <Button 
                type="button"
                variant="outline" 
                onClick={() => {
                  resetField();
                  setShowAddFieldDialog(false);
                }}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={!fieldFormValues.fieldName.trim()}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog - Confirmar troca de template */}
      <Dialog open={showTemplateConfirmDialog} onOpenChange={setShowTemplateConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Trocar Template?</DialogTitle>
            <DialogDescription>
              Você já configurou {customFields.length} critérios de análise. 
              Trocar o template irá substituí-los pelos campos sugeridos do novo template.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowTemplateConfirmDialog(false)}>
              Manter Atual
            </Button>
            <Button 
              onClick={() => pendingTemplate && applyTemplate(pendingTemplate)}
              variant="default"
            >
              <Copy className="w-4 h-4 mr-2" />
              Aplicar Novo Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

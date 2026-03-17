import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Building2,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { GoogleLoginButton } from '@/components/GoogleLoginButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { PLANS, type PlanType } from '@/types';
import { registerSchema, type RegisterFormData } from '@/lib/validation';
import type { Store } from '@/hooks/useStore';

interface RegisterPageProps {
  store: Store;
}

const plans: { key: PlanType; name: string; price: string; description: string; features: string[] }[] = [
  {
    key: 'free',
    name: 'Free',
    price: 'Grátis',
    description: 'Para experimentar',
    features: ['50 candidatos', 'Campos básicos', 'Dashboard simples'],
  },
  {
    key: 'pro',
    name: 'Pro',
    price: 'R$ 49/mês',
    description: 'Mais popular',
    features: ['Candidatos ilimitados', '5 campos personalizados', 'Templates', 'Exportação'],
  },
  {
    key: 'advanced',
    name: 'Advanced',
    price: 'R$ 99/mês',
    description: 'Para equipes',
    features: ['15 campos personalizados', 'Analytics avançado', 'API access', 'Suporte prioritário'],
  },
];

export function RegisterPage({ store }: RegisterPageProps) {
  const { navigateTo, register, googleLogin } = store;
  const [step, setStep] = useState<'plan' | 'form'>('form'); // Começa direto no formulário
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('free'); // Plano free por padrão
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      companyName: '',
      termsAccepted: false,
    },
  });

  const formValues = watch();

  const onSubmit = async (data: RegisterFormData) => {
    setRegisterError(null);
    setIsLoading(true);
    
    try {
      // Chama o register do store - ele já redireciona em caso de sucesso
      await register({
        name: data.name,
        email: data.email,
        password: data.password,
        companyName: data.companyName,
        plan: selectedPlan,
      });
      // Se chegou aqui, o cadastro foi bem-sucedido e o usuário foi redirecionado
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || '';
      
      if (errorMessage.includes('já cadastrado') || errorMessage.includes('already exists') || errorMessage.includes('E-mail já cadastrado')) {
        setRegisterError('Este e-mail já está cadastrado. Clique em "Entrar" abaixo para fazer login.');
      } else {
        setRegisterError('Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getInputClassName = (fieldName: keyof RegisterFormData, hasError: boolean) => {
    const value = formValues[fieldName];
    const baseClass = 'pl-10 transition-colors';
    
    if (hasError) {
      return `${baseClass} border-rose-500 focus:border-rose-500 focus:ring-rose-200`;
    }
    if (value && !hasError && fieldName !== 'termsAccepted') {
      return `${baseClass} border-emerald-400 focus:border-emerald-500 focus:ring-emerald-200`;
    }
    return baseClass;
  };

  if (step === 'plan') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-200/30 rounded-full blur-3xl" />
        
        <div className="w-full max-w-4xl relative z-10">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img src="/logo.jpg" alt="taldash" className="h-12 w-auto object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Escolha seu plano
            </h1>
            <p className="text-slate-600">
              Comece grátis ou escolha um plano para mais recursos
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {plans.map((plan) => (
              <Card
                key={plan.key}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedPlan === plan.key
                    ? 'ring-2 ring-indigo-500 shadow-lg'
                    : 'border-slate-200'
                }`}
                onClick={() => setSelectedPlan(plan.key)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    {selectedPlan === plan.key && (
                      <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-4">{plan.price}</div>
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="flex flex-col gap-3 max-w-md mx-auto">
            <Button
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 h-12"
              onClick={() => setStep('form')}
            >
              Continuar com {PLANS[selectedPlan].name}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            <button
              onClick={() => navigateTo('login')}
              className="text-center text-sm text-slate-500 hover:text-slate-700"
            >
              Já tem uma conta? Entrar
            </button>
            
            <button
              onClick={() => navigateTo('landing')}
              className="text-center text-sm text-slate-500 hover:text-slate-700"
            >
              ← Voltar para a página inicial
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-200/30 rounded-full blur-3xl" />
      
      <div className="w-full max-w-md relative z-10">
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold">Criar conta</CardTitle>
              <Badge className="bg-indigo-100 text-indigo-700">
                <Sparkles className="w-3 h-3 mr-1" />
                {PLANS[selectedPlan].name}
              </Badge>
            </div>
            <CardDescription>
              Preencha seus dados para começar
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {registerError && (
              <Alert variant="destructive" className="bg-rose-50 border-rose-200">
                <AlertCircle className="h-4 w-4 text-rose-500" />
                <AlertDescription className="text-rose-700">
                  {registerError}
                </AlertDescription>
              </Alert>
            )}
            
            {/* Google Login - Primeiro */}
            <GoogleLoginButton
              onSuccess={async (accessToken, userInfo) => {
                try {
                  // Tentar login com Google
                  await googleLogin(accessToken, userInfo);
                  // Se sucesso, o usuário é redirecionado automaticamente
                } catch (error: any) {
                  const errorMessage = error?.message || '';
                  if (errorMessage.includes('já cadastrado') || errorMessage.includes('already exists') || errorMessage.includes('existe')) {
                    setRegisterError('Esta conta Google já está cadastrada. Clique em "Entrar" abaixo para fazer login.');
                  } else {
                    setRegisterError('Erro ao fazer login com Google: ' + errorMessage);
                  }
                }
              }}
              onError={(error) => {
                setRegisterError('Erro ao fazer login com Google: ' + error.message);
              }}
            />
            
            <div className="relative my-4">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-slate-400">
                ou
              </span>
            </div>
            
            {/* Formulário de cadastro */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Nome completo *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Seu nome"
                    className={getInputClassName('name', !!errors.name)}
                    {...registerField('name')}
                  />
                </div>
                {errors.name && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-500">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{errors.name.message}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">E-mail *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    className={getInputClassName('email', !!errors.email)}
                    {...registerField('email')}
                  />
                </div>
                {errors.email && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-500">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{errors.email.message}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Senha *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`${getInputClassName('password', !!errors.password)} pr-10`}
                    {...registerField('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-500">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{errors.password.message}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Empresa (opcional)</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Nome da sua empresa"
                    className={getInputClassName('companyName', !!errors.companyName)}
                    {...registerField('companyName')}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="terms"
                    checked={formValues.termsAccepted}
                    onCheckedChange={(checked) => setValue('termsAccepted', checked as boolean)}
                    className={`mt-0.5 ${errors.termsAccepted ? 'border-rose-500 data-[state=checked]:bg-rose-500' : ''}`}
                  />
                  <label htmlFor="terms" className="text-sm text-slate-600 cursor-pointer">
                    Concordo com os{' '}
                    <button type="button" className="text-indigo-600 hover:underline">Termos de Serviço</button>
                    {' '}e{' '}
                    <button type="button" className="text-indigo-600 hover:underline">Política de Privacidade</button>
                    {' '}*
                  </label>
                </div>
                {errors.termsAccepted && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-500">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{errors.termsAccepted.message}</span>
                  </div>
                )}
              </div>
              
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 h-11"
                disabled={isLoading || isSubmitting}
              >
                {isLoading || isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Criar conta
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
            
            <Separator className="my-4" />
            
            <button
              onClick={() => setStep('plan')}
              className="w-full text-center text-sm text-slate-500 hover:text-slate-700"
            >
              ← Voltar para escolha do plano
            </button>
            
            <p className="text-center text-sm text-slate-600">
              Já tem uma conta?{' '}
              <button
                onClick={() => navigateTo('login')}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Entrar
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

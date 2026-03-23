import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { GoogleLoginButton } from '@/components/GoogleLoginButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { loginSchema, type LoginFormData } from '@/lib/validation';
import type { Store } from '@/hooks/useStore';

interface LoginPageProps {
  store: Store;
}

export function LoginPage({ store }: LoginPageProps) {
  const { navigateTo, login, googleLogin } = store;
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  // Se já está autenticado, redireciona pro dashboard
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate('/dashboard', { replace: true });
    }
  }, [isLoaded, isSignedIn, navigate]);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const emailValue = watch('email');
  const passwordValue = watch('password');

  const onSubmit = async (data: LoginFormData) => {
    setLoginError(null);
    setIsLoading(true);
    
    try {
      await login(data.email, data.password);
    } catch (error) {
      setLoginError('E-mail ou senha incorretos. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      await login('demo@talentdash.com', 'demo123');
    } catch (error) {
      setLoginError('Erro ao fazer login com conta demo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-200/30 rounded-full blur-3xl" />
      
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left side - Branding */}
        <div className="hidden lg:block space-y-8">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="taldash" className="h-12 w-auto object-contain" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-slate-900 leading-tight">
              Bem-vindo de volta!
            </h1>
            <p className="text-lg text-slate-600">
              Acesse seus mapeamentos, visualize candidatos e tome decisões baseadas em dados.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-slate-700">Dashboards editáveis e personalizáveis</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-slate-700">Importação em segundos via Excel/CSV</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-slate-700">Templates prontos para diferentes vagas</span>
            </div>
          </div>
        </div>
        
        {/* Right side - Login Form */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold">Entrar</CardTitle>
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                Grátis para começar
              </Badge>
            </div>
            <CardDescription>
              Entre com sua conta para acessar seus mapeamentos
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {loginError && (
              <Alert variant="destructive" className="bg-rose-50 border-rose-200">
                <AlertCircle className="h-4 w-4 text-rose-500" />
                <AlertDescription className="text-rose-700">
                  {loginError}
                </AlertDescription>
              </Alert>
            )}
            
            {/* Google Login - usa OAuth do Clerk */}
            <GoogleLoginButton
              onError={(error) => {
                setLoginError('Erro ao fazer login com Google: ' + error.message);
              }}
            />
            
            <div className="relative my-4">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-slate-400">
                ou
              </span>
            </div>
            
            {/* Email/Password Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    className={`pl-10 transition-colors ${
                      errors.email 
                        ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-200' 
                        : emailValue && !errors.email
                        ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-200'
                        : ''
                    }`}
                    {...register('email')}
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
                <label className="text-sm font-medium text-slate-700">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`pl-10 pr-10 transition-colors ${
                      errors.password 
                        ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-200' 
                        : passwordValue && !errors.password
                        ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-200'
                        : ''
                    }`}
                    {...register('password')}
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
              
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    {...register('rememberMe')}
                  />
                  Lembrar-me
                </label>
                <button type="button" className="text-sm text-indigo-600 hover:text-indigo-700">
                  Esqueceu a senha?
                </button>
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
                    Entrar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
            
            <Button
              variant="outline"
              className="w-full h-11 mt-3"
              onClick={handleDemoLogin}
              disabled={isLoading || isSubmitting}
            >
              Entrar com conta demo
            </Button>
            
            <p className="text-center text-sm text-slate-600">
              Ainda não tem conta?{' '}
              <button
                onClick={() => navigateTo('register')}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Criar conta grátis
              </button>
            </p>
            
            <button
              onClick={() => navigateTo('landing')}
              className="w-full text-center text-sm text-slate-500 hover:text-slate-700"
            >
              ← Voltar para a página inicial
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

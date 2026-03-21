import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

/**
 * Página de callback do OAuth (Google, etc.)
 * Aguarda a sessão ser processada pelo Supabase e redireciona pro dashboard.
 * O useStore.initAuth detecta a sessão automaticamente ao montar o App.
 */
export function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    let redirected = false;

    const tryRedirect = async () => {
      if (redirected) return;

      // Tenta até 10x com intervalo de 500ms
      for (let i = 0; i < 10; i++) {
        await new Promise(r => setTimeout(r, 500));
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          redirected = true;
          navigate('/dashboard', { replace: true });
          return;
        }
      }

      // Não encontrou sessão após 5s — vai pro login
      if (!redirected) {
        navigate('/login', { replace: true });
      }
    };

    // Escuta mudança de estado imediatamente
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user && !redirected) {
        redirected = true;
        subscription.unsubscribe();
        navigate('/dashboard', { replace: true });
      }
    });

    tryRedirect();

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600">Finalizando login...</p>
      </div>
    </div>
  );
}

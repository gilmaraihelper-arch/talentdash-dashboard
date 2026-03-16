import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Chrome } from 'lucide-react';

// Configuração do Google OAuth
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

interface GoogleLoginButtonProps {
  onSuccess: (token: string, user: any) => void;
  onError?: (error: Error) => void;
}

export function GoogleLoginButton({ onSuccess, onError }: GoogleLoginButtonProps) {
  useEffect(() => {
    // Carregar script do Google
    if (!document.getElementById('google-script')) {
      const script = document.createElement('script');
      script.id = 'google-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleGoogleLogin = () => {
    if (!GOOGLE_CLIENT_ID) {
      console.error('Google Client ID não configurado');
      return;
    }

    // Inicializar Google OAuth
    if (window.google) {
      window.google.accounts.oauth2
        .initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'email profile',
          callback: (response: any) => {
            if (response.error) {
              onError?.(new Error(response.error));
              return;
            }
            
            // Decodificar token JWT básico
            const token = response.access_token;
            fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${token}` }
            })
              .then(res => res.json())
              .then(userInfo => {
                onSuccess(token, userInfo);
              })
              .catch(err => onError?.(err));
          },
        })
        .requestAccessToken();
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border-gray-300"
      onClick={handleGoogleLogin}
    >
      <Chrome className="w-5 h-5 text-blue-500" />
      Entrar com Google
    </Button>
  );
}

// TypeScript declaration for Google
declare global {
  interface Window {
    google: any;
  }
}

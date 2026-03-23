import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react';

/**
 * AuthCallbackPage — processa tokens OAuth recebidos do provedor (Google, etc.)
 * O Clerk redireciona aqui após o fluxo OAuth externo com os tokens na URL.
 * O <AuthenticateWithRedirectCallback /> os lê, cria a sessão e redireciona.
 */
export function AuthCallbackPage() {
  return (
    <AuthenticateWithRedirectCallback
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
    />
  );
}

/**
 * SsoCallbackPage — alias para AuthCallbackPage.
 * Usado quando o GoogleLoginButton redireciona para /sso-callback.
 * O <AuthenticateWithRedirectCallback /> processa os tokens e manda pro /dashboard.
 */
export function SsoCallbackPage() {
  return (
    <AuthenticateWithRedirectCallback
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
    />
  );
}

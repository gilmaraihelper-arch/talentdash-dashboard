import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react';

/**
 * Página de callback do OAuth via Clerk.
 * O componente AuthenticateWithRedirectCallback processa o token do Google
 * e redireciona para /dashboard após sucesso.
 */
export function AuthCallbackPage() {
  return (
    <AuthenticateWithRedirectCallback
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
    />
  );
}

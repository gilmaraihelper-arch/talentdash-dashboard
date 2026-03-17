// src/services/google-auth.service.ts
import { prisma } from '../prisma.js';
import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import { z } from 'zod';

// Schema para validar os dados do Google
const googleUserSchema = z.object({
  googleAccessToken: z.string().min(1, 'Token de acesso é obrigatório'),
});

// Interface para o usuário do Google
interface GoogleUserInfo {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

/**
 * Valida o token de acesso do Google e retorna informações do usuário
 */
async function verifyGoogleToken(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Token do Google inválido ou expirado');
  }

  const userInfo = await response.json() as GoogleUserInfo;
  
  return userInfo;
}

/**
 * Login ou registro com Google OAuth
 * Fluxo:
 * 1. Recebe o access token do frontend
 * 2. Valida o token com o Google
 * 3. Busca ou cria usuário no banco
 * 4. Gera JWT do TalentDash
 */
export async function googleLogin(googleAccessToken: string) {
  // Validar input
  const parsed = googleUserSchema.safeParse({ googleAccessToken });
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    throw new Error(firstError?.message || 'Erro de validação');
  }

  // Verificar token com o Google
  const googleUser = await verifyGoogleToken(googleAccessToken);

  // Buscar usuário existente pelo email do Google
  let user = await prisma.user.findUnique({
    where: { email: googleUser.email },
  });

  // Se não existe, criar novo usuário
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: googleUser.email,
        name: googleUser.name,
        password: '', // Usuários OAuth não têm senha
        plan: 'PRO', // Usuários Google começam com PRO
      },
    });
  }

  // Gerar JWT do TalentDash
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'] }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
    },
  };
}

export default {
  googleLogin,
};

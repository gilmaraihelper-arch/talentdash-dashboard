import { prisma } from '../prisma.js';
import { CreateUserInput, LoginInput, SafeUser } from '../types/index.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { ApiError } from '../middleware/errorHandler.js';

interface AuthResult {
  user: SafeUser;
  token: string;
}

// Registrar novo usuário
export async function registerUser(input: CreateUserInput): Promise<AuthResult> {
  // Verificar se o email já existe
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw new ApiError('Email já cadastrado', 409);
  }

  // Hash da senha
  const hashedPassword = await hashPassword(input.password);

  // Criar usuário
  const user = await prisma.user.create({
    data: {
      email: input.email,
      password: hashedPassword,
      name: input.name,
      companyName: input.companyName,
    },
    select: {
      id: true,
      email: true,
      name: true,
      companyName: true,
      plan: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Gerar token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    plan: user.plan,
  });

  return { user: user as SafeUser, token };
}

// Login de usuário
export async function loginUser(input: LoginInput): Promise<AuthResult> {
  // Buscar usuário
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new ApiError('Email ou senha inválidos', 401);
  }

  // Verificar senha
  const isPasswordValid = await comparePassword(input.password, user.password);

  if (!isPasswordValid) {
    throw new ApiError('Email ou senha inválidos', 401);
  }

  // Gerar token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    plan: user.plan,
  });

  const { password: _, ...safeUser } = user;

  return { user: safeUser as SafeUser, token };
}

// Buscar usuário por ID
export async function getUserById(userId: string): Promise<SafeUser> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      companyName: true,
      plan: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new ApiError('Usuário não encontrado', 404);
  }

  return user as SafeUser;
}
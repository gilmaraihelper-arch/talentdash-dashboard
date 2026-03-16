import { prisma } from '../prisma.js';
import { CreatePaymentMethodInput } from '../types/index.js';
import { PaymentMethod } from '@prisma/client';
import { ApiError } from '../middleware/errorHandler.js';

// Criar método de pagamento
export async function createPaymentMethod(
  userId: string,
  input: CreatePaymentMethodInput
): Promise<PaymentMethod> {
  // Se for o método padrão, remover o padrão dos outros
  if (input.isDefault) {
    await prisma.paymentMethod.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }

  return prisma.paymentMethod.create({
    data: {
      userId,
      type: input.type,
      last4: input.last4,
      brand: input.brand,
      expMonth: input.expMonth,
      expYear: input.expYear,
      holderName: input.holderName,
      pixKey: input.pixKey,
      externalId: input.externalId,
      isDefault: input.isDefault,
    },
  });
}

// Listar métodos de pagamento do usuário
export async function listUserPaymentMethods(
  userId: string
): Promise<PaymentMethod[]> {
  return prisma.paymentMethod.findMany({
    where: { userId },
    orderBy: [
      { isDefault: 'desc' },
      { createdAt: 'desc' },
    ],
  });
}

// Buscar método de pagamento por ID
export async function getPaymentMethodById(
  paymentMethodId: string,
  userId: string
): Promise<PaymentMethod> {
  const paymentMethod = await prisma.paymentMethod.findFirst({
    where: {
      id: paymentMethodId,
      userId,
    },
  });

  if (!paymentMethod) {
    throw new ApiError('Método de pagamento não encontrado', 404);
  }

  return paymentMethod;
}

// Atualizar método de pagamento
export async function updatePaymentMethod(
  paymentMethodId: string,
  userId: string,
  input: Partial<CreatePaymentMethodInput>
): Promise<PaymentMethod> {
  // Verificar se o método existe
  const existingMethod = await prisma.paymentMethod.findFirst({
    where: {
      id: paymentMethodId,
      userId,
    },
  });

  if (!existingMethod) {
    throw new ApiError('Método de pagamento não encontrado', 404);
  }

  // Se for definido como padrão, remover o padrão dos outros
  if (input.isDefault) {
    await prisma.paymentMethod.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }

  return prisma.paymentMethod.update({
    where: { id: paymentMethodId },
    data: {
      type: input.type,
      last4: input.last4,
      brand: input.brand,
      expMonth: input.expMonth,
      expYear: input.expYear,
      holderName: input.holderName,
      pixKey: input.pixKey,
      externalId: input.externalId,
      isDefault: input.isDefault,
    },
  });
}

// Deletar método de pagamento
export async function deletePaymentMethod(
  paymentMethodId: string,
  userId: string
): Promise<void> {
  // Verificar se o método existe
  const existingMethod = await prisma.paymentMethod.findFirst({
    where: {
      id: paymentMethodId,
      userId,
    },
  });

  if (!existingMethod) {
    throw new ApiError('Método de pagamento não encontrado', 404);
  }

  await prisma.paymentMethod.delete({
    where: { id: paymentMethodId },
  });
}

// Definir método padrão
export async function setDefaultPaymentMethod(
  paymentMethodId: string,
  userId: string
): Promise<PaymentMethod> {
  // Verificar se o método existe
  const existingMethod = await prisma.paymentMethod.findFirst({
    where: {
      id: paymentMethodId,
      userId,
    },
  });

  if (!existingMethod) {
    throw new ApiError('Método de pagamento não encontrado', 404);
  }

  // Remover padrão de todos os métodos
  await prisma.paymentMethod.updateMany({
    where: { userId },
    data: { isDefault: false },
  });

  // Definir novo padrão
  return prisma.paymentMethod.update({
    where: { id: paymentMethodId },
    data: { isDefault: true },
  });
}
import { Router } from 'express';
import { paymentController } from '../controllers/index.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import { createPaymentMethodSchema } from '../utils/validation.js';
import { z } from 'zod';

const router = Router();

const idSchema = z.object({
  id: z.string().uuid(),
});

// Todas as rotas de pagamento requerem autenticação
router.use(authenticate);

// GET /api/payments - Listar métodos de pagamento
router.get('/', paymentController.list);

// POST /api/payments - Criar método de pagamento
router.post('/', validateBody(createPaymentMethodSchema), paymentController.create);

// GET /api/payments/:id - Buscar método de pagamento
router.get('/:id', validateParams(idSchema), paymentController.getById);

// PUT /api/payments/:id - Atualizar método de pagamento
router.put('/:id', validateParams(idSchema), validateBody(createPaymentMethodSchema.partial()), paymentController.update);

// DELETE /api/payments/:id - Deletar método de pagamento
router.delete('/:id', validateParams(idSchema), paymentController.remove);

// POST /api/payments/:id/default - Definir como padrão
router.post('/:id/default', validateParams(idSchema), paymentController.setDefault);

export default router;
import { Router } from 'express';
import { jobController } from '../controllers/index.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import { createJobSchema, updateJobSchema } from '../utils/validation.js';
import { z } from 'zod';

const router = Router();

const idSchema = z.object({
  id: z.string().uuid(),
});

// Todas as rotas de jobs requerem autenticação
router.use(authenticate);

// GET /api/jobs - Listar jobs do usuário
router.get('/', jobController.list);

// POST /api/jobs - Criar novo job
router.post('/', validateBody(createJobSchema), jobController.create);

// GET /api/jobs/:id - Buscar job por ID
router.get('/:id', validateParams(idSchema), jobController.getById);

// PUT /api/jobs/:id - Atualizar job
router.put('/:id', validateParams(idSchema), validateBody(updateJobSchema), jobController.update);

// DELETE /api/jobs/:id - Deletar job
router.delete('/:id', validateParams(idSchema), jobController.remove);

export default router;
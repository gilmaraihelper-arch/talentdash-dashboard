import { Router } from 'express';
import { candidateController } from '../controllers/index.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.js';
import { 
  createCandidateSchema, 
  updateCandidateStatusSchema,
  paginationSchema,
  candidateFiltersSchema 
} from '../utils/validation.js';
import { z } from 'zod';

const router = Router();

const idSchema = z.object({
  id: z.string().uuid(),
});

const jobIdSchema = z.object({
  jobId: z.string().uuid(),
});

// POST /api/candidates/:jobId - Criar candidato (público, mas autenticação opcional)
router.post(
  '/:jobId',
  optionalAuthenticate,
  validateParams(jobIdSchema),
  validateBody(createCandidateSchema),
  candidateController.create
);

// Rotas abaixo requerem autenticação
router.use(authenticate);

// GET /api/candidates/job/:jobId - Listar candidatos de um job
router.get(
  '/job/:jobId',
  validateParams(jobIdSchema),
  validateQuery(paginationSchema.merge(candidateFiltersSchema)),
  candidateController.list
);

// GET /api/candidates/:id - Buscar candidato por ID
router.get('/:id', validateParams(idSchema), candidateController.getById);

// PUT /api/candidates/:id - Atualizar candidato
router.put('/:id', validateParams(idSchema), candidateController.update);

// PATCH /api/candidates/:id/status - Atualizar status do candidato
router.patch(
  '/:id/status',
  validateParams(idSchema),
  validateBody(updateCandidateStatusSchema),
  candidateController.updateStatus
);

// DELETE /api/candidates/:id - Deletar candidato
router.delete('/:id', validateParams(idSchema), candidateController.remove);

// POST /api/candidates/:id/analysis - Adicionar análise IA
router.post('/:id/analysis', validateParams(idSchema), candidateController.addAnalysis);

export default router;
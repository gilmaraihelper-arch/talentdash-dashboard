import { Router } from 'express';
import authRoutes from './auth.routes.js';
import jobRoutes from './job.routes.js';
import candidateRoutes from './candidate.routes.js';
import paymentRoutes from './payment.routes.js';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rotas da API
router.use('/auth', authRoutes);
router.use('/jobs', jobRoutes);
router.use('/candidates', candidateRoutes);
router.use('/payments', paymentRoutes);

export default router;
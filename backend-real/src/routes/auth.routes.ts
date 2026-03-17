import { Router } from 'express';
import { authController } from '../controllers/index.js';
import googleAuthController from '../controllers/google-auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../utils/validation.js';

const router = Router();

// POST /api/auth/register - Registrar novo usuário
router.post('/register', validateBody(registerSchema), authController.register);

// POST /api/auth/login - Login de usuário
router.post('/login', validateBody(loginSchema), authController.login);

// POST /api/auth/google - Login com Google OAuth
router.post('/google', googleAuthController.googleAuth);

// GET /api/auth/me - Perfil do usuário logado
router.get('/me', authenticate, authController.me);

export default router;
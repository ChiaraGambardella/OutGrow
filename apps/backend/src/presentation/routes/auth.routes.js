import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { AuthService } from '../../application/auth.service.js';
import { UtenteRepository } from '../../infrastructure/repositories/utente.repository.js';
import { CryptoService } from '../../infrastructure/security/crypto.service.js';
import { validateBody } from '../middlewares/validation.middleware.js';
import { RegisterSchema, LoginSchema, UpdateEmailSchema, UpdatePasswordSchema, ForgotPasswordSchema } from '../../../../../packages/shared/src/schemas.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

// Iniezione delle Dipendenze (Dependency Injection manuale per preservare la Clean Arch)
const utenteRepository = new UtenteRepository();
const cryptoService = new CryptoService();
const authService = new AuthService({ utenteRepository, cryptoService });
const authController = new AuthController({ authService });

// Definizione della rotta di registrazione con validazione Zod inclusa
router.post('/register', validateBody(RegisterSchema), authController.register);

// rotta di login con validazione Zod inclusa
router.post('/login', validateBody(LoginSchema), authController.login);

router.post(
  '/forgot-password',
  validateBody(ForgotPasswordSchema),
  authController.forgotPassword
);

// Rotta per la modifica dell'email (Protetta da token JWT)
router.put(
  '/update-email',
  requireAuth,
  validateBody(UpdateEmailSchema),
  authController.updateEmail
);

// Rotta per la modifica della password (Protetta da token JWT)
router.put(
  '/update-password',
  requireAuth,
  validateBody(UpdatePasswordSchema),
  authController.updatePassword
);

export default router;
import { Router } from 'express';
import { PreferenzaController } from '../controllers/preferenza.controller.js';
import { PreferenzaService } from '../../application/preferenza.service.js';
import { PreferenzaRepository } from '../../infrastructure/repositories/preferenza.repository.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validation.middleware.js';
import { UpdatePreferencesSchema } from '../../../../../packages/shared/src/schemas.js';

const router = Router();

// Dependency Injection manuale coerente con il progetto
const preferenzaRepository = new PreferenzaRepository();
const preferenzaService = new PreferenzaService({ preferenzaRepository });
const preferenzaController = new PreferenzaController({ preferenzaService });

// Entrambe le rotte richiedono l'autenticazione dell'utente
router.get('/', requireAuth, preferenzaController.getPreferences);
router.put('/', requireAuth, validateBody(UpdatePreferencesSchema), preferenzaController.updatePreferences);

export default router;
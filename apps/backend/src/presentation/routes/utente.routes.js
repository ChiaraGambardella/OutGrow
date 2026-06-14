import { Router } from 'express';
import { UtenteController } from '../controllers/utente.controller.js';
import { UtenteService } from '../../application/utente.service.js';
import { UtenteRepository } from '../../infrastructure/repositories/utente.repository.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { ConsensoRepository } from '../../infrastructure/repositories/consenso.repository.js';
import { uploadProfileMedia } from '../middlewares/upload.middleware.js';
import { validateBody } from '../middlewares/validation.middleware.js';
import { UpdateProfileMediaSchema } from '../../../../../packages/shared/src/schemas.js';

const router = Router();

const utenteRepository = new UtenteRepository();
const consensoRepository = new ConsensoRepository();

const utenteService = new UtenteService({
  utenteRepository,
  consensoRepository,
});

const utenteController = new UtenteController({ utenteService });

router.get('/me', requireAuth, utenteController.getMyProfile);

router.get('/:username', requireAuth, utenteController.getProfiloByUsername);

router.put(
  '/profile-media',
  requireAuth,
  uploadProfileMedia,
  validateBody(UpdateProfileMediaSchema),
  utenteController.updateProfileMedia
);

export default router;
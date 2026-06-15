import { Router } from 'express';
import { SfidaCompletataController } from '../controllers/sfida.completata.controller.js';
import { SfidaCompletataService } from '../../application/sfida.completata.service.js';
import { SfidaCompletataRepository } from '../../infrastructure/repositories/sfida.completata.repository.js';
import { MediaRepository } from '../../infrastructure/repositories/media.repository.js';
import { ConsensoRepository } from '../../infrastructure/repositories/consenso.repository.js';
import { SfidaRepository } from '../../infrastructure/repositories/sfida.repository.js';
import { LikeSfidaCompletataRepository } from '../../infrastructure/repositories/like.sfida.completata.repository.js';
import { BadgeOttenutoRepository } from '../../infrastructure/repositories/badge.ottenuto.repository.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { uploadMedia, validateMediaSize } from '../middlewares/upload.middleware.js'; // La tua istanza Multer reale
import { validateBody } from '../middlewares/validation.middleware.js'; // Il tuo middleware di validazione
import { CompleteChallengeSchema } from '../../../../../packages/shared/src/schemas.js';

const router = Router();

const sfidaCompletataRepository = new SfidaCompletataRepository();
const mediaRepository = new MediaRepository();
const consensoRepository = new ConsensoRepository();
const sfidaRepository = new SfidaRepository();
const likeSfidaCompletataRepository = new LikeSfidaCompletataRepository();
const badgeOttenutoRepository = new BadgeOttenutoRepository();

const sfidaCompletataService = new SfidaCompletataService({
  sfidaCompletataRepository,
  mediaRepository,
  consensoRepository,
  sfidaRepository,
  likeSfidaCompletataRepository,
  badgeOttenutoRepository
});

const sfidaCompletataController = new SfidaCompletataController({ sfidaCompletataService });

// POST /api/sfide-completate/:sfidaId
// uploadMedia estrae il file e popola req.body prima che intervenga la validazione di Zod
router.post(
  '/:sfidaId',
  requireAuth,
  uploadMedia, 
  validateMediaSize,
  validateBody(CompleteChallengeSchema),
  sfidaCompletataController.addSfidaCompletata
);

router.post('/:sfidaCompletataId/like', requireAuth, sfidaCompletataController.toggleLike);

export { sfidaCompletataService };

export default router;
import { Router } from 'express';
import { FeedController } from '../controllers/feed.controller.js';
import { FeedService } from '../../application/feed.service.js';
import { SfidaCompletataRepository } from '../../infrastructure/repositories/sfida.completata.repository.js';
import { MediaRepository } from '../../infrastructure/repositories/media.repository.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { UtenteRepository } from '../../infrastructure/repositories/utente.repository.js';
import { commentoService } from './commento.routes.js';
import { sfidaCompletataService } from './sfida.completata.routes.js';

const router = Router();

const sfidaCompletataRepository = new SfidaCompletataRepository();
const mediaRepository = new MediaRepository();
const utenteRepository = new UtenteRepository();

// Passiamo tutti e tre i repository al servizio
const feedService = new FeedService({ 
  sfidaCompletataRepository, 
  commentoService,
  mediaRepository,
  utenteRepository,
});

const feedController = new FeedController({ feedService, sfidaCompletataService });

router.get('/', requireAuth, feedController.getGlobalFeed);
router.post('/:postId/like', requireAuth, feedController.toggleLike);
router.get('/utente/:username', requireAuth, feedController.getUserFeed);

export default router;
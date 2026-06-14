import { Router } from 'express';
import { CommentoController } from '../controllers/commento.controller.js';
import { CommentoService } from '../../application/commento.service.js';
import { CommentoRepository } from '../../infrastructure/repositories/commento.repository.js';
import { SfidaCompletataRepository } from '../../infrastructure/repositories/sfida.completata.repository.js';
import { LikeCommentoRepository } from '../../infrastructure/repositories/like.commento.repository.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validateBody as validate } from '../middlewares/validation.middleware.js';
import { CommentSchema } from '../../../../../packages/shared/src/schemas.js';

const router = Router();

const commentoRepository = new CommentoRepository();
const sfidaCompletataRepository = new SfidaCompletataRepository();
const likeCommentoRepository = new LikeCommentoRepository();

const commentoService = new CommentoService({
  commentoRepository,
  sfidaCompletataRepository,
  likeCommentoRepository
});

const commentoController = new CommentoController({ commentoService });

// POST /api/comments/posts/:postId -> Per commentare un post (Feed o Profilo)
router.post('/posts/:postId', requireAuth, validate(CommentSchema), commentoController.addComment);

// POST /api/comments/:commentoPadreId/replies -> Per rispondere a un commento esistente
router.post('/:commentoPadreId/replies', requireAuth, validate(CommentSchema), commentoController.addReply);

// POST /api/comments/:commentoId/like -> Per mettere/togliere il mi piace a un commento o risposta
router.post('/:commentoId/like', requireAuth, commentoController.toggleLike);

export { commentoService };
export default router;
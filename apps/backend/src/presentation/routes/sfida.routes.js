import { Router } from 'express';
import { getWeeklyChallenge } from '../controllers/sfida.controller.js';
import { optionalAuth } from '../middlewares/auth.middleware.js';

const router = Router();

// Endpoint pubblico: calcola la sfida corrente e adatta il flag "completata" se viene fornito un JWT valido
router.get('/settimanale', optionalAuth, getWeeklyChallenge);

export default router;
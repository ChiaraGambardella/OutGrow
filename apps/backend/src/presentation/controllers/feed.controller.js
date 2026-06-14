import { FeedPostResponseDto, LikeToggleResponseDto  } from '../dtos/feed.dto.js';

export class FeedController {
  constructor({ feedService, sfidaCompletataService }) {
    this.feedService = feedService;
    this.sfidaCompletataService = sfidaCompletataService;
  }

  /**
   * Endpoint GET per ottenere i post del feed globale paginato
   */
  getGlobalFeed = async (req, res, next) => {
    try {
      const utenteLoggatoId = req.userId; // Popolato dal middleware requireAuth

      // Paginazione da query string con valori di fallback (10 elementi alla volta)
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;

      // Chiamata alla logica di business
      const rawFeedData = await this.feedService.getGlobalFeed(utenteLoggatoId, { limit, offset });
      
      // Formattazione finale tramite DTO
      const formattedFeed = FeedPostResponseDto.formatCollection(rawFeedData);

      return res.status(200).json({
        status: 'success',
        message: 'Feed globale recuperato con successo.',
        results: formattedFeed.length,
        data: formattedFeed
      });
    } catch (error) {
      next(error); // Passa l'errore al middleware globale error.middleware.js
    }
  };

  toggleLike = async (req, res, next) => {
    try {
      const utenteLoggatoId = req.userId; // Preso in automatico da requireAuth
      const postId = parseInt(req.params.postId, 10);

      // Validazione rapida del parametro URL
      if (isNaN(postId)) {
        const error = new Error("Identificativo del post non valido.");
        error.statusCode = 400;
        error.type = 'ValidationError';
        throw error;
      }

      // Riceve { liked: true } o { liked: false } dal servizio
      const risultato = await this.sfidaCompletataService.toggleLike(utenteLoggatoId, postId);

      // Passiamo direttamente l'id e il booleano (.liked) al DTO
      const result = LikeToggleResponseDto.format(postId, risultato.liked);

      const message = action === 'added' 
        ? 'Mi piace aggiunto con successo.' 
        : 'Mi piace rimosso con successo.';

      return res.status(200).json({
        status: 'success',
        message,
        data: result
      });
    } catch (error) {
      next(error); // Passaggio al gestore globale degli errori
    }
  };

  /**
   * Endpoint GET per ottenere i post del feed di uno specifico utente tramite username
   * Es: GET /api/feed/utente/mario_rossi?limit=10&offset=0
   */
  getUserFeed = async (req, res, next) => {
    try {
      const utenteLoggatoId = req.userId; // Popolato dal middleware requireAuth
      const { username } = req.params;

      // Paginazione da query string con valori di fallback
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;

      // Chiamata alla logica di business nel servizio applicativo
      const rawFeedData = await this.feedService.getUserFeed(utenteLoggatoId, username, { limit, offset });
      
      // Formattazione coerente tramite lo stesso DTO globale
      const formattedFeed = FeedPostResponseDto.formatCollection(rawFeedData);

      return res.status(200).json({
        status: 'success',
        message: `Feed dell'utente @${username} recuperato con successo.`,
        results: formattedFeed.length,
        data: formattedFeed
      });
    } catch (error) {
      // Intercettiamo il 404 se lo username non esiste nel sistema
      if (error.type === 'NotFoundError') {
        return res.status(404).json({
          status: 'error',
          type: 'NotFoundError',
          message: error.message
        });
      }
      next(error); // Errori imprevisti al middleware globale
    }
  };
}
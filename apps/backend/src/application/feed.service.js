export class FeedService {
  constructor({ sfidaCompletataRepository, commentoService, mediaRepository, utenteRepository }) {
    this.sfidaCompletataRepository = sfidaCompletataRepository;
    this.commentoService = commentoService;
    this.mediaRepository = mediaRepository;
    this.utenteRepository = utenteRepository;
  }

  async getGlobalFeed(utenteLoggatoId, { limit = 10, offset = 0 }) {
    const posts = await this.sfidaCompletataRepository.getGlobalFeed(utenteLoggatoId, limit, offset);
    return this._arricchisciPostInParallelo(posts, utenteLoggatoId);
  }

  /**
   * Recupera la timeline dei post di uno specifico utente (tramite username)
   */
  async getUserFeed(utenteLoggatoId, username, { limit = 10, offset = 0 }) {
    // 1. Risolviamo lo username per ottenere l'ID dell'utente target
    const utenteTarget = await this.utenteRepository.findByUsername(username);
    if (!utenteTarget) {
      const error = new Error(`L'utente con username @${username} non è stato trovato.`);
      error.statusCode = 404;
      error.type = 'NotFoundError';
      throw error;
    }

    // 2. Recuperiamo i post di quell'utente usando il metodo già pronto nella vostra UtenteRepository
    const posts = await this.utenteRepository.findPostsByUtenteId(utenteTarget.id, utenteLoggatoId, limit, offset);

    // 3. Sfruttiamo la stessa logica di arricchimento ad albero
    return this._arricchisciPostInParallelo(posts, utenteLoggatoId);
  }

  /**
   * Helper privato per evitare duplicazione di codice nell'arricchimento di commenti e media
   */
  async _arricchisciPostInParallelo(posts, utenteLoggatoId) {
    return await Promise.all(
      posts.map(async (post) => {
        // A. Recupera l'albero dei commenti strutturato tramite il servizio dedicato
        const commentiConRisposte = await this.commentoService.getCommentsTreeForPost(post.id, utenteLoggatoId);

        // B. Recupero Media tramite il Repository reale
        const mediaEntities = await this.mediaRepository.findByPostId(post.id);

        // Mappiamo le entità in oggetti semplici per il frontend
        const media = mediaEntities.map(m => ({
          id: m.id,
          tipo: m.tipo,
          url: m.url
        }));

        return {
          post,
          commenti: commentiConRisposte,
          media
        };
      })
    );
  }
}
import Commento from '../domain/commento.entity.js';
import LikeCommento from '../domain/like.commento.entity.js';

export class CommentoService {
  constructor({ commentoRepository, sfidaCompletataRepository, likeCommentoRepository }) {
    this.commentoRepository = commentoRepository;
    this.sfidaCompletataRepository = sfidaCompletataRepository;
    this.likeCommentoRepository = likeCommentoRepository;
  }

  /**
   * Aggiunge un commento principale a un post (sfida completata)
   */
  async addComment(utenteId, postId, testo) {
    if (this.sfidaCompletataRepository.findById) {
      const postEsistente = await this.sfidaCompletataRepository.findById(postId);
      if (!postEsistente) {
        const error = new Error("Il post che stai cercando di commentare non esiste.");
        error.statusCode = 404;
        error.type = 'NotFoundError';
        throw error;
      }
    }

    const nuovoCommento = new Commento({
      utente: utenteId,
      sfida_completata: postId,
      commento_padre: null,
      testo
    });

    return await this.commentoRepository.create(nuovoCommento);
  }

  /**
   * Aggiunge una risposta a un commento esistente
   */
  async addReply(utenteId, commentoPadreId, testo) {
    const commentoPadreEsistente = await this.commentoRepository.findById(commentoPadreId); //[cite: 2]
    if (!commentoPadreEsistente) {
      const error = new Error("Il commento a cui stai cercando di rispondere non esiste.");
      error.statusCode = 404;
      error.type = 'NotFoundError';
      throw error;
    }

    const nuovaRisposta = new Commento({
      utente: utenteId,
      sfida_completata: null,
      commento_padre: commentoPadreId,
      testo
    });

    return await this.commentoRepository.create(nuovaRisposta); //[cite: 2]
  }

  /**
   * Mette o toglie il mi piace a un commento/risposta
   */
  async toggleLike(utenteId, commentoId) {
    // 1. Verifichiamo che il commento (o risposta) esista davvero prima di mettere il like
    const commentoEsistente = await this.commentoRepository.findById(commentoId);
    if (!commentoEsistente) {
      const error = new Error("Il commento a cui stai cercando di mettere mi piace non esiste.");
      error.statusCode = 404;
      error.type = 'NotFoundError';
      throw error;
    }

    // 2. Controlliamo se l'utente ha già messo mi piace
    const giaMesso = await this.likeCommentoRepository.checkMessoDaMe(utenteId, commentoId);

    if (giaMesso) {
      // Se esiste, lo togliamo (Unlike)
      await this.likeCommentoRepository.rimuovi(utenteId, commentoId);
      return { liked: false };
    } else {
      // Se non esiste, lo creiamo (Like)
      const nuovoLike = new LikeCommento({ utente: utenteId, commento: commentoId });
      await this.likeCommentoRepository.aggiungi(nuovoLike);
      return { liked: true };
    }
  }

  /**
   * Recupera l'albero dei commenti (Principali -> Risposte) formattato per un determinato post.
   * Riutilizzabile sia nel feed globale che nel feed del profilo utente.
   */
  async getCommentsTreeForPost(postId, utenteLoggatoId) {
    // 1. Recupera i commenti di primo livello (principali)
    const commentiPrincipali = await this.commentoRepository.findByPostId(postId, utenteLoggatoId);

    // 2. Per ogni commento principale, estrae e mappa le relative risposte di secondo livello
    return await Promise.all(
      commentiPrincipali.map(async (comm) => {
        const risposte = await this.commentoRepository.findRepliesByCommentId(comm.id, utenteLoggatoId);
        
        return {
          id: comm.id,
          testo: comm.testo,
          autore: {
            id: comm.autoreId,
            username: comm.autoreUsername,
            foto: comm.autoreFoto
          },
          totaleLike: parseInt(comm.totaleLike, 10) || 0,
          messoDaMe: !!comm.messoDaMe,
          totaleRisposte: parseInt(comm.totaleRisposte, 10) || 0,
          risposte: risposte.map(r => ({
            id: r.id,
            testo: r.testo,
            commentoPadreId: r.commentoPadreId,
            autore: {
              id: r.autoreId,
              username: r.autoreUsername,
              foto: r.autoreFoto
            },
            totaleLike: parseInt(r.totaleLike, 10) || 0,
            messoDaMe: !!r.messoDaMe
          }))
        };
      })
    );
  }
}
/**
 * DTO (Data Transfer Object) per gestire la formattazione dei dati
 * relativi ai commenti e alle risposte da inviare al frontend.
 */
export class CommentResponseDto {
  /**
   * Formatta un'istanza di un singolo commento appena creato o recuperato.
   * Converte i campi del database in camelCase per gli standard del frontend.
   * 
   * @param {Object} commento - L'oggetto commento proveniente dal database o dall'entità
   * @returns {Object} Oggetto formattato pronto per la risposta JSON
   */
  static format(commento) {
    return {
      id: commento.id,
      utente: commento.utente,
      sfidaCompletata: commento.sfida_completata,
      commentoPadre: commento.commento_padre,
      testo: commento.testo
    };
  }

  /**
   * Formatta una collezione (array) di commenti.
   * Utile se in futuro serviranno endpoint di lettura dedicati fuori dal feed tree.
   * 
   * @param {Array} commenti 
   * @returns {Array} Array di oggetti formattati
   */
  static formatCollection(commenti) {
    if (!Array.isArray(commenti)) return [];
    return commenti.map(commento => this.format(commento));
  }
}

export class LikeCommentoResponseDto {
  /**
   * Formatta il risultato dell'azione di toggle like
   * @param {Object} data 
   * @param {boolean} data.liked 
   * @returns {Object}
   */
  static format(data) {
    return {
      liked: data.liked
    };
  }
}
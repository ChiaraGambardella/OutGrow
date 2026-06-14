class LikeCommento {
  /**
   * Costruttore dell'entità LikeCommento
   * @param {Object} params
   * @param {number} params.utente - ID dell'utente che mette il like (FK)
   * @param {number} params.commento - ID del commento che riceve il like (FK)
   * @param {Date|string} [params.rilascio] - Timestamp del momento del like (mappato come Date)
   */
  constructor({
    utente,
    commento,
    rilascio = new Date()
  }) {
    this.utente = utente;
    this.commento = commento;
    // Gestione nativa del timestamp con data e orario completi
    this.rilascio = rilascio instanceof Date ? rilascio : new Date(rilascio);
  }
}

export default LikeCommento;
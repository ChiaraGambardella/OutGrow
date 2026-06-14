class LikeSfidaCompletata {
  /**
   * Costruttore dell'entità LikeSfidaCompletata
   * @param {Object} params
   * @param {number} params.utente - ID dell'utente che mette il like (FK)
   * @param {number} params.sfida_completata - ID della sfida completata (FK)
   * @param {Date|string} [params.rilascio] - Timestamp del momento in cui è stato messo il like
   */
  constructor({
    utente,
    sfida_completata,
    rilascio = new Date()
  }) {
    this.utente = utente;
    this.sfida_completata = sfida_completata;
    // Assicuriamo che sia sempre un oggetto Date di JavaScript per poterlo formattare nel frontend
    this.rilascio = rilascio instanceof Date ? rilascio : new Date(rilascio);
  }
}

export default LikeSfidaCompletata;
class BadgeOttenuto {
  /**
   * Costruttore dell'entità BadgeOttenuto
   * @param {Object} params
   * @param {number} params.utente - ID dell'utente che ha sbloccato il badge (FK)
   * @param {number} params.badge - ID del badge ottenuto (FK)
   * @param {Date|string} [params.ottenimento] - Timestamp del momento dello sblocco
   */
  constructor({
    utente,
    badge,
    ottenimento = new Date()
  }) {
    this.utente = utente;
    this.badge = badge;
    // Assicuriamo che sia sempre un oggetto Date di JavaScript
    this.ottenimento = ottenimento instanceof Date ? ottenimento : new Date(ottenimento);
  }
}

export default BadgeOttenuto;
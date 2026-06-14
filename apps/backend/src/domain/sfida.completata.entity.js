class SfidaCompletata {
  /**
   * Costruttore dell'entità SfidaCompletata (Il Post di Outgrow)
   * @param {Object} params
   * @param {number} [params.id] - ID seriale assegnato dal DB
   * @param {number} [params.utente] - ID dell'utente che ha pubblicato (chiave esterna 'utente')
   * @param {number} [params.sfida] - ID della sfida completata (chiave esterna 'sfida')
   * @param {string|null} [params.descrizione=null] - Testo del post
   * @param {number|null} [params.latitudine=null] - Coordinata latitudinale
   * @param {number|null} [params.longitudine=null] - Coordinata longitudinale
   * @param {string|null} [params.luogo=null] - Nome testuale del luogo
   * @param {string|null} [params.difficolta_attesa=null] - Difficoltà stimata prima della sfida
   * @param {string|null} [params.difficolta_percepita=null] - Difficoltà reale riscontrata
   * @param {Date|string} [params.pubblicazione] - Timestamp di pubblicazione
   */
  constructor({
    id,
    utente,
    sfida,
    descrizione = null,
    latitudine = null,
    longitudine = null,
    luogo = null,
    difficolta_attesa = null,
    difficolta_percepita = null,
    pubblicazione = new Date()
  }) {
    this.id = id;
    this.utente = utente;
    this.sfida = sfida;
    this.descrizione = descrizione;
    this.latitudine = latitudine !== null ? Number(latitudine) : null;
    this.longitudine = longitudine !== null ? Number(longitudine) : null;
    this.luogo = luogo;
    this.difficolta_attesa = difficolta_attesa;
    this.difficolta_percepita = difficolta_percepita;
    this.pubblicazione = pubblicazione instanceof Date ? pubblicazione : new Date(pubblicazione);
  }

  /**
   * Valida la coerenza dei dati geografici rispettando il vincolo CHECK del database.
   * Il luogo e le coordinate devono essere tutti presenti o tutti assenti.
   * @returns {boolean}
   */
  haPosizioneValida() {
    const haCoordinate = this.latitudine !== null && this.longitudine !== null;
    const haLuogo = this.luogo !== null && this.luogo.trim() !== "";

    if (!haCoordinate && this.latitudine === null && this.longitudine === null && !haLuogo) {
      return true; // Posizione totalmente assente (valido)
    }

    return haCoordinate && haLuogo; // Tutti e tre presenti (valido)
  }

  /**
   * Verifica se la pubblicazione contiene del testo descrittivo.
   * @returns {boolean}
   */
  haDescrizione() {
    return this.descrizione !== null && this.descrizione.trim() !== "";
  }
}

export default SfidaCompletata;
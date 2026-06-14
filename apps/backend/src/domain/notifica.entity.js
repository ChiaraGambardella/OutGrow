class Notifica {
  /**
   * Costruttore dell'entità Notifica
   * @param {Object} params
   * @param {number} [params.id] - ID seriale assegnato dal DB
   * @param {number} params.utente - ID dell'utente destinatario della notifica (FK)
   * @param {string} params.titolo - Titolo breve della notifica (max 30 caratteri, es. "Nuova Sfida!")
   * @param {string} params.contenuto - Testo esteso del messaggio
   * @param {boolean} [params.letta=false] - Flag che indica se l'utente ha già aperto/letto la notifica
   * @param {Date|string} [params.ricezione] - Timestamp del momento in cui la notifica è stata generata
   */
  constructor({
    id,
    utente,
    titolo,
    contenuto,
    letta = false,
    ricezione = new Date()
  }) {
    this.id = id;
    this.utente = utente;
    this.titolo = titolo;
    this.contenuto = contenuto;
    this.letta = Boolean(letta); // Forza il cast a booleano
    this.ricezione = ricezione instanceof Date ? ricezione : new Date(ricezione);
  }

  /**
   * Verifica se la notifica deve ancora essere letta
   * Utile nel frontend per mostrare il pallino rosso di notifica non letta
   * @returns {boolean}
   */
  isNonLetta() {
    return this.letta === false;
  }
}

export default Notifica;
class Segnalazione {
  /**
   * Costruttore dell'entità Segnalazione
   * @param {Object} params
   * @param {number} [params.id] - ID seriale assegnato dal DB
   * @param {number} params.utente - ID dell'utente che invia la segnalazione (FK)
   * @param {number|null} [params.sfida_completata=null] - ID del post segnalato (FK)
   * @param {number|null} [params.commento=null] - ID del commento segnalato (FK)
   * @param {string} params.categoria - Deve essere: 'Spam', 'Inappropriato', 'Off topic', 'Altro'
   * @param {string|null} [params.descrizione=null] - Dettagli extra (obbligatoria se categoria è 'Altro')
   * @param {Date|string} [params.generazione] - Timestamp di creazione della segnalazione
   * @param {boolean} [params.risolta=false] - Stato della segnalazione (gestita dai moderatori/admin)
   */
  constructor({
    id,
    utente,
    sfida_completata = null,
    commento = null,
    categoria,
    descrizione = null,
    generazione = new Date(),
    risolta = false
  }) {
    this.id = id;
    this.utente = utente;
    this.sfida_completata = sfida_completata;
    this.commento = commento;
    this.descrizione = descrizione ? descrizione.trim() : null;
    this.generazione = generazione instanceof Date ? generazione : new Date(generazione);
    this.risolta = Boolean(risolta);

    // 1. Validazione e Normalizzazione della Categoria
    if (typeof categoria === 'string' && categoria.trim() !== "") {
      const stringaPulita = categoria.trim().toLowerCase();

      if (stringaPulita === 'spam') this.categoria = 'Spam';
      else if (stringaPulita === 'inappropriato') this.categoria = 'Inappropriato';
      else if (stringaPulita === 'off topic' || stringaPulita === 'off-topic') this.categoria = 'Off topic';
      else if (stringaPulita === 'altro') this.categoria = 'Altro';
      else {
        throw new Error(`Categoria segnalazione non valida: ${categoria}.`);
      }
    } else {
      this.categoria = categoria;
    }

    // 2. Controllo difensivo basato sul secondo CHECK del DB
    if (this.categoria === 'Altro' && (!this.descrizione || this.descrizione === "")) {
      throw new Error("La descrizione è obbligatoria se la categoria della segnalazione è 'Altro'.");
    }
  }

  /**
   * Verifica se la segnalazione è stata presa in carico e risolta
   * @returns {boolean}
   */
  isRisolta() {
    return this.risolta === true;
  }
}

export default Segnalazione;
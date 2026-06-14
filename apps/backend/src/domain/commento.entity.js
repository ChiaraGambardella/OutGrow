class Commento {
  /**
   * Costruttore dell'entità Commento
   * @param {Object} params
   * @param {number} [params.id] - ID seriale assegnato dal DB
   * @param {number} params.utente - ID dell'utente che ha scritto il commento (FK)
   * @param {number|null} [params.sfida_completata=null] - ID del post se è un commento principale (FK)
   * @param {number|null} [params.commento_padre=null] - ID del commento a cui risponde se è una sottomensa (FK)
   * @param {string} params.testo - Il contenuto testuale del commento
   */
  constructor({
    id,
    utente,
    sfida_completata = null,
    commento_padre = null,
    testo
  }) {
    this.id = id;
    this.utente = utente;
    this.sfida_completata = sfida_completata;
    this.commento_padre = commento_padre;
    this.testo = testo;
  }

  /**
   * Verifica se il commento corrente è una risposta a un altro commento
   * @returns {boolean}
   */
  isRisposta() {
    return this.commento_padre !== null;
  }

  /**
   * Verifica se il commento corrente è un commento principale legato direttamente al post
   * @returns {boolean}
   */
  isPrincipale() {
    return this.sfida_completata !== null;
  }

  /**
   * Pulisce il testo del commento da spazi vuoti inutili all'inizio e alla fine
   * ed estrae i caratteri utili per l'anteprima
   * @param {number} [lunghezzaMax=30] 
   * @returns {string}
   */
  getAnteprima(lunghezzaMax = 30) {
    if (!this.testo) return "";
    const testoPulito = this.testo.trim();
    if (testoPulito.length <= lunghezzaMax) return testoPulito;
    return `${testoPulito.substring(0, lunghezzaMax)}...`;
  }
}

export default Commento;
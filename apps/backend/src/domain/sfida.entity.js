class Sfida {
  /**
   * Costruttore dell'entità Sfida
   * @param {Object} params
   * @param {number} [params.id] - ID seriale assegnato dal DB
   * @param {string} params.titolo - Titolo della sfida (max 30 caratteri)
   * @param {string} params.descrizione - Descrizione testuale dei requisiti
   * @param {string} params.immagine - URL o path dell'immagine identificativa
   * @param {number} params.badge - ID del badge associato (chiave esterna 'badge' obbligatoria)
   */
  constructor({
    id,
    titolo,
    descrizione,
    immagine,
    badge // Rimosso il "= null", adesso è un parametro richiesto
  }) {
    this.id = id;
    this.titolo = titolo;
    this.descrizione = descrizione;
    this.immagine = immagine;
    this.badge = badge; 
  }
}

export default Sfida;
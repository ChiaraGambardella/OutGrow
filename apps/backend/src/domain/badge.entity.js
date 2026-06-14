class Badge {
  /**
   * Costruttore dell'entità Badge
   * @param {Object} params
   * @param {number} [params.id] - ID seriale assegnato dal DB (assente prima del salvataggio)
   * @param {string} params.titolo - Titolo del badge (max 30 caratteri, es. "Esploratore Urbano")
   * @param {string} params.immagine - URL assoluto o relativo dell'immagine del badge
   */
  constructor({
    id,
    titolo,
    immagine
  }) {
    this.id = id;
    this.titolo = titolo;
    this.immagine = immagine; // Stringa contenente l'URL dell'immagine
  }
}

export default Badge;
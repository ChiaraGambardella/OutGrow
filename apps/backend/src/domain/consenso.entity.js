class Consenso {
  /**
   * Costruttore dell'entità Consenso
   * @param {Object} params
   * @param {number} params.utente - ID dell'utente (FK)
   * @param {string} params.tipo - Il tipo di permesso hardware. Deve essere: 'Fotocamera', 'Galleria', 'GNSS'
   * @param {boolean} params.fornito - Flag che indica se il consenso è stato accordato o meno
   */
  constructor({
    utente,
    tipo,
    fornito
  }) {
    this.utente = utente;
    this.fornito = Boolean(fornito); // Forza il cast a booleano

    // Normalizziamo la stringa per intercettare variazioni di maiuscole/minuscole
    if (typeof tipo === 'string' && tipo.trim() !== "") {
      const stringaPulita = tipo.trim().toLowerCase();

      if (stringaPulita === 'fotocamera') this.tipo = 'Fotocamera';
      else if (stringaPulita === 'galleria') this.tipo = 'Galleria';
      else if (stringaPulita === 'gnss') this.tipo = 'GNSS'; // Gestisce anche casi come 'gnss' o 'Gnss'
      else {
        throw new Error(`Tipo consenso non valido: ${tipo}. Deve essere 'Fotocamera', 'Galleria' o 'GNSS'.`);
      }
    } else {
      this.tipo = tipo;
    }
  }

  /**
   * Verifica se questo specifico consenso è stato fornito dall'utente
   * @returns {boolean}
   */
  isFornito() {
    return this.fornito === true;
  }
}

export default Consenso;
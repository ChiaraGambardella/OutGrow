class Preferenza {
  /**
   * Costruttore dell'entità Preferenza
   * @param {Object} params
   * @param {number} params.utente - ID dell'utente (FK)
   * @param {string} params.argomento - Deve essere uno tra: 'Sfide', 'Progressi', 'Social'
   * @param {boolean} params.attivo - Flag per abilitare/disabilitare le notifiche
   */
  constructor({
    utente,
    argomento,
    attivo
  }) {
    this.utente = utente;
    this.attivo = Boolean(attivo);

    // Normalizziamo la stringa per aiutare lo sviluppatore:
    // Trasforma stringhe come "social" o "SOCIAL" in "Social", per combaciare con il DB.
    if (typeof argomento === 'string' && argomento.trim() !== "") {
      const stringaPulita = argomento.trim().toLowerCase();
      
      if (stringaPulita === 'sfide') this.argomento = 'Sfide';
      else if (stringaPulita === 'progressi') this.argomento = 'Progressi';
      else if (stringaPulita === 'social') this.argomento = 'Social';
      else {
        // Se viene passato un argomento totalmente inventato, lanciamo un errore prima di arrivare al DB
        throw new Error(`Argomento notifica non valido: ${argomento}. Deve essere 'Sfide', 'Progressi' o 'Social'.`);
      }
    } else {
      this.argomento = argomento;
    }
  }

  /**
   * Verifica se le notifiche per questo specifico argomento sono abilitate
   * @returns {boolean}
   */
  isAbilitata() {
    return this.attivo === true;
  }
}

export default Preferenza;
class Media {
  /**
   * Costruttore dell'entità Media
   * @param {Object} params
   * @param {number} [params.id] - ID seriale assegnato dal DB
   * @param {number} params.sfida_completata - ID del post a cui si riferisce il file (FK)
   * @param {string} params.tipo - Il tipo di file. Deve essere: 'Immagine' o 'Video'
   * @param {string} params.url - URL assoluto del file (es. salvato su Cloudinary, AWS S3 o localmente)
   */
  constructor({
    id,
    sfida_completata,
    tipo,
    url
  }) {
    this.id = id;
    this.sfida_completata = sfida_completata;
    this.url = url;

    // Normalizziamo il tipo per rispettare il CHECK del database
    if (typeof tipo === 'string' && tipo.trim() !== "") {
      const stringaPulita = tipo.trim().toLowerCase();

      if (stringaPulita === 'immagine') this.tipo = 'Immagine';
      else if (stringaPulita === 'video') this.tipo = 'Video';
      else {
        throw new Error(`Tipo media non valido: ${tipo}. Deve essere 'Immagine' o 'Video'.`);
      }
    } else {
      this.tipo = tipo;
    }
  }

  /**
   * Verifica se il media corrente è un video
   * Utile al frontend (o al backend) per capire quale componente di rendering usare
   * @returns {boolean}
   */
  isVideo() {
    return this.tipo === 'Video';
  }

  /**
   * Verifica se il media corrente è un'immagine
   * @returns {boolean}
   */
  isImmagine() {
    return this.tipo === 'Immagine';
  }
}

export default Media;
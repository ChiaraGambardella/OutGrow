export class SfidaCompletataResponseDto {
  static format(sfida, media = []) {
    return {
      id: sfida.id,
      utente: sfida.utente,
      sfida: sfida.sfida,
      descrizione: sfida.descrizione,
      latitudine: sfida.latitudine,
      longitudine: sfida.longitudine,
      luogo: sfida.luogo,
      difficoltaAttesa: sfida.difficolta_attesa,
      difficoltaPercepita: sfida.difficolta_percepita,
      dataCreazione: sfida.pubblicazione, 
      media: media.map(m => ({
        id: m.id,
        url: m.url,
        tipo: m.tipo
      }))
    };
  }
}

export class LikeSfidaCompletataResponseDto {
  /**
   * Formatta il risultato del toggle del like per il frontend
   * @param {Object} data 
   * @param {boolean} data.liked
   */
  static format(data) {
    return {
      liked: data.liked
    };
  }
}
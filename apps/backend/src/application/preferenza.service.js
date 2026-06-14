import Preferenza from '../domain/preferenza.entity.js';

export class PreferenzaService {
  constructor({ preferenzaRepository }) {
    this.preferenzaRepository = preferenzaRepository;
  }

  /**
   * Recupera le preferenze dell'utente e le formatta a misura di frontend (oggetti con chiavi minuscole)
   */
  async getPreferences(utenteId) {
    const preferenzeDB = await this.preferenzaRepository.findAllByUtenteId(utenteId);
    
    // Stato iniziale di default se l'utente non ha mai salvato nulla
    const preferenzeMappate = {
      sfide: true,
      progressi: true,
      social: true
    };

    // Sovrascriviamo i default con i dati reali estratti dal DB
    preferenzeDB.forEach(p => {
      if (p.argomento === 'Sfide') preferenzeMappate.sfide = p.attivo;
      if (p.argomento === 'Progressi') preferenzeMappate.progressi = p.attivo;
      if (p.argomento === 'Social') preferenzeMappate.social = p.attivo;
    });

    return preferenzeMappate;
  }

  /**
   * Elabora l'aggiornamento dei 3 toggle eseguendo l'UPSERT sul database
   */
  async updatePreferences(utenteId, updatePreferencesDto) {
    const argomentiMappa = [
      { chiaveDominio: 'Sfide', valore: updatePreferencesDto.sfide },
      { chiaveDominio: 'Progressi', valore: updatePreferencesDto.progressi },
      { chiaveDominio: 'Social', valore: updatePreferencesDto.social }
    ];

    const promesseDiSalvataggio = argomentiMappa.map(item => {
      const nuovaPreferenza = new Preferenza({
        utente: utenteId,
        argomento: item.chiaveDominio,
        attivo: item.valore
      });
      return this.preferenzaRepository.save(nuovaPreferenza);
    });

    // Eseguiamo i salvataggi in parallelo sul pool
    await Promise.all(promesseDiSalvataggio);

    return this.getPreferences(utenteId);
  }
}
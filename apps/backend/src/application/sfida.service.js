import { SfidaRepository } from '../infrastructure/repositories/sfida.repository.js';
import { SfidaCompletataRepository } from '../infrastructure/repositories/sfida.completata.repository.js';

export class SfidaService {
  constructor() {
    this.sfidaRepository = new SfidaRepository();
    this.sfidaCompletataRepository = new SfidaCompletataRepository();
  }

  /**
   * Gestisce la logica di business per ottenere la sfida della settimana corrente.
   * @param {number|null} userId - ID dell'utente se autenticato, altrimenti null
   */
  async getWeeklyChallengeData(userId = null) {
    // 1. Recuperiamo la sfida corrente e i metadati temporali ISO calcolati dal DB
    const weeklyData = await this.sfidaRepository.getWeeklyChallenge();
    
    if (!weeklyData) {
      const error = new Error('Nessuna sfida configurata nel sistema.');
      error.statusCode = 404;
      error.type = 'NotFoundError';
      throw error;
    }

    const { challenge, isoYear, isoWeek } = weeklyData;
    let completata = null;

    // 2. Se l'utente è loggato, verifichiamo se ha completato la sfida in questa precisa settimana ISO
    if (userId) {
      completata = await this.sfidaCompletataRepository.hasUserCompletedChallengeInWeek(
        userId,
        challenge.id,
        isoYear,
        isoWeek
      );
    }

    return {
      challenge,
      completata
    };
  }
}
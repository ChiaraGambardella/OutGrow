import pool from '../database/db.js';
import BadgeOttenuto from '../../domain/badge.ottenuto.entity.js';

export class BadgeOttenutoRepository {

  /**
   * Registra l'ottenimento di un badge da parte di un utente
   * @param {BadgeOttenuto} badgeOttenuto - Istanza dell'entità BadgeOttenuto
   * @returns {Promise<BadgeOttenuto>} L'istanza aggiornata con i dati reali del DB
   */
  async assegnaBadge(badgeOttenuto) {
    const query = `
      INSERT INTO badge_ottenuto (utente, badge)
      VALUES ($1, $2)
      RETURNING utente, badge, ottenimento;
    `;

    try {
      const result = await pool.query(query, [badgeOttenuto.utente, badgeOttenuto.badge]);
      
      // Restituiamo una nuova istanza dell'entità con il timestamp ufficiale generato da Postgres
      return new BadgeOttenuto(result.rows[0]);
    } catch (error) {
      throw new Error(`Errore nell'assegnazione del badge tramite entità: ${error.message}`);
    }
  }

  /**
   * Verifica se un utente possiede già un determinato badge.
   * @param {number} utenteId 
   * @param {number} badgeId 
   * @returns {Promise<boolean>}
   */
  async checkPossesso(utenteId, badgeId) {
    const query = `
      SELECT 1 
      FROM badge_ottenuto
      WHERE utente = $1 AND badge = $2
      LIMIT 1;
    `;

    try {
      const result = await pool.query(query, [utenteId, badgeId]);
      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`Errore nella verifica del possesso del badge: ${error.message}`);
    }
  }

  /**
   * Verifica se un utente ha già ottenuto un determinato badge nella settimana ISO corrente.
   * @param {number} utenteId 
   * @param {number} badgeId 
   * @returns {Promise<boolean>}
   */
  async checkPossessoSettimanale(utenteId, badgeId) {
    const query = `
      SELECT 1 
      FROM badge_ottenuto
      WHERE utente = $1 
        AND badge = $2 
        AND EXTRACT(ISOYEAR FROM ottenimento) = EXTRACT(ISOYEAR FROM NOW())
        AND EXTRACT(WEEK FROM ottenimento) = EXTRACT(WEEK FROM NOW())
      LIMIT 1;
    `;

    try {
      const result = await pool.query(query, [utenteId, badgeId]);
      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`Errore nella verifica settimanale del badge: ${error.message}`);
    }
  }

  /**
   * Recupera la cronologia di tutti i record di badge ottenuti da un utente
   * @param {number} utenteId 
   * @returns {Promise<Array<BadgeOttenuto>>} Lista di entità BadgeOttenuto
   */
  async findAllByUtenteId(utenteId) {
    const query = `
      SELECT utente, badge, ottenimento
      FROM badge_ottenuto
      WHERE utente = $1
      ORDER BY ottenimento DESC;
    `;

    try {
      const result = await pool.query(query, [utenteId]);
      
      // Trasformiamo le righe grezze del DB in istanze della tua entità
      return result.rows.map(row => new BadgeOttenuto(row));
    } catch (error) {
      throw new Error(`Errore nel recupero della lista BadgeOttenuto: ${error.message}`);
    }
  }
}
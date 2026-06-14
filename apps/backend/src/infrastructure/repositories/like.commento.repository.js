import pool from '../database/db.js';
import LikeCommento from '../../domain/like.commento.entity.js';

export class LikeCommentoRepository {

  /**
   * Registra un mi piace su un commento o su una risposta
   * @param {LikeCommento} like - Istanza dell'entità LikeCommento
   * @returns {Promise<LikeCommento>} L'istanza aggiornata con i dati reali del database
   */
  async aggiungi(like) {
    const query = `
      INSERT INTO like_commento (utente, commento)
      VALUES ($1, $2)
      RETURNING utente, commento, rilascio;
    `;

    try {
      const result = await pool.query(query, [like.utente, like.commento]);
      return new LikeCommento(result.rows[0]);
    } catch (error) {
      throw new Error(`Errore nell'aggiunta del mi piace al commento: ${error.message}`);
    }
  }

  /**
   * Rimuove il mi piace da un commento (Azione di Unlike)
   * @param {number} utenteId 
   * @param {number} commentoId 
   * @returns {Promise<boolean>} true se il like esisteva ed è stato rimosso, false altrimenti
   */
  async rimuovi(utenteId, commentoId) {
    const query = `
      DELETE FROM like_commento
      WHERE utente = $1 AND commento = $2;
    `;

    try {
      const result = await pool.query(query, [utenteId, commentoId]);
      return result.rowCount > 0;
    } catch (error) {
      throw new Error(`Errore nella rimozione del mi piace dal commento: ${error.message}`);
    }
  }

  /**
   * Verifica se un utente specifico ha messo mi piace a un determinato commento
   * @param {number} utenteId 
   * @param {number} commentoId 
   * @returns {Promise<boolean>}
   */
  async checkMessoDaMe(utenteId, commentoId) {
    const query = `
      SELECT 1 
      FROM like_commento
      WHERE utente = $1 AND commento = $2
      LIMIT 1;
    `;

    try {
      const result = await pool.query(query, [utenteId, commentoId]);
      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`Errore nella verifica del mi piace al commento: ${error.message}`);
    }
  }
}
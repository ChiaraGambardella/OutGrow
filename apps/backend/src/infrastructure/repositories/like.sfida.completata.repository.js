import pool from '../database/db.js';
import LikeSfidaCompletata from '../../domain/like.sfida.completata.entity.js';

export class LikeSfidaCompletataRepository {

  /**
   * Inserisce un mi piace su un post (Sfida Completata)
   * @param {LikeSfidaCompletata} like - Istanza dell'entità LikeSfidaCompletata
   * @returns {Promise<LikeSfidaCompletata>} L'istanza arricchita con il timestamp reale del DB
   */
  async aggiungi(like) {
    const query = `
      INSERT INTO like_sfida_completata (utente, sfida_completata)
      VALUES ($1, $2)
      RETURNING utente, sfida_completata, rilascio;
    `;

    try {
      const result = await pool.query(query, [like.utente, like.sfida_completata]);
      return new LikeSfidaCompletata(result.rows[0]);
    } catch (error) {
      throw new Error(`Errore nell'aggiunta del mi piace al post: ${error.message}`);
    }
  }

  /**
   * Rimuove il mi piace da un post (Azione di Togliere il Like / Unlike)
   * @param {number} utenteId 
   * @param {number} postId 
   * @returns {Promise<boolean>} true se il like esisteva ed è stato rimosso, false altrimenti
   */
  async rimuovi(utenteId, postId) {
    const query = `
      DELETE FROM like_sfida_completata
      WHERE utente = $1 AND sfida_completata = $2;
    `;

    try {
      const result = await pool.query(query, [utenteId, postId]);
      return result.rowCount > 0;
    } catch (error) {
      throw new Error(`Errore nella rimozione del mi piace dal post: ${error.message}`);
    }
  }

  /**
   * Verifica se un utente ha messo mi piace a un post specifico
   * @param {number} utenteId 
   * @param {number} postId 
   * @returns {Promise<boolean>}
   */
  async checkMessoDaMe(utenteId, postId) {
    const query = `
      SELECT 1 
      FROM like_sfida_completata
      WHERE utente = $1 AND sfida_completata = $2
      LIMIT 1;
    `;

    try {
      const result = await pool.query(query, [utenteId, postId]);
      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`Errore nella verifica del mi piace: ${error.message}`);
    }
  }

  /**
   * Recupera l'elenco degli utenti che hanno messo mi piace a un post.
   * Utile se si clicca sul contatore dei like per vedere la lista delle persone.
   * @param {number} postId 
   * @returns {Promise<Array<Object>>} Lista di utenti (id, username, foto)
   */
  async findUtentiByPostId(postId) {
    const query = `
      SELECT 
        u.id, 
        u.username, 
        u.foto
      FROM like_sfida_completata lsc
      JOIN utente u ON lsc.utente = u.id
      WHERE lsc.sfida_completata = $1
      ORDER BY lsc.rilascio DESC;
    `;

    try {
      const result = await pool.query(query, [postId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Errore nel recupero degli utenti che hanno messo like: ${error.message}`);
    }
  }
}
import pool from '../database/db.js';
import Media from '../../domain/media.entity.js';

export class MediaRepository {

  /**
   * Associa un nuovo file multimediale (immagine o video) a una sfida completata
   * @param {Media} media - Istanza dell'entità Media
   * @returns {Promise<Media>} L'istanza aggiornata con l'ID assegnato dal database
   */
  async create(media) {
    const query = `
      INSERT INTO media (sfida_completata, tipo, url)
      VALUES ($1, $2, $3)
      RETURNING id;
    `;

    const values = [
      media.sfida_completata,
      media.tipo,
      media.url
    ];

    try {
      const result = await pool.query(query, values);
      media.id = result.rows[0].id;
      return media;
    } catch (error) {
      throw new Error(`Errore durante il salvataggio del file multimediale: ${error.message}`);
    }
  }

  /**
   * Recupera tutti i media associati a un singolo post (sfida completata)
   * Utile per gallerie o caroselli di immagini nel frontend
   * @param {number} postId - ID della sfida completata
   * @returns {Promise<Array<Media>>} Lista di entità Media
   */
  async findByPostId(postId) {
    const query = `
      SELECT id, sfida_completata, tipo, url
      FROM media
      WHERE sfida_completata = $1
      ORDER BY id ASC;
    `;

    try {
      const result = await pool.query(query, [postId]);
      // Trasformiamo le righe in istanze dell'entità Media, attivando i metodi interni
      return result.rows.map(row => new Media(row));
    } catch (error) {
      throw new Error(`Errore nel recupero dei media per il post ${postId}: ${error.message}`);
    }
  }

  /**
   * Elimina un singolo file multimediale tramite il suo ID
   * @param {number} id - ID del media
   * @returns {Promise<boolean>} true se eliminato con successo, false se non trovato
   */
  async delete(id) {
    const query = `
      DELETE FROM media
      WHERE id = $1;
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rowCount > 0;
    } catch (error) {
      throw new Error(`Errore durante l'eliminazione del file multimediale: ${error.message}`);
    }
  }
}
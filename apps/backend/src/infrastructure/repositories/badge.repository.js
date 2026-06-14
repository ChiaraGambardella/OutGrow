import pool from '../database/db.js';
import Badge from '../../domain/badge.entity.js';

export class BadgeRepository {

  /**
   * Recupera il catalogo completo di tutti i badge presenti nell'applicazione
   * @returns {Promise<Array<Badge>>} Lista di tutte le entità Badge
   */
  async findAll() {
    // Usiamo titolo e immagine, esattamente come nella tua CREATE TABLE
    const query = `
      SELECT id, titolo, immagine
      FROM badge
      ORDER BY id ASC;
    `;

    try {
      const result = await pool.query(query);
      
      // Essendo i campi identici, possiamo passare direttamente la riga al costruttore
      return result.rows.map(row => new Badge(row));
    } catch (error) {
      throw new Error(`Errore nel recupero del catalogo badge: ${error.message}`);
    }
  }

  /**
   * Recupera un singolo badge tramite il suo ID
   * @param {number} id 
   * @returns {Promise<Badge|null>} L'entità Badge o null se non trovato
   */
  async findById(id) {
    const query = `
      SELECT id, titolo, immagine
      FROM badge
      WHERE id = $1;
    `;

    try {
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) return null;
      
      // Passaggio diretto super pulito
      return new Badge(result.rows[0]);
    } catch (error) {
      throw new Error(`Errore nel recupero del badge tramite ID: ${error.message}`);
    }
  }

  /**
   * Crea un nuovo badge nel catalogo
   * @param {Badge} badge - Istanza dell'entità Badge
   * @returns {Promise<Badge>} L'istanza aggiornata con l'ID assegnato dal DB
   */
  async create(badge) {
    const query = `
      INSERT INTO badge (titolo, immagine)
      VALUES ($1, $2)
      RETURNING id;
    `;

    try {
      const result = await pool.query(query, [badge.titolo, badge.immagine]);
      badge.id = result.rows[0].id;
      return badge;
    } catch (error) {
      throw new Error(`Errore durante la creazione del badge nel catalogo: ${error.message}`);
    }
  }
}
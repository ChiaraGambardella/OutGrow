import pool from '../database/db.js';
import Commento from '../../domain/commento.entity.js';

export class CommentoRepository {

  /**
   * Crea un nuovo commento o una risposta a un commento esistente
   * @param {Commento} commento - Istanza dell'entità Commento
   * @returns {Promise<Commento>} L'istanza aggiornata con l'ID assegnato dal database
   */
  async create(commento) {
    const query = `
      INSERT INTO commento (utente, sfida_completata, commento_padre, testo)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `;

    const values = [
      commento.utente,
      commento.sfida_completata,
      commento.commento_padre,
      commento.testo
    ];

    try {
      const result = await pool.query(query, values);
      commento.id = result.rows[0].id;
      return commento;
    } catch (error) {
      throw new Error(`Errore durante l'inserimento del commento: ${error.message}`);
    }
  }

  /**
   * Recupera un singolo commento tramite il suo ID
   * @param {number} id 
   * @returns {Promise<Commento|null>}
   */
  async findById(id) {
    const query = `
      SELECT id, utente, sfida_completata, commento_padre, testo
      FROM commento
      WHERE id = $1;
    `;

    try {
      const result = await pool.query(query, [id]);
      if (result.rows.length === 0) return null;
      
      return new Commento(result.rows[0]);
    } catch (error) {
      throw new Error(`Errore nel recupero del commento tramite ID: ${error.message}`);
    }
  }

  /**
   * Recupera tutti i commenti di primo livello (principali) legati a un post.
   * Include l'anagrafica dell'autore, il totale dei like al commento e quante risposte ha.
   * @param {number} postId - ID della sfida completata
   * @param {number} utenteLoggatoId - ID di chi sta leggendo i commenti (per il "messoDaMe")
   */
  async findByPostId(postId, utenteLoggatoId) {
    // Ordiniamo per ID decrescente (cronologico): i commenti più vecchi in basso, i nuovi sopra
    const query = `
      SELECT 
        c.id,
        c.testo,
        c.utente AS "autoreId",
        u.username AS "autoreUsername",
        u.foto AS "autoreFoto",
        
        -- Conta i like di questo commento (tabella che faremo dopo)
        COUNT(DISTINCT lcom.utente) AS "totaleLike",
        
        -- Conta quante risposte ha questo commento (autoriferimento su questa stessa tabella)
        COUNT(DISTINCT risp.id) AS "totaleRisposte",
        
        -- Verifica se l'utente connesso ha messo like a questo commento
        EXISTS (
          SELECT 1 
          FROM like_commento 
          WHERE commento = c.id AND utente = $2
        ) AS "messoDaMe"

      FROM commento c
      JOIN utente u ON c.utente = u.id
      LEFT JOIN like_commento lcom ON lcom.commento = c.id
      LEFT JOIN commento risp ON risp.commento_padre = c.id
      
      WHERE c.sfida_completata = $1 -- Solo commenti principali del post
      GROUP BY c.id, u.id
      ORDER BY c.id DESC;
    `;

    try {
      const result = await pool.query(query, [postId, utenteLoggatoId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Errore nel recupero dei commenti del post: ${error.message}`);
    }
  }

  /**
   * Recupera le risposte (secondo livello) legate a un commento padre specifico.
   * @param {number} commentoPadreId - ID del commento a cui si risponde
   * @param {number} utenteLoggatoId
   */
  async findRepliesByCommentId(commentoPadreId, utenteLoggatoId) {
    const query = `
      SELECT 
        c.id,
        c.testo,
        c.commento_padre AS "commentoPadreId",
        c.utente AS "autoreId",
        u.username AS "autoreUsername",
        u.foto AS "autoreFoto",
        
        COUNT(DISTINCT lcom.utente) AS "totaleLike",
        
        EXISTS (
          SELECT 1 
          FROM like_commento 
          WHERE commento = c.id AND utente = $2
        ) AS "messoDaMe"

      FROM commento c
      JOIN utente u ON c.utente = u.id
      LEFT JOIN like_commento lcom ON lcom.commento = c.id
      
      WHERE c.commento_padre = $1 -- Solo risposte mirate a questo padre
      GROUP BY c.id, u.id
      ORDER BY c.id ASC;
    `;

    try {
      const result = await pool.query(query, [commentoPadreId, utenteLoggatoId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Errore nel recupero delle risposte al commento: ${error.message}`);
    }
  }
}
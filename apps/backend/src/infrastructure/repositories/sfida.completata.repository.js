import pool from '../database/db.js';
import SfidaCompletata from '../../domain/sfida.completata.entity.js';

export class SfidaCompletataRepository {

  /**
   * Crea un nuovo post (sfida completata) nel database
   * @param {SfidaCompletata} post - Istanza dell'entità SfidaCompletata
   * @returns {Promise<SfidaCompletata>} L'istanza aggiornata con l'ID e il timestamp reali
   */
  async create(post) {
    // Validazione preventiva basata sulla logica dell'entità
    if (!post.haPosizioneValida()) {
      throw new Error("Errore di validazione: la posizione deve essere totalmente presente (coordinate + luogo) o del tutto assente.");
    }

    const query = `
      INSERT INTO sfida_completata (
        utente, sfida, descrizione, latitudine, longitudine, luogo, difficolta_attesa, difficolta_percepita
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, pubblicazione;
    `;

    const values = [
      post.utente,
      post.sfida,
      post.descrizione,
      post.latitudine,
      post.longitudine,
      post.luogo,
      post.difficolta_attesa,
      post.difficolta_percepita
    ];

    try {
      const result = await pool.query(query, values);
      
      // Aggiorniamo l'oggetto entità con i dati generati da Postgres (ID e NOW())
      post.id = result.rows[0].id;
      post.pubblicazione = new Date(result.rows[0].pubblicazione);
      
      return post;
    } catch (error) {
      throw new Error(`Errore durante il salvataggio del post: ${error.message}`);
    }
  }

  /**
   * Recupera un singolo post tramite il suo ID nativo
   * @param {number} id 
   * @returns {Promise<SfidaCompletata|null>} L'istanza pura o null
   */
  async findById(id) {
    const query = `
      SELECT id, utente, sfida, descrizione, latitudine, longitudine, luogo, difficolta_attesa, difficolta_percepita, pubblicazione
      FROM sfida_completata
      WHERE id = $1;
    `;

    try {
      const result = await pool.query(query, [id]);
      if (result.rows.length === 0) return null;
      
      return new SfidaCompletata(result.rows[0]);
    } catch (error) {
      throw new Error(`Errore nel recupero del post tramite ID: ${error.message}`);
    }
  }

  /**
   * Genera la Home Page (Feed Globale) arricchita con i contatori di interazione
   * e lo stato del "Mi piace" dell'utente corrente.
   * @param {number} utenteLoggatoId - ID dell'utente che sta guardando l'app (per calcolare il "messoDaMe")
   * @param {number} limit 
   * @param {number} offset 
   */
  async getGlobalFeed(utenteLoggatoId, limit = 10, offset = 0) {
    const query = `
      SELECT 
        sc.id,
        sc.descrizione,
        sc.luogo,
        sc.difficolta_attesa AS "difficoltaAttesa",
        sc.difficolta_percepita AS "difficoltaPercepita",
        sc.pubblicazione,
        u.username AS "autoreUsername",
        u.foto AS "autoreFoto",
        s.titolo AS "titoloSfida",
        
        -- Contiamo quanti record ci sono nella tabella dei like per questo post
        COUNT(DISTINCT lsc.utente) AS "totaleLike",
        
        -- Contiamo quanti commenti ci sono per questo post
        COUNT(DISTINCT c.id) AS "totaleCommenti",
        
        -- Verifichiamo se l'utente loggato ha messo like (restituisce true o false)
        EXISTS (
          SELECT 1 
          FROM like_sfida_completata 
          WHERE sfida_completata = sc.id AND utente = $1
        ) AS "messoDaMe"

      FROM sfida_completata sc
      JOIN utente u ON sc.utente = u.id
      JOIN sfida s ON sc.sfida = s.id
      LEFT JOIN like_sfida_completata lsc ON lsc.sfida_completata = sc.id
      LEFT JOIN commento c ON c.sfida_completata = sc.id
      
      GROUP BY sc.id, u.id, s.id
      ORDER BY sc.pubblicazione DESC
      LIMIT $2 OFFSET $3;
    `;

    try {
      // Passiamo utenteLoggatoId come $1, limit come $2, offset come $3
      const result = await pool.query(query, [utenteLoggatoId, limit, offset]);
      return result.rows; 
    } catch (error) {
      throw new Error(`Errore nel caricamento del feed globale con interazioni: ${error.message}`);
    }
  }

  /**
   * Verifica se un utente ha già completato una specifica sfida in una determinata settimana e anno ISO.
   * @param {number} utenteId 
   * @param {number} sfidaId 
   * @param {number} isoYear 
   * @param {number} isoWeek 
   * @returns {Promise<boolean>}
   */
  async hasUserCompletedChallengeInWeek(utenteId, sfidaId, isoYear, isoWeek) {
    const query = `
      SELECT 1 
      FROM sfida_completata 
      WHERE utente = $1 
        AND sfida = $2 
        AND extract(isoyear from pubblicazione) = $3 
        AND extract(week from pubblicazione) = $4
      LIMIT 1;
    `;

    try {
      const result = await pool.query(query, [utenteId, sfidaId, isoYear, isoWeek]);
      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`Errore nella verifica del completamento della sfida: ${error.message}`);
    }
  }
}
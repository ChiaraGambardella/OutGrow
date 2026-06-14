import pool from '../database/db.js';
import Sfida from '../../domain/sfida.entity.js';

export class SfidaRepository {

/**
   * Recupera una sfida specifica tramite il suo ID, 
   * includendo l'immagine del badge associato.
   */
  async findById(id) {
    // Facciamo JOIN con la tabella badge per prenderci la colonna 'immagine'
    const query = `
      SELECT 
        s.id, 
        s.titolo, 
        s.descrizione, 
        s.immagine AS "immagineSfida", 
        s.badge AS "badgeId",
        b.immagine AS "immagineBadge"
      FROM sfida s
      JOIN badge b ON s.badge = b.id
      WHERE s.id = $1;
    `;

    try {
      const result = await pool.query(query, [id]);
      if (result.rows.length === 0) return null;
      
      // NOTA: Poiché il risultato contiene colonne unite (immagineBadge),
      // restituirai l'oggetto riga arricchito al Service o al Controller
      return result.rows[0];
    } catch (error) {
      throw new Error(`Errore nel recupero della sfida tramite ID con Badge: ${error.message}`);
    }
  }

  /**
   * Recupera la sfida legata a un determinato badge,
   * includendo l'immagine del badge stesso.
   */
  async findByBadgeId(badgeId) {
    const query = `
      SELECT 
        s.id, 
        s.titolo, 
        s.descrizione, 
        s.immagine AS "immagineSfida", 
        s.badge AS "badgeId",
        b.immagine AS "immagineBadge"
      FROM sfida s
      JOIN badge b ON s.badge = b.id
      WHERE s.badge = $1;
    `;

    try {
      const result = await pool.query(query, [badgeId]);
      if (result.rows.length === 0) return null;
      
      return result.rows[0];
    } catch (error) {
      throw new Error(`Errore nel recupero della sfida tramite badgeId: ${error.message}`);
    }
  }

 /**
  * Inserisce una nuova sfida nel database (per i seed o per caricarle nel sistema)
  */
  async create(sfida) {
    const query = `
      INSERT INTO sfida (titolo, descrizione, immagine, badge)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `;

    try {
      const result = await pool.query(query, [
        sfida.titolo,
        sfida.descrizione,
        sfida.immagine,
        sfida.badge
      ]);
      sfida.id = result.rows[0].id;
      return sfida;
    } catch (error) {
      throw new Error(`Errore durante la creazione della sfida: ${error.message}`);
    }
  }

  /**
   * Recupera la sfida settimanale corrente basata sulla rotazione temporale (ora italiana).
   * Cambia automaticamente a mezzanotte tra domenica e lunedì.
   * @returns {Promise<Object|null>} Sfida corrente con i dati del badge e le info sulla settimana ISO
   */
  async getWeeklyChallenge() {
    // 1. Calcola le settimane trascorse dal 5 Gennaio 2026 (Lunedì) e i dati ISO correnti in ora italiana
    const timeQuery = `
      SELECT 
        floor(extract(epoch from (now() AT TIME ZONE 'Europe/Rome' - timestamp '2026-01-05 00:00:00')) / 604800)::integer AS weeks_elapsed,
        extract(isoyear from now() AT TIME ZONE 'Europe/Rome')::integer AS iso_year,
        extract(week from now() AT TIME ZONE 'Europe/Rome')::integer AS iso_week;
    `;
    
    const countQuery = `SELECT COUNT(*)::integer FROM sfida;`;

    try {
      const countResult = await pool.query(countQuery);
      const totalChallenges = countResult.rows[0].count;

      if (totalChallenges === 0) return null;

      const timeResult = await pool.query(timeQuery);
      const { weeks_elapsed, iso_year, iso_week } = timeResult.rows[0];

      // Calcoliamo l'offset dinamico per la rotazione circolare degli ID
      const offset = weeks_elapsed % totalChallenges;

      // 2. Seleziona la sfida corrispondente all'offset ordinando per ID sequenziale
      const challengeQuery = `
        SELECT 
          s.id, 
          s.titolo, 
          s.descrizione, 
          s.immagine AS "immagineSfida", 
          s.badge AS "badgeId",
          b.immagine AS "immagineBadge"
        FROM sfida s
        JOIN badge b ON s.badge = b.id
        ORDER BY s.id ASC
        LIMIT 1 OFFSET $1;
      `;

      const challengeResult = await pool.query(challengeQuery, [offset]);
      if (challengeResult.rows.length === 0) return null;

      return {
        challenge: challengeResult.rows[0],
        isoYear: iso_year,
        isoWeek: iso_week
      };
    } catch (error) {
      throw new Error(`Errore nel calcolo della sfida settimanale: ${error.message}`);
    }
  }
}
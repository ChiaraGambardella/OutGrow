import pool from '../database/db.js';
import Segnalazione from '../../domain/segnalazione.entity.js';

export class SegnalazioneRepository {

  /**
   * Crea e memorizza una nuova segnalazione nel database
   * @param {Segnalazione} segnalazione - Istanza dell'entità Segnalazione
   * @returns {Promise<Segnalazione>} L'istanza aggiornata con ID e timestamp ufficiali del DB
   */
  async create(segnalazione) {
    // La logica difensiva del costruttore scatta automaticamente se l'oggetto è un'istanza valida,
    // ma facciamo un controllo formale per sicurezza prima dell'inserimento
    if (segnalazione.categoria === 'Altro' && (!segnalazione.descrizione || segnalazione.descrizione.trim() === "")) {
      throw new Error("Errore di validazione: descrizione obbligatoria per la categoria 'Altro'.");
    }

    const query = `
      INSERT INTO segnalazione (utente, sfida_completata, commento, categoria, descrizione)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, generazione, risolta;
    `;

    const values = [
      segnalazione.utente,
      segnalazione.sfida_completata,
      segnalazione.commento,
      segnalazione.categoria,
      segnalazione.descrizione
    ];

    try {
      const result = await pool.query(query, values);
      
      // Allineiamo l'entità con le informazioni reali generate da Postgres
      segnalazione.id = result.rows[0].id;
      segnalazione.generazione = new Date(result.rows[0].generazione);
      segnalazione.risolta = result.rows[0].risolta;

      return segnalazione;
    } catch (error) {
      throw new Error(`Errore durante l'inserimento della segnalazione: ${error.message}`);
    }
  }

  /**
   * Recupera la lista di tutte le segnalazioni aperte (non ancora risolte).
   * Include i dati dell'utente segnalatore tramite JOIN.
   * @returns {Promise<Array<Object>>} Elenco delle segnalazioni pendenti
   */
  async findAllAperte() {
    const query = `
      SELECT 
        s.id,
        s.sfida_completata,
        s.commento,
        s.categoria,
        s.descrizione,
        s.generazione,
        s.risolta,
        u.username
      FROM segnalazione s
      JOIN utente u ON s.utente = u.id
      WHERE s.risolta = false
      ORDER BY s.generazione ASC; -- Diamo priorità a quelle che attendono da più tempo
    `;

    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(`Errore nel recupero delle segnalazioni aperte: ${error.message}`);
    }
  }

  /**
   * Modifica lo stato di una segnalazione impostandola come "risolta".
   * Azione tipica del moderatore che ha rimosso il contenuto o archiviato la richiesta.
   * @param {number} id - ID della segnalazione
   * @returns {Promise<boolean>} true se modificata con successo, false se non trovata
   */
  async risolvi(id) {
    const query = `
      UPDATE segnalazione
      SET risolta = true
      WHERE id = $1;
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rowCount > 0;
    } catch (error) {
      throw new Error(`Errore durante l'aggiornamento dello stato della segnalazione: ${error.message}`);
    }
  }
}
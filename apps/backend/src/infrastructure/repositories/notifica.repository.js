import pool from '../database/db.js';
import Notifica from '../../domain/notifica.entity.js';

export class NotificaRepository {

  /**
   * Crea e memorizza una nuova notifica nel database
   * @param {Notifica} notifica - Istanza dell'entità Notifica
   * @returns {Promise<Notifica>} L'istanza aggiornata con ID e timestamp generati dal DB
   */
  async create(notifica) {
    const query = `
      INSERT INTO notifica (utente, titolo, contenuto)
      VALUES ($1, $2, $3)
      RETURNING id, ricezione, letta;
    `;

    const values = [
      notifica.utente,
      notifica.titolo,
      notifica.contenuto
    ];

    try {
      const result = await pool.query(query, values);
      
      // Sincronizziamo l'istanza con i metadati reali di PostgreSQL
      notifica.id = result.rows[0].id;
      notifica.ricezione = new Date(result.rows[0].ricezione);
      notifica.letta = result.rows[0].letta;

      return notifica;
    } catch (error) {
      throw new Error(`Errore durante la creazione della notifica: ${error.message}`);
    }
  }

  /**
   * Recupera lo storico delle notifiche di un utente specifico.
   * Restituisce le notifiche mappate come entità per sfruttare i metodi helper.
   * @param {number} utenteId - ID dell'utente destinatario
   * @param {number} limit - Numero massimo di notifiche da caricare (default: 20)
   * @param {number} offset - Paginazione (default: 0)
   * @returns {Promise<Array<Notifica>>} Array di istanze della classe Notifica
   */
  async findByUtenteId(utenteId, limit = 20, offset = 0) {
    const query = `
      SELECT id, utente, titolo, contenuto, letta, ricezione
      FROM notifica
      WHERE utente = $1
      ORDER BY ricezione DESC
      LIMIT $2 OFFSET $3;
    `;

    try {
      const result = await pool.query(query, [utenteId, limit, offset]);
      
      // Rimappiamo in istanze pure di Notifica, così il frontend/service 
      // può chiamare liberamente il metodo .isNonLetta()
      return result.rows.map(row => new Notifica(row));
    } catch (error) {
      throw new Error(`Errore nel recupero delle notifiche dell'utente: ${error.message}`);
    }
  }

  /**
   * Cambia lo stato di una singola notifica impostandola su "letta"
   * @param {number} id - ID della notifica
   * @returns {Promise<boolean>} true se aggiornata, false se non trovata
   */
  async segnaComeLetta(id) {
    const query = `
      UPDATE notifica
      SET letta = true
      WHERE id = $1;
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rowCount > 0;
    } catch (error) {
      throw new Error(`Errore durante l'aggiornamento della notifica: ${error.message}`);
    }
  }

  /**
   * Forza lo stato "letta = true" su tutte le notifiche pendenti di un utente.
   * Ottima per l'azione "Segna tutte come lette" nel pannello dell'app mobile.
   * @param {number} utenteId - ID dell'utente
   * @returns {Promise<number>} Il numero di notifiche che sono state effettivamente aggiornate
   */
  async segnaTutteComeLette(utenteId) {
    const query = `
      UPDATE notifica
      SET letta = true
      WHERE utente = $1 AND letta = false;
    `;

    try {
      const result = await pool.query(query, [utenteId]);
      return result.rowCount; // Restituisce quante notifiche sono passate da non lette a lette
    } catch (error) {
      throw new Error(`Errore nel segnare tutte le notifiche come lette: ${error.message}`);
    }
  }
}
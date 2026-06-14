import pool from '../database/db.js';
import Consenso from '../../domain/consenso.entity.js';

export class ConsensoRepository {

  /**
   * Salva o aggiorna il consenso di un utente (UPSERT pattern)
   * @param {Consenso} consenso - Istanza dell'entità Consenso
   * @returns {Promise<Consenso>} L'istanza del consenso salvata
   */
  async save(consenso) {
    // ON CONFLICT intercetta se la coppia (utente, tipo) esiste già,
    // e in tal caso esegue un UPDATE sul campo "fornito"
    const query = `
      INSERT INTO consenso (utente, tipo, fornito)
      VALUES ($1, $2, $3)
      ON CONFLICT (utente, tipo) 
      DO UPDATE SET fornito = EXCLUDED.fornito
      RETURNING utente, tipo, fornito;
    `;

    const values = [
      consenso.utente,
      consenso.tipo,
      consenso.fornito
    ];

    try {
      const result = await pool.query(query, values);
      // Restituiamo l'entità aggiornata con i dati reali del DB
      return new Consenso(result.rows[0]);
    } catch (error) {
      throw new Error(`Errore nel salvataggio del consenso: ${error.message}`);
    }
  }

  /**
   * Recupera lo stato di un singolo consenso specifico di un utente
   * @param {number} utenteId 
   * @param {string} tipo - 'Fotocamera', 'Galleria' o 'GNSS'
   * @returns {Promise<Consenso|null>} L'entità Consenso o null se l'utente non ha ancora espresso una scelta
   */
  async findByUtenteAndTipo(utenteId, tipo) {
    const query = `
      SELECT utente, tipo, fornito
      FROM consenso
      WHERE utente = $1 AND tipo = $2;
    `;

    try {
      // Istanziamo un Consenso temporaneo solo per sfruttare la normalizzazione della stringa 'tipo' 
      // (es. se arriva 'gnss' minuscolo dal controller, l'entità lo corregge in 'GNSS')
      const consensoTarget = new Consenso({ utente: utenteId, tipo, fornito: false });

      const result = await pool.query(query, [utenteId, consensoTarget.tipo]);
      
      if (result.rows.length === 0) return null;
      
      return new Consenso(result.rows[0]);
    } catch (error) {
      throw new Error(`Errore nel recupero del consenso specifico: ${error.message}`);
    }
  }

  /**
   * Recupera la lista di tutti i consensi espressi da uno specifico utente
   * @param {number} utenteId 
   * @returns {Promise<Array<Consenso>>} Lista delle entità Consenso dell'utente
   */
  async findAllByUtenteId(utenteId) {
    const query = `
      SELECT utente, tipo, fornito
      FROM consenso
      WHERE utente = $1;
    `;

    try {
      const result = await pool.query(query, [utenteId]);
      
      // Mappiamo ogni riga del database trasformandola in un'istanza dell'Entità Consenso
      return result.rows.map(row => new Consenso(row));
    } catch (error) {
      throw new Error(`Errore nel recupero di tutti i consensi dell'utente: ${error.message}`);
    }
  }
}
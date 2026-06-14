import pool from '../database/db.js';
import Preferenza from '../../domain/preferenza.entity.js';

export class PreferenzaRepository {

  /**
   * Salva o aggiorna la preferenza di notifica di un utente (UPSERT)
   * @param {Preferenza} preferenza - Istanza dell'entità Preferenza
   * @returns {Promise<Preferenza>} L'istanza della preferenza aggiornata con i dati reali del DB
   */
  async save(preferenza) {
    // Se la coppia (utente, argomento) esiste già, aggiorna il flag "attivo"
    const query = `
      INSERT INTO preferenza (utente, argomento, attivo)
      VALUES ($1, $2, $3)
      ON CONFLICT (utente, argomento) 
      DO UPDATE SET attivo = EXCLUDED.attivo
      RETURNING utente, argomento, attivo;
    `;

    const values = [
      preferenza.utente,
      preferenza.argomento,
      preferenza.attivo
    ];

    try {
      const result = await pool.query(query, values);
      return new Preferenza(result.rows[0]);
    } catch (error) {
      throw new Error(`Errore nel salvataggio della preferenza di notifica: ${error.message}`);
    }
  }

  /**
   * Recupera lo stato di una singola preferenza specifica di un utente
   * @param {number} utenteId 
   * @param {string} argomento - 'Sfide', 'Progressi' o 'Social'
   * @returns {Promise<Preferenza|null>} L'entità Preferenza o null se non ancora impostata
   */
  async findByUtenteAndArgomento(utenteId, argomento) {
    const query = `
      SELECT utente, argomento, attivo
      FROM preferenza
      WHERE utente = $1 AND argomento = $2;
    `;

    try {
      // Sfruttiamo l'entità temporanea per normalizzare l'input stringa (es. da "social" a "Social")
      const preferenzaTarget = new Preferenza({ utente: utenteId, argomento, attivo: false });

      const result = await pool.query(query, [utenteId, preferenzaTarget.argomento]);
      
      if (result.rows.length === 0) return null;
      
      return new Preferenza(result.rows[0]);
    } catch (error) {
      throw new Error(`Errore nel recupero della preferenza specifica: ${error.message}`);
    }
  }

  /**
   * Recupera tutte le preferenze di notifica impostate da uno specifico utente
   * Utile per caricare lo stato iniziale della schermata "Impostazioni Notifiche" nell'app
   * @param {number} utenteId 
   * @returns {Promise<Array<Preferenza>>} Lista di entità Preferenza
   */
  async findAllByUtenteId(utenteId) {
    const query = `
      SELECT utente, argomento, attivo
      FROM preferenza
      WHERE utente = $1;
    `;

    try {
      const result = await pool.query(query, [utenteId]);
      
      // Mappiamo l'array di righe del DB in istanze dell'entità Preferenza
      return result.rows.map(row => new Preferenza(row));
    } catch (error) {
      throw new Error(`Errore nel recupero di tutte le preferenze dell'utente: ${error.message}`);
    }
  }
}
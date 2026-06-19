import pool from '../database/db.js';
import Utente from '../../domain/utente.entity.js';
function formatDateOnly(value) {
  if (!value) return value;

  if (typeof value === 'string') {
    return value.split('T')[0];
  }

  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  return value;
}

export class UtenteRepository {

  /**
   * Controlla se esistono già un'email o uno username nel database.
   * Utile per dare feedback immediati durante la registrazione.
   * @returns {Promise<Object|null>} Restituisce l'oggetto duplicato o null
   */
  async checkDuplicated(email, username) {
    const query = `
      SELECT email, username 
      FROM utente 
      WHERE email = $1 OR username = $2;
    `;
    
    const result = await pool.query(query, [email.trim().toLowerCase(), username.trim()]);
    return result.rows[0] || null;
  }

  /**
   * Crea un nuovo utente nel database (Registrazione).
   * @param {Utente} utente - Istanza dell'entità Utente
   * @returns {Promise<Utente>} L'istanza dell'utente con l'ID assegnato
   */
  async create(utente) {
    const query = `
      INSERT INTO utente (nome, cognome, email, password, username, data_di_nascita, foto, copertina, admin)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id;
    `;
    
    const values = [
      utente.nome,
      utente.cognome,
      utente.email,
      utente.password,
      utente.username,
      // Converte l'oggetto Date in stringa YYYY-MM-DD usando lo standard canadese (en-CA)
      formatDateOnly(utente.data_di_nascita),
      utente.foto,
      utente.copertina,
      utente.admin
    ];

    const result = await pool.query(query, values);
    utente.id = result.rows[0].id;
    return utente;
  }

  /**
   * Trova un utente in base al suo username (Utile per il Login).
   * @returns {Promise<Utente|null>}
   */
  async findByUsername(username) {
    const query = `
      SELECT id, nome, cognome, email, password, username, data_di_nascita, foto, copertina, admin 
      FROM utente 
      WHERE username = $1;
    `;
    
    const result = await pool.query(query, [username.trim()]);
    if (result.rows.length === 0) return null;
    
    return new Utente(result.rows[0]);
  }

  /**
   * Trova un utente in base alla sua email (Utile per il Login).
   * @returns {Promise<Utente|null>}
   */
  async findByEmail(email) {
    const query = `
      SELECT id, nome, cognome, email, password, username, data_di_nascita, foto, copertina, admin 
      FROM utente 
      WHERE email = $1;
    `;
    
    const result = await pool.query(query, [email.trim().toLowerCase()]);
    if (result.rows.length === 0) return null;
    
    return new Utente(result.rows[0]);
  }

  /**
   * Trova un utente in base al suo ID (Visualizzazione Profilo).
   * @returns {Promise<Utente|null>}
   */
  async findById(id) {
    const query = `
      SELECT id, nome, cognome, email, password, username, data_di_nascita, foto, copertina, admin 
      FROM utente 
      WHERE id = $1;
    `;
    
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) return null;
    
    return new Utente(result.rows[0]);
  }

  /**
   * Aggiorna la password di un utente specifico.
   */
  async updatePassword(id, newHashedPassword) {
    const query = `
      UPDATE utente 
      SET password = $1 
      WHERE id = $2;
    `;
    const result = await pool.query(query, [newHashedPassword, id]);
    return result.rowCount === 1;
  }

  /**
   * Aggiorna l'email di un utente specifico.
   */
  async updateEmail(id, newEmail) {
    const query = `
      UPDATE utente 
      SET email = $1 
      WHERE id = $2
      RETURNING id, nome, cognome, email, username, foto, copertina;
    `;
    const result = await pool.query(query, [newEmail.trim().toLowerCase(), id]);
    return result.rows[0] || null;
  }

  // ==============================================================================
  // METODI DI AGGREGAZIONE DATI PROFILO (Allineati al nuovo DB)
  // ==============================================================================

  /**
   * Recupera i badge sbloccati da un utente specifico.
   */
  async findBadgesByUtenteId(utenteId, limit = null) {
    let query = `
      SELECT b.id, b.titolo, b.immagine, bo.ottenimento
      FROM badge b
      JOIN badge_ottenuto bo ON b.id = bo.badge
      WHERE bo.utente = $1
      ORDER BY bo.ottenimento DESC
    `;
    
    const params = [utenteId];
    if (limit) {
      query += ` LIMIT $2`;
      params.push(limit);
    }

    const result = await pool.query(query, params);
    return result.rows; 
  }

  /**
   * Recupera i post (sfide completate) per la timeline,
   * includendo il titolo della sfida e l'anagrafica dell'autore (username e foto).
   */
  /**
   * Recupera i post (sfide completate) di un utente specifico per la timeline del profilo,
   * arricchiti con i contatori di interazione e lo stato del "Mi piace".
   * @param {number} utenteId - L'ID del profilo di cui stiamo guardando i post
   * @param {number} utenteLoggatoId - L'ID dell'utente che sta usando l'app in questo momento
   * @param {number} limit 
   * @param {number} offset 
   */
  /**
   * Recupera i post (sfide completate) di un utente specifico per la timeline del profilo,
   * arricchiti con i contatori di interazione e lo stato del "Mi piace".
   */
  async findPostsByUtenteId(utenteId, utenteLoggatoId, limit = 10, offset = 0) {
    const query = `
      SELECT 
        sc.id, 
        s.titolo AS "titoloSfida", 
        sc.descrizione, 
        sc.luogo, 
        sc.difficolta_attesa AS "difficoltaAttesa",
        sc.difficolta_percepita AS "difficoltaPercepita",
        sc.pubblicazione,
        u.username AS "autoreUsername",
        u.foto AS "autoreFoto",
        COUNT(DISTINCT lsc.utente) AS "totaleLike",
        COUNT(DISTINCT c.id) AS "totaleCommenti",
        EXISTS (
          SELECT 1
          FROM like_sfida_completata lsc_me
          WHERE lsc_me.sfida_completata = sc.id
            AND lsc_me.utente = $2
        ) AS "messoDaMe",
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', m.id,
                'tipo', m.tipo,
                'url', m.url
              )
            )
            FROM media m
            WHERE m.sfida_completata = sc.id
          ),
          '[]'
        ) AS media
      FROM sfida_completata sc
      JOIN sfida s ON sc.sfida = s.id
      JOIN utente u ON sc.utente = u.id
      LEFT JOIN like_sfida_completata lsc ON lsc.sfida_completata = sc.id
      LEFT JOIN commento c ON c.sfida_completata = sc.id
      WHERE sc.utente = $1
      GROUP BY sc.id, s.titolo, u.username, u.foto
      ORDER BY sc.pubblicazione DESC
      LIMIT $3 OFFSET $4;
    `;

    try {
      // Passiamo tutti e 4 i parametri nell'ordine corretto mappato sui segnaposto ($1, $2, $3, $4)
      const result = await pool.query(query, [utenteId, utenteLoggatoId, limit, offset]);
      return result.rows;
    } catch (error) {
      throw new Error(
        `Errore nel recupero dei post dell'utente: ${error.message}`
      );
    }
  }

  /**
   * Aggiorna la foto profilo e/o la copertina di un utente.
   * Se uno dei due path è null, COALESCE mantiene il valore già presente a database.
   * @param {number} id - ID dell'utente
   * @param {Object} paths
   * @param {string|null} paths.foto - Nuovo path foto o null
   * @param {string|null} paths.copertina - Nuovo path copertina o null
   * @returns {Promise<Object|null>} I campi aggiornati
   */
  async updateProfileMedia(id, { foto, copertina }) {
    const query = `
      UPDATE utente 
      SET 
        foto = COALESCE($1, foto),
        copertina = COALESCE($2, copertina)
      WHERE id = $3
      RETURNING id, foto, copertina;
    `;
    
    const result = await pool.query(query, [foto, copertina, id]);
    return result.rows[0] || null;
  }
}
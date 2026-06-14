class Utente {
  /**
   * Costruttore dell'entità User
   * @param {Object} params
   * @param {number} [params.id] - ID seriale (assente in fase di prima registrazione)
   * @param {string} params.nome - Nome dell'utente
   * @param {string} params.cognome - Cognome dell'utente
   * @param {string} params.email - Email dell'utente
   * @param {string} params.password - Stringa dell'hash della password (gestita dal CryptoService)
   * @param {string} params.username - Username univoco
   * @param {Date|string} params.dataNascita - Data di nascita (conservata per vincoli di database/controllo minore età)
   * @param {string|null} [params.foto=null] - URL o path della foto profilo
   * @param {string|null} [params.copertina=null] - URL o path dell'immagine di copertina
   * @param {boolean} [params.admin=false] - Flag per i privilegi di amministratore
   */
  constructor({ 
    id, 
    nome, 
    cognome, 
    email, 
    password, 
    username, 
    data_di_nascita, 
    foto = null, 
    copertina = null, 
    admin = false 
  }) {
    this.id = id;
    this.nome = nome;
    this.cognome = cognome;
    this.email = email;
    this.password = password; // Contiene SEMPRE la password già hashata
    this.username = username;
    this.data_di_nascita = data_di_nascita instanceof Date ? data_di_nascita : new Date(data_di_nascita);
    this.foto = foto;
    this.copertina = copertina;
    this.admin = Boolean(admin);
  }

  /**
   * Metodo di utilità per ottenere il nome completo dell'utente
   * @returns {string}
   * @example "Mario Rossi"
   */
  getNomeCompleto() {
    return `${this.nome} ${this.cognome}`;
  }

  /**
   * Verifica se l'utente ha i privilegi di amministratore
   * @returns {boolean}
   */
  isAdmin() {
    return this.admin === true;
  }
}

export default Utente;
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class CryptoService {
  /**
   * Genera un hash sicuro a partire da una password in chiaro.
   * @param {string} password - La password inserita dall'utente.
   * @returns {Promise<string>} La password cifrata da salvare nel DB.
   */
  async hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Verifica se una password in chiaro corrisponde all'hash salvato nel DB.
   * @param {string} password - La password inserita nel form di login.
   * @param {string} hashedPassword - L'hash recuperato dal database.
   * @returns {Promise<boolean>} true se corrisponde, altrimenti false.
   */
  async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  /**
   * Genera un token JWT per la sessione dell'utente.
   * @param {Object} payload - Dati da inserire nel token (es. { id, admin }).
   * @returns {string} Il token JWT firmato.
   */
  generateToken(payload) {
    const secret = process.env.JWT_SECRET;
    // Allineato con la variabile del .env discussa prima (con fallback di sicurezza)
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d'; 

    if (!secret) {
      throw new Error("Errore di configurazione: JWT_SECRET non definito nel file .env");
    }

    return jwt.sign(payload, secret, { expiresIn });
  }

  /**
   * Verifica e decodifica un token JWT.
   * @param {string} token - Il token ricevuto dal frontend.
   * @returns {Object} Il payload decodificato (i dati dell'utente).
   */
  verifyToken(token) {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("Errore di configurazione: JWT_SECRET non definito nel file .env");
    }

    try {
      return jwt.verify(token, secret);
    } catch (error) {
      throw error; // Rilancia l'errore (scaduto o manomesso) per gestirlo nel middleware
    }
  }
}
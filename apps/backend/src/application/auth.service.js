import Utente from '../domain/utente.entity.js';
import { UtenteRepository } from '../infrastructure/repositories/utente.repository.js';

export class AuthService {
  constructor({ utenteRepository, cryptoService }) {
    this.utenteRepository = utenteRepository;
    this.cryptoService = cryptoService;
  }
generateTemporaryPassword() {
  const randomNumber = Math.floor(10000 + Math.random() * 90000);
  return `OutGrow-${randomNumber}!`;
}

async forgotPassword(email) {
  const normalizedEmail = email.trim().toLowerCase();

  const utente = await this.utenteRepository.findByEmail(normalizedEmail);

  if (!utente) {
    return {
      message:
        "Se l'email è associata a un account, riceverai una password temporanea.",
    };
  }

  const temporaryPassword = this.generateTemporaryPassword();
  const hashedPassword = await this.cryptoService.hashPassword(temporaryPassword);

  await this.utenteRepository.updatePassword(utente.id, hashedPassword);

  console.log('====================================');
  console.log('RECUPERO PASSWORD OUTGROW');
  console.log(`Email: ${utente.email}`);
  console.log(`Username: ${utente.username}`);
  console.log(`Password temporanea: ${temporaryPassword}`);
  console.log('====================================');

  return {
    message:
      'Password temporanea generata. Controlla i log del backend per visualizzarla.',
  };
}
  async register(entityData) {
    // 1. Controllo duplicati (Email o Username esistenti)
    const duplicate = await this.utenteRepository.checkDuplicated(entityData.email, entityData.username);
    if (duplicate) {
      const field = duplicate.email.toLowerCase() === entityData.email.toLowerCase() ? 'email' : 'username';
      const error = new Error(`Questo indirizzo ${field} è già registrato.`);
      error.type = 'ConflictError';
      error.field = field;
      throw error;
    }

    // 2. Hashing della password prima di toccare l'entità o il DB
    const hashedPassword = await this.cryptoService.hashPassword(entityData.password);
    
    // 3. Creazione dell'istanza dell'Entità Utente del Dominio
    const nuovoUtente = new Utente({
      ...entityData,
      password: hashedPassword // Sostituiamo la password in chiaro con l'hash
    });

    // 4. Salvataggio definitivo nel database tramite Repository
    const utenteSalvato = await this.utenteRepository.create(nuovoUtente);

    // 5. Generazione del Token JWT per effettuare il login automatico post-registrazione
    const token = this.cryptoService.generateToken({ 
      id: utenteSalvato.id, 
      admin: utenteSalvato.admin 
    });

    // Ritorniamo i dati utili al frontend (escludendo la password) e il token di sessione
    return {
      user: {
        id: utenteSalvato.id,
        nome: utenteSalvato.nome,
        cognome: utenteSalvato.cognome,
        email: utenteSalvato.email,
        username: utenteSalvato.username,
        foto: utenteSalvato.foto,
        copertina: utenteSalvato.copertina
      },
      token
    };
  }

  async login(username, password) {
    // 1. Cerchiamo l'utente nel database tramite lo username
    const utente = await this.utenteRepository.findByUsername(username);
    
    // 2. Se l'utente non esiste, lanciamo un errore generico di credenziali non valide
    // Nota di sicurezza: Non specifichiamo se è lo username o la password ad essere errati per evitare "User Enumeration"
    if (!utente) {
      const error = new Error('Credenziali non valide. Riprova.');
      error.type = 'UnauthorizedError';
      throw error;
    }

    // 3. Verifichiamo se la password inserita corrisponde all'hash salvato nel DB
    const passwordCorretta = await this.cryptoService.comparePassword(password, utente.password);
    if (!passwordCorretta) {
      const error = new Error('Credenziali non valide. Riprova.');
      error.type = 'UnauthorizedError';
      throw error;
    }

    // 4. Se le credenziali sono corrette, generiamo un nuovo Token JWT di sessione
    const token = this.cryptoService.generateToken({ 
      id: utente.id, 
      admin: utente.admin 
    });

    // 5. Restituiamo i dati dell'utente (senza password) e il token per Axios
    return {
      user: {
        id: utente.id,
        nome: utente.nome,
        cognome: utente.cognome,
        email: utente.email,
        username: utente.username,
        foto: utente.foto,
        copertina: utente.copertina
      },
      token
    };
  }

  /**
   * Modifica l'email di un utente verificando che non sia già duplicata
   * @param {number} utenteId - ID dell'utente loggato
   * @param {UpdateEmailDto} updateEmailDto - DTO con la nuova email
   */
  async updateEmail(utenteId, updateEmailDto) {
    const { email } = updateEmailDto;

    // 1. Controlla se l'email è già in uso da un ALTRO utente
    const duplicateCheck = await this.utenteRepository.checkDuplicated(email, '');
    
    if (duplicateCheck && duplicateCheck.email === email) {
      const error = new Error("Questa email è già associata a un altro account.");
      error.statusCode = 400;
      error.type = "ValidationError";
      throw error;
    }

    // 2. Esegui l'aggiornamento sul database
    const updatedUser = await this.utenteRepository.updateEmail(utenteId, email);

    if (!updatedUser) {
      const error = new Error("Utente non trovato o aggiornamento fallito.");
      error.statusCode = 404;
      error.type = "NotFoundError";
      throw error;
    }

    // 3. Ritorna i dati aggiornati al controller
    return {
      id: updatedUser.id,
      nome: updatedUser.nome,
      cognome: updatedUser.cognome,
      email: updatedUser.email,
      username: updatedUser.username,
      foto: updatedUser.foto,
      copertina: updatedUser.copertina
    };
  }

  /**
   * Modifica la password di un utente previa verifica della vecchia password
   * @param {number} utenteId - ID dell'utente loggato
   * @param {UpdatePasswordDto} updatePasswordDto - DTO con vecchia e nuova password
   */
  async updatePassword(utenteId, updatePasswordDto) {
    const { oldPassword, newPassword } = updatePasswordDto;

    // 1. Recupera l'utente dal database per estrarre l'hash della password attuale
    const utente = await this.utenteRepository.findById(utenteId);
    if (!utente) {
      const error = new Error("Utente non trovato.");
      error.statusCode = 404;
      error.type = "NotFoundError";
      throw error;
    }

    // 2. Verifica se la vecchia password inserita corrisponde all'hash memorizzato
    const passwordCorretta = await this.cryptoService.comparePassword(oldPassword, utente.password);
    if (!passwordCorretta) {
      const error = new Error("La vecchia password inserita non è corretta.");
      error.statusCode = 400;
      error.type = "ValidationError";
      throw error;
    }

    // 3. Genera il nuovo salted hash per la nuova password
    const hashedNewPassword = await this.cryptoService.hashPassword(newPassword);

    // 4. Salva la nuova password nel database tramite il repository
    const successo = await this.utenteRepository.updatePassword(utenteId, hashedNewPassword);
    if (!successo) {
      const error = new Error("Impossibile aggiornare la password. Errore di persistenza.");
      error.statusCode = 500;
      error.type = "DatabaseError";
      throw error;
    }

    return true;
  }
}
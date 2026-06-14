import { CryptoService } from '../../infrastructure/security/crypto.service.js';

const cryptoService = new CryptoService();

export const requireAuth = async (req, res, next) => {
  try {
    // 1. Recuperiamo l'header 'Authorization' dalla richiesta
    const authHeader = req.headers.authorization;

    // 2. Verifichiamo che l'header esista e inizi con la parola 'Bearer ' (convenzione standard)
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error = new Error('Accesso negato. Token di autenticazione mancante o non valido.');
      error.statusCode = 401;
      error.type = 'UnauthorizedError';
      throw error;
    }

    // 3. Estraiamo il token stringa scartando la parola 'Bearer '
    const token = authHeader.split(' ')[1];

    // 4. Chiediamo al CryptoService di verificare e decodificare il token
    // Se il token è scaduto o contraffatto, verifyToken lancerà automaticamente un errore
    const decodedPayload = cryptoService.verifyToken(token);

    // 5. Questa è la magia: salviamo i dati decodificati (id e admin) dentro l'oggetto 'req'
    // In questo modo, qualsiasi controller che viene DOPO questo middleware saprà chi è l'utente!
    req.userId = decodedPayload.id;
    req.userAdmin = decodedPayload.admin;

    // 6. Tutto è a posto, passiamo il controllo al prossimo middleware o al controller
    next();
  } catch (error) {
    // Se l'errore è stato lanciato da jwt.verify (es. token scaduto o firma non valida)
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        type: 'UnauthorizedError',
        message: error.name === 'TokenExpiredError' ? 'Sessione scaduta. Effettua nuovamente il login.' : 'Token non valido.'
      });
    }

    // Altrimenti passiamo l'errore al gestore globale
    next(error);
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Nessun token presente: procedi come utente anonimo
    }

    const token = authHeader.split(' ')[1];
    const decodedPayload = cryptoService.verifyToken(token);

    // Se il token è valido, popoliamo la richiesta con i dati dell'utente
    req.userId = decodedPayload.id;
    req.userAdmin = decodedPayload.admin;
    
    next();
  } catch (error) {
    // Se il token è scaduto o non valido, non blocchiamo la visualizzazione pubblica.
    // Trattiamo semplicemente l'utente come ospite anonimo.
    next();
  }
};
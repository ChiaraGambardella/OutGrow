import { AuthService } from '../../application/auth.service.js';
import { RegisterDto } from '../dtos/register.dto.js';
import { UpdateEmailDto } from '../dtos/update.email.dto.js';
import { UpdatePasswordDto } from '../dtos/update.password.dto.js';

export class AuthController {
  constructor({ authService }) {
    this.authService = authService;
  }
  forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const result = await this.authService.forgotPassword(email);

    return res.status(200).json({
      status: 'success',
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

  register = async (req, res, next) => {
    try {
      // req.body a questo punto è già validato ed è un'istanza pulita di RegisterDto
      const registerDto = new RegisterDto(req.body);
      
      // Trasforma i dati in snake_case per il dominio
      const entityData = registerDto.toEntityData();

      // Esegue la logica dei servizi dell'applicazione
      const result = await this.authService.register(entityData);

      return res.status(201).json({
        status: 'success',
        message: 'Utente registrato con successo!',
        data: result
      });
    } catch (error) {
      // Gestione specifica dell'errore di duplicazione
      if (error.type === 'ConflictError') {
        return res.status(409).json({
          status: 'error',
          type: 'ConflictError',
          errors: [{ field: error.field, message: error.message }]
        });
      }
      next(error); // Passa gli errori imprevisti al middleware di crash globale
    }
  };

  login = async (req, res, next) => {
    try {
      // req.body a questo punto è già validato da Zod ed è conforme a LoginDTO
      const { username, password } = req.body;

      // Chiamiamo il metodo del servizio applicativo
      const result = await this.authService.login(username, password);

      return res.status(200).json({
        status: 'success',
        message: 'Autenticazione effettuata con successo!',
        data: result
      });
    } catch (error) {
      // Catturiamo l'errore di credenziali errate e rispondiamo con status 401 (Unauthorized)
      if (error.type === 'UnauthorizedError') {
        return res.status(401).json({
          status: 'error',
          type: 'UnauthorizedError',
          message: error.message
        });
      }
      next(error); // Passa al globalErrorHandler in caso di imprevisti (es. DB offline)
    }
  };
  
  /**
   * Gestisce la richiesta di aggiornamento dell'email dell'utente
   */
  updateEmail = async (req, res, next) => { // Trasformata in arrow function per coerenza
    try {
      const utenteId = req.userId; // Preso correttamente dal middleware
      
      // Sanitizzazione input tramite il DTO
      const updateEmailDto = UpdateEmailDto.fromRequest(req.body);

      // AGGIUNTO 'this.' davanti ad authService per pescare l'istanza iniettata
      const result = await this.authService.updateEmail(utenteId, updateEmailDto);

      return res.status(200).json({
        status: 'success',
        message: 'Email aggiornata con successo.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Gestisce la richiesta di aggiornamento della password dell'utente
   */
  updatePassword = async (req, res, next) => {
    try {
      const utenteId = req.userId; // Preso dal middleware di autenticazione

      // Sanitizzazione input tramite il DTO
      const updatePasswordDto = UpdatePasswordDto.fromRequest(req.body);

      // Esegue la logica del servizio applicativo
      await this.authService.updatePassword(utenteId, updatePasswordDto);

      return res.status(200).json({
        status: 'success',
        message: 'Password aggiornata con successo.'
      });
    } catch (error) {
      // Catturiamo l'errore di validazione (es. vecchia password errata)
      if (error.type === 'ValidationError') {
        return res.status(error.statusCode || 400).json({
          status: 'error',
          type: error.type,
          message: error.message
        });
      }
      next(error); // Errori imprevisti al globalErrorHandler
    }
  };
}
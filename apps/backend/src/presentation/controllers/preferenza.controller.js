import { UpdatePreferencesDto } from '../dtos/preferenze.dto.js';

export class PreferenzaController {
  constructor({ preferenzaService }) {
    this.preferenzaService = preferenzaService;
  }

  /**
   * Recupera le preferenze di notifica correnti dell'utente autenticato
   */
  getPreferences = async (req, res, next) => {
    try {
      const utenteId = req.userId;
      const result = await this.preferenzaService.getPreferences(utenteId);

      return res.status(200).json({
        status: 'success',
        message: 'Preferenze notificate recuperate con successo.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Aggiorna lo stato dei toggle delle notifiche
   */
  updatePreferences = async (req, res, next) => {
    try {
      const utenteId = req.userId;
      const dto = UpdatePreferencesDto.fromRequest(req.body);

      const result = await this.preferenzaService.updatePreferences(utenteId, dto);

      return res.status(200).json({
        status: 'success',
        message: 'Preferenze di notifica aggiornate con successo.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };
}
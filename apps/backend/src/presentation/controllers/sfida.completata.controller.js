import { SfidaCompletataResponseDto } from '../dtos/sfida.completata.dto.js';
import { LikeSfidaCompletataResponseDto } from '../dtos/sfida.completata.dto.js';

export class SfidaCompletataController {
  constructor({ sfidaCompletataService }) {
    this.sfidaCompletataService = sfidaCompletataService;
  }

  addSfidaCompletata = async (req, res, next) => {
    try {
      const utenteLoggatoId = req.userId;
      const sfidaId = parseInt(req.params.sfidaId, 10);

      if (isNaN(sfidaId)) {
        const error = new Error("Identificativo della sfida non valido.");
        error.statusCode = 400;
        error.type = 'ValidationError';
        throw error;
      }

      const risultato = await this.sfidaCompletataService.addSfidaCompletata(
        utenteLoggatoId,
        sfidaId,
        req.body,
        req.files || [] // Multer popola req.file per upload singoli (.single)
      );

      const postFormattato = SfidaCompletataResponseDto.format(risultato.sfida, risultato.media);

      return res.status(201).json({
        status: 'success',
        message: 'Sfida settimanale completata e Badge sbloccato con successo!',
        data: {
          post: postFormattato
        }
      });
    } catch (error) {
      next(error);
    }
  };

  toggleLike = async (req, res, next) => {
    try {
      const utenteLoggatoId = req.userId; // Popolato dal middleware requireAuth
      const sfidaCompletataId = parseInt(req.params.sfidaCompletataId, 10);

      if (isNaN(sfidaCompletataId)) {
        const error = new Error("Identificativo della sfida completata non valido.");
        error.statusCode = 400;
        error.type = 'ValidationError';
        throw error;
      }

      const risultato = await this.sfidaCompletataService.toggleLike(utenteLoggatoId, sfidaCompletataId);
      const result = LikeSfidaCompletataResponseDto.format(risultato);

      return res.status(200).json({
        status: 'success',
        message: risultato.liked ? 'Mi piace aggiunto con successo.' : 'Mi piace rimosso con successo.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };
}
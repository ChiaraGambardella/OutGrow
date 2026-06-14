import { CommentResponseDto, LikeCommentoResponseDto } from '../dtos/commento.dto.js';

export class CommentoController {
  constructor({ commentoService }) {
    this.commentoService = commentoService;
  }

  addComment = async (req, res, next) => {
    try {
      const utenteLoggatoId = req.userId;
      const postId = parseInt(req.params.postId, 10);
      const { text } = req.body;

      if (isNaN(postId)) {
        const error = new Error("Identificativo del post non valido.");
        error.statusCode = 400;
        error.type = 'ValidationError';
        throw error;
      }

      const commentoCreato = await this.commentoService.addComment(utenteLoggatoId, postId, text);
      const result = CommentResponseDto.format(commentoCreato);

      return res.status(201).json({
        status: 'success',
        message: 'Commento inserito con successo.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  addReply = async (req, res, next) => {
    try {
      const utenteLoggatoId = req.userId;
      const commentoPadreId = parseInt(req.params.commentoPadreId, 10);
      const { text } = req.body;

      if (isNaN(commentoPadreId)) {
        const error = new Error("Identificativo del commento non valido.");
        error.statusCode = 400;
        error.type = 'ValidationError';
        throw error;
      }

      const rispostaCreata = await this.commentoService.addReply(utenteLoggatoId, commentoPadreId, text);
      const result = CommentResponseDto.format(rispostaCreata);

      return res.status(201).json({
        status: 'success',
        message: 'Risposta inserita con successo.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  toggleLike = async (req, res, next) => {
    try {
      const utenteLoggatoId = req.userId;
      const commentoId = parseInt(req.params.commentoId, 10);

      if (isNaN(commentoId)) {
        const error = new Error("Identificativo del commento non valido.");
        error.statusCode = 400;
        error.type = 'ValidationError';
        throw error;
      }

      const risultato = await this.commentoService.toggleLike(utenteLoggatoId, commentoId);
      const result = LikeCommentoResponseDto.format(risultato);

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
import { SfidaService } from '../../application/sfida.service.js';
import { formatWeeklyChallengeResponse } from '../dtos/sfida.dto.js';

const sfidaService = new SfidaService();

export const getWeeklyChallenge = async (req, res, next) => {
  try {
    // req.userId potrebbe essere valorizzato o undefined grazie a optionalAuth
    const userId = req.userId || null;

    const { challenge, completata } = await sfidaService.getWeeklyChallengeData(userId);

    // Formattiamo la risposta usando il DTO dedicato
    const formattedData = formatWeeklyChallengeResponse(challenge, completata);

    return res.status(200).json({
      status: 'success',
      data: formattedData
    });
  } catch (error) {
    next(error);
  }
};
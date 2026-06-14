import Consenso from '../domain/consenso.entity.js';

export class UtenteService {
  constructor({ utenteRepository, consensoRepository }) {
    this.utenteRepository = utenteRepository;
    this.consensoRepository = consensoRepository;
  }

  async getMyProfile(utenteId) {
    const utente = await this.utenteRepository.findById(utenteId);

    if (!utente) {
      const error = new Error('Utente non trovato.');
      error.statusCode = 404;
      error.type = 'NotFoundError';
      throw error;
    }

    const badges = await this.utenteRepository.findBadgesByUtenteId(utente.id);
    const posts = await this.utenteRepository.findPostsByUtenteId(
      utente.id,
      utente.id,
      10,
      0
    );

    return { utente, badges, posts };
  }

  async getProfiloPubblico(username, utenteLoggatoId) {
    const utente = await this.utenteRepository.findByUsername(username);

    if (!utente) {
      const error = new Error(
        `L'utente con username @${username} non è stato trovato.`
      );
      error.statusCode = 404;
      error.type = 'NotFoundError';
      throw error;
    }

    const badges = await this.utenteRepository.findBadgesByUtenteId(utente.id);
    const posts = await this.utenteRepository.findPostsByUtenteId(
      utente.id,
      utenteLoggatoId ?? utente.id,
      10,
      0
    );

    return { utente, badges, posts };
  }

  async updateProfileMedia(utenteId, data, files) {
    const tipiDaVerificare = new Set();

    if (files?.foto && files.foto.length > 0) {
      if (data.sorgenteMediaFoto === 'galleria') {
        tipiDaVerificare.add('Galleria');
      }

      if (data.sorgenteMediaFoto === 'fotocamera') {
        tipiDaVerificare.add('Fotocamera');
      }
    }

    if (files?.copertina && files.copertina.length > 0) {
      if (data.sorgenteMediaCopertina === 'galleria') {
        tipiDaVerificare.add('Galleria');
      }

      if (data.sorgenteMediaCopertina === 'fotocamera') {
        tipiDaVerificare.add('Fotocamera');
      }
    }

    if (data.consensi) {
      for (const [tipo, fornito] of Object.entries(data.consensi)) {
        if (fornito !== undefined) {
          const nuovoConsenso = new Consenso({
            utente: utenteId,
            tipo,
            fornito,
          });

          await this.consensoRepository.save(nuovoConsenso);
        }
      }
    }

    for (const tipo of tipiDaVerificare) {
      const consenso = await this.consensoRepository.findByUtenteAndTipo(
        utenteId,
        tipo
      );

      if (consenso && consenso.fornito === false) {
        const error = new Error(
          `Funzionalità non disponibile. È necessario fornire il consenso per: ${tipo}.`
        );
        error.statusCode = 403;
        error.type = 'PermissionDeniedError';
        throw error;
      }
    }

    const fotoPath = files?.foto
      ? `uploads/profiles/${files.foto[0].filename}`
      : null;

    const copertinaPath = files?.copertina
      ? `uploads/profiles/${files.copertina[0].filename}`
      : null;

    if (!fotoPath && !copertinaPath) {
      const error = new Error(
        "Nessun file multimediale ricevuto per l'aggiornamento."
      );
      error.statusCode = 400;
      error.type = 'ValidationError';
      throw error;
    }

    const mediaAggiornati = await this.utenteRepository.updateProfileMedia(
      utenteId,
      {
        foto: fotoPath,
        copertina: copertinaPath,
      }
    );

    return mediaAggiornati;
  }
}
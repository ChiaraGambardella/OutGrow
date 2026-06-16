function getInitials(nome, cognome, username) {
  const first = nome?.trim()?.[0] ?? username?.trim()?.[0] ?? 'U';
  const second = cognome?.trim()?.[0] ?? '';

  return `${first}${second}`.toUpperCase();
}

function toProfileResponse({ utente, badges = [], posts = [] }) {
  const fullName = [utente.nome, utente.cognome].filter(Boolean).join(' ');

  return {
    id: utente.id,
    nome: utente.nome,
    cognome: utente.cognome,
    name: fullName,
    email: utente.email,
    username: utente.username,
    initials: getInitials(utente.nome, utente.cognome, utente.username),
    foto: utente.foto,
    copertina: utente.copertina,
    profilePictureUrl: utente.foto,

    badges: badges.map((badge) => ({
      id: badge.id,
      titolo: badge.titolo,
      title: badge.titolo,
      immagine: badge.immagine,
      icon: '🎖️',
      ottenimento: badge.ottenimento,
    })),

    posts: posts.map((post) => ({
      id: post.id,
      titoloSfida: post.titoloSfida,
      title: post.titoloSfida,
      descrizione: post.descrizione,
      description: post.descrizione,
      luogo: post.luogo,
      location: post.luogo,
      difficoltaAttesa: post.difficoltaAttesa,
      expectedDifficulty: post.difficoltaAttesa,
      difficoltaPercepita: post.difficoltaPercepita,
      perceivedDifficulty: post.difficoltaPercepita,
      pubblicazione: post.pubblicazione,
      autoreUsername: post.autoreUsername,
      autoreFoto: post.autoreFoto,
      totaleLike: Number(post.totaleLike ?? 0),
      totaleCommenti: Number(post.totaleCommenti ?? 0),
      messoDaMe: Boolean(post.messoDaMe),
      media: post.media ?? [],
    })),

    progress: {
      completedChallenges: posts.length,
      earnedBadges: badges.length,
    },
  };
}

export class UtenteController {
  constructor({ utenteService }) {
    this.utenteService = utenteService;
  }

  getMyProfile = async (req, res, next) => {
    try {
      const utenteId = req.userId;

      const profileData = await this.utenteService.getMyProfile(utenteId);
      const profile = toProfileResponse(profileData);

      return res.status(200).json({
        status: 'success',
        message: 'Profilo personale recuperato con successo.',
        data: profile,
      });
    } catch (error) {
      if (error.type === 'NotFoundError') {
        return res.status(404).json({
          status: 'error',
          type: 'NotFoundError',
          message: error.message,
        });
      }

      next(error);
    }
  };

  getProfiloByUsername = async (req, res, next) => {
    try {
      const { username } = req.params;
      const utenteLoggatoId = req.userId;

      const profileData = await this.utenteService.getProfiloPubblico(
        username,
        utenteLoggatoId
      );

      const profile = toProfileResponse(profileData);

      return res.status(200).json({
        status: 'success',
        message: 'Profilo utente recuperato con successo.',
        data: profile,
      });
    } catch (error) {
      if (error.type === 'NotFoundError') {
        return res.status(404).json({
          status: 'error',
          type: 'NotFoundError',
          message: error.message,
        });
      }

      next(error);
    }
  };

  updateProfileMedia = async (req, res, next) => {
    try {
      const utenteId = req.userId;
      const data = req.body;
      const files = req.files;

      const result = await this.utenteService.updateProfileMedia(
        utenteId,
        data,
        files
      );

      return res.status(200).json({
        status: 'success',
        message: 'Grafiche del profilo aggiornate con successo.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
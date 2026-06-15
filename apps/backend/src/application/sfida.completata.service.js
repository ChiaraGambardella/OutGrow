import SfidaCompletata from '../domain/sfida.completata.entity.js';
import Media from '../domain/media.entity.js';
import Consenso from '../domain/consenso.entity.js';
import LikeSfidaCompletata from '../domain/like.sfida.completata.entity.js';
import BadgeOttenuto from '../domain/badge.ottenuto.entity.js';

export class SfidaCompletataService {
  constructor({ sfidaCompletataRepository, mediaRepository, consensoRepository, sfidaRepository, likeSfidaCompletataRepository, badgeOttenutoRepository }) {
    this.sfidaCompletataRepository = sfidaCompletataRepository;
    this.mediaRepository = mediaRepository;
    this.consensoRepository = consensoRepository;
    this.sfidaRepository = sfidaRepository;
    this.likeSfidaCompletataRepository = likeSfidaCompletataRepository;
    this.badgeOttenutoRepository = badgeOttenutoRepository;
  }

  async addSfidaCompletata(utenteId, sfidaId, data, files = []) {
    // 1. Validazione esistenza sfida
    const sfidaEsistente = await this.sfidaRepository.findById(sfidaId);
    if (!sfidaEsistente) {
      const error = new Error("La sfida che stai cercando di completare non esiste.");
      error.statusCode = 404;
      error.type = 'NotFoundError';
      throw error;
    }

    // 2. Analisi dei consensi richiesti dall'azione corrente
    const tipiDaVerificare = [];
    if (files.length > 0) {
      // Determiniamo il tipo in base alla logica della sorgente o del file passato
      if (data.sorgenteMedia === 'galleria') tipiDaVerificare.push('Galleria');
      if (data.sorgenteMedia === 'fotocamera') tipiDaVerificare.push('Fotocamera');
    }
    if (data.latitude || data.longitude || data.locationName) {
      tipiDaVerificare.push('GNSS');
    }

    // Se il frontend ci passa esplicitamente i nuovi stati dei consensi, eseguiamo l'UPSERT (.save)
    if (data.consensi) {
      for (const [tipo, fornito] of Object.entries(data.consensi)) {
        if (fornito !== undefined) {
          const nuovoConsenso = new Consenso({ utente: utenteId, tipo, fornito });
          await this.consensoRepository.save(nuovoConsenso);
        }
      }
    }

    // Blocco preventivo se una risorsa necessaria risulta esplicitamente disattivata (fornito === false)
    for (const tipo of tipiDaVerificare) {
      const consenso = await this.consensoRepository.findByUtenteAndTipo(utenteId, tipo);
      if (consenso && consenso.fornito === false) {
        const error = new Error(`Funzionalità non disponibile. È necessario fornire il consenso per: ${tipo}.`);
        error.statusCode = 403;
        error.type = 'PermissionDeniedError';
        throw error;
      }
    }

    // 3. Creazione del Post (Mappato sui campi reali del DB)
    const nuovaSfida = new SfidaCompletata({
      utente: utenteId,
      sfida: sfidaId,
      descrizione: data.description || null,
      latitudine: data.latitude ? parseFloat(data.latitude) : null,
      longitudine: data.longitude ? parseFloat(data.longitude) : null,
      luogo: data.locationName || null,
      difficolta_attesa: data.difficoltaAttesa || null,
      difficolta_percepita: data.difficoltaPercepita || null
    });

    // Esegue internamente post.haPosizioneValida() come definito nel tuo repository
    const sfidaSalvata = await this.sfidaCompletataRepository.create(nuovaSfida);

    // 4. Persistenza del Media (Usa la colonna 'url')
    const mediaSalvati = [];

    for (const file of files) {
      const nuovoMedia = new Media({
        sfida_completata: sfidaSalvata.id,
        tipo: file.mimetype.startsWith('image/') ? 'Immagine' : 'Video',
        url: `uploads/posts/${file.filename}`,
      });

      const mediaSalvato = await this.mediaRepository.create(nuovoMedia);
      mediaSalvati.push(mediaSalvato);
    }

    // 5. Logica di Assegnazione Automatica del Badge
    if (sfidaEsistente.badge) {
      const nuovoBadgeOttenuto = new BadgeOttenuto({
        utente: utenteId,
        badge: sfidaEsistente.badge
      });
      await this.badgeOttenutoRepository.assegnaBadge(nuovoBadgeOttenuto);
    }

    return { 
      sfida: sfidaSalvata, 
      media: mediaSalvati
    };
  }

  /**
   * Mette o toglie il mi piace a una sfida completata (Post)
   * @param {number} utenteId 
   * @param {number} sfidaCompletataId 
   * @returns {Promise<{ liked: boolean }>}
   */
  async toggleLike(utenteId, sfidaCompletataId) {
    // 1. Verifichiamo che la sfida completata esista davvero prima di inserire il like
    const sfidaCompletataEsistente = await this.sfidaCompletataRepository.findById(sfidaCompletataId);
    if (!sfidaCompletataEsistente) {
      const error = new Error("La sfida completata a cui stai cercando di mettere mi piace non esiste.");
      error.statusCode = 404;
      error.type = 'NotFoundError';
      throw error;
    }

    // 2. Controlliamo se l'utente ha già inserito il mi piace
    const giaMesso = await this.likeSfidaCompletataRepository.checkMessoDaMe(utenteId, sfidaCompletataId);

    if (giaMesso) {
      // Se esiste, lo rimuoviamo (Unlike) usando il metodo del tuo repository
      await this.likeSfidaCompletataRepository.rimuovi(utenteId, sfidaCompletataId);
      return { liked: false };
    } else {
      // Se non esiste, creiamo l'entità e la inseriamo (Like)
      const nuovoLike = new LikeSfidaCompletata({ utente: utenteId, sfida_completata: sfidaCompletataId });
      await this.likeSfidaCompletataRepository.aggiungi(nuovoLike);
      return { liked: true };
    }
  }
}
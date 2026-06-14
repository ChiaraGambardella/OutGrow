/**
 * Trasforma i dati grezzi del database nel formato concordato per il client.
 * @param {Object} challengeData - Record della sfida unito al badge
 * @param {boolean|null} completata - Stato di completamento (null se utente anonimo)
 */
export const formatWeeklyChallengeResponse = (challengeData, completata) => {
  if (!challengeData) return null;

  return {
    id: challengeData.id,
    titolo: challengeData.titolo,
    descrizione: challengeData.descrizione,
    immagineSfida: challengeData.immagineSfida,
    badge: {
      id: challengeData.badgeId,
      immagine: challengeData.immagineBadge
    },
    completata: completata
  };
};
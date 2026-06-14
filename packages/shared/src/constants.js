/**
 * 1. TESTI DELLE NOTIFICHE IN-APP (Semplici e non cliccabili)
 * Centralizziamo i messaggi che il sistema invierà agli utenti.
 * Il backend userà queste stringhe per popolare la tabella delle notifiche,
 * e il frontend le mostrerà direttamente nella schermata delle notifiche.
 */
export const NOTIFICATION_MESSAGES = {
  NEW_COMMENT: "Un utente ha aggiunto un commento al tuo post.",
  NEW_LIKE: "Un utente ha messo mi piace al tuo post.",
  CHALLENGE_COMPLETED: "Complimenti! Hai completato la sfida settimanale e sbloccato un nuovo badge!",
  SYSTEM_ANNOUNCEMENT: "C'è una nuova sfida disponibile, partecipa subito!"
};

/**
 * 2. TIPOLOGIE DI SEGNALAZIONE (Moderazione)
 * Opzioni fisse che l'utente può selezionare nel menu a tendina (Dropdown) 
 * del frontend quando segnala un post o un commento inappropriato.
 */
export const REPORT_CATEGORIES = {
  SPAM: "Spam o contenuto ingannevole",
  INAPPROPRIATE: "Contenuto inappropriato o offensivo",
  OFF_TOPIC: "Non pertinente alla sfida settimanale",
  OTHER: "Altro (specificato nella motivazione)"
};

/**
 * 3. CONFIGURAZIONI DELLE IMMAGINI DI DEFAULT
 * Se un utente si registra e non carica subito una foto profilo o una copertina,
 * il sistema assegnerà questi percorsi/placeholder standard.
 */
export const DEFAULT_MEDIA = {
  PROFILE_PIC: "/uploads/defaults/avatar-placeholder.png",
  COVER_PIC: "/uploads/defaults/cover-placeholder.png"
};

/**
 * 4. LIMITI DEI COMPONENTI GRAFICI (Frontend)
 * Utili per configurare i componenti di input nel modulo mobile (es. contatori di caratteri rimasti).
 */
export const UI_LIMITS = {
  REPORT_REASON_MAX_LENGTH: 300,
  POST_DESCRIPTION_MAX_LENGTH: 1000 // Anche se Zod non ha limiti rigidi, un limite grafico evita crash dell'interfaccia
};

/**
 * 5. RUOLI UTENTE (Controllo degli accessi / ACL)
 * Definisce i livelli di autorizzazione all'interno dell'applicazione.
 * Questa stringa verrà salvata nella colonna 'ruolo' della tabella 'utente'.
 */
export const USER_ROLES = {
  USER: "USER",     // Utente standard: partecipa alle sfide, commenta, segnala
  ADMIN: "ADMIN"    // Amministratore: gestisce l'app, visualizza le segnalazioni, modera i contenuti
};
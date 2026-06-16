import { z } from 'zod';

/**
 * 1. SCHEMA DI REGISTRAZIONE UTENTE
 */
function parseBirthDateInput(arg) {
  if (arg instanceof Date && !Number.isNaN(arg.getTime())) return arg;

  if (typeof arg !== 'string') return arg;

  const value = arg.trim();

  if (!value) return undefined;

  const italianDateMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  const isoDateMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);

  let day;
  let month;
  let year;

  if (italianDateMatch) {
    day = Number(italianDateMatch[1]);
    month = Number(italianDateMatch[2]);
    year = Number(italianDateMatch[3]);
  } else if (isoDateMatch) {
    year = Number(isoDateMatch[1]);
    month = Number(isoDateMatch[2]);
    day = Number(isoDateMatch[3]);
  } else {
    return undefined;
  }

  const parsedDate = new Date(year, month - 1, day);

  const isRealDate =
    parsedDate.getFullYear() === year &&
    parsedDate.getMonth() === month - 1 &&
    parsedDate.getDate() === day;

  return isRealDate ? parsedDate : undefined;
}

function getAgeFromBirthDate(birthDate) {
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

export const BirthDateSchema = z
  .preprocess(
    parseBirthDateInput,
    z.date({
      required_error: 'È necessario inserire la data di nascita.',
      invalid_type_error: 'È necessario inserire la data di nascita.',
    })
  )
  .refine((birthDate) => birthDate <= new Date(), {
    message: 'La data di nascita non può essere futura',
  })
  .refine((birthDate) => getAgeFromBirthDate(birthDate) >= 16, {
    message: 'Devi avere almeno 16 anni per registrarti',
  });

export const RegisterStep1Schema = z.object({
  name: z
    .string()
    .trim()
    .min(1, {
      message: 'Il nome è obbligatorio',
    })
    .regex(/^[\p{L}\s']+$/u, {
      message: 'Il nome può contenere solo lettere, spazi o apostrofi',
    }),

  surname: z
    .string()
    .trim()
    .min(1, {
      message: 'Il cognome è obbligatorio',
    })
    .regex(/^[\p{L}\s']+$/u, {
      message: 'Il cognome può contenere solo lettere, spazi o apostrofi',
    }),

  birthDate: BirthDateSchema,

  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, {
      message: "L'email è obbligatoria",
    })
    .email({
      message: 'Inserisci un indirizzo email valido',
    }),
});
export const ForgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, {
      message: "L'email è obbligatoria",
    })
    .email({
      message: 'Inserisci un indirizzo email valido',
    }),
});
const RegisterStep2BaseSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, {
      message: 'Lo username è obbligatorio',
    })
    .max(20, {
      message: 'Lo username non può superare i 20 caratteri',
    })
    .regex(/^[a-zA-Z0-9._]+$/, {
      message:
        'Lo username può contenere solo lettere, numeri, punti (.) e underscore (_)',
    }),

  password: z
    .string()
    .min(8, {
      message: 'La password deve contenere almeno 8 caratteri',
    })
    .max(16, {
      message: 'La password non può superare i 16 caratteri',
    })
    .regex(/[A-Z]/, {
      message: 'La password deve contenere almeno una lettera maiuscola',
    })
    .regex(/[0-9]/, {
      message: 'La password deve contenere almeno un numero',
    })
    .regex(/[^a-zA-Z0-9]/, {
      message: 'La password deve contenere almeno un carattere speciale',
    }),

  confirmPassword: z.string().min(1, {
    message: 'Conferma la tua password',
  }),

  acceptTerms: z.boolean({
    required_error: 'Devi accettare i termini di servizio e la privacy policy',
  }),
});

export const RegisterStep2Schema = RegisterStep2BaseSchema
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Le password non corrispondono',
    path: ['confirmPassword'],
  })
  .refine((data) => data.acceptTerms === true, {
    message: 'Devi accettare i termini di servizio e la privacy policy',
    path: ['acceptTerms'],
  });

export const RegisterSchema = RegisterStep1Schema.merge(RegisterStep2BaseSchema)
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Le password non corrispondono',
    path: ['confirmPassword'],
  })
  .refine((data) => data.acceptTerms === true, {
    message: 'Devi accettare i termini di servizio e la privacy policy',
    path: ['acceptTerms'],
  });

/**
 * 2. SCHEMA DI LOGIN UTENTE
 */
export const LoginSchema = z.object({
  username: z.string().min(1, { message: "Inserisci lo username" }),
  password: z.string().min(1, { message: "Inserisci la password" })
});

// 3. Schema per la modifica della sola Email
export const UpdateEmailSchema = z.object({
  email: z.string()
    .min(1, { message: "L'indirizzo email è obbligatorio" })
    .email({ message: "Inserisci un indirizzo email valido" })
});

// 4. Schema per la modifica della Password (con controllo vecchia e conferma)
export const UpdatePasswordSchema = z.object({
  oldPassword: z.string()
    .min(1, { message: "La vecchia password è obbligatoria" }),
  newPassword: z.string()
    .min(8, { message: "La nuova password deve contenere almeno 8 caratteri" })
    .max(16, { message: "La nuova password non può superare i 16 caratteri" })
    .regex(/[A-Z]/, { message: "La nuova password deve contenere almeno una letter maiuscola" })
    .regex(/[0-9]/, { message: "La nuova password deve contenere almeno un numero" })
    .regex(/[^a-zA-Z0-9]/, { message: "La nuova password deve contenere almeno un carattere speciale" }),
  confirmPassword: z.string()
    .min(1, { message: "Conferma la tua nuova password" })
})
.refine((data) => data.newPassword === data.confirmPassword, {
  message: "Le nuove password non corrispondono",
  path: ["confirmPassword"],
});

/**
 * ==============================================================================
 * VALIDAZIONE METADATI DEI MEDIA (FOTO PROFILO, COPERTINA, POST)
 * ==============================================================================
 */

// 4. SCHEMA FOTO PROFILO
export const ProfilePictureSchema = z.object({
  mimetype: z.string().regex(/^image\/(jpeg|png)$/, { message: "Formato non supportato. Ammessi solo JPG o PNG" }),
  size: z.number().max(5 * 1024 * 1024, { message: "La foto profilo non può superare i 5MB" }),
  width: z.number().min(170, { message: "Larghezza minima 170px" }).max(2048, { message: "Larghezza massima 2048px" }),
  height: z.number().min(170, { message: "Altezza minima 170px" }).max(2048, { message: "Altezza massima 2048px" })
});

// 5. SCHEMA FOTO COPERTINA
export const CoverPictureSchema = z.object({
  mimetype: z.string().regex(/^image\/(jpeg|png)$/, { message: "Formato non supportato. Ammessi solo JPG o PNG" }),
  size: z.number().max(5 * 1024 * 1024, { message: "La foto di copertina non può superare i 5MB" }),
  width: z.number().min(851, { message: "Larghezza minima per la copertina: 851px" }).max(2048, { message: "Larghezza massima: 2048px" }),
  height: z.number().min(315, { message: "Altezza minima per la copertina: 315px" }).max(1152, { message: "Altezza massima: 1152px" })
});

// 6. SCHEMA FOTO POST
export const PostImageSchema = z.object({
  mimetype: z.string().regex(/^image\/(jpeg|png)$/, { message: "Formato non supportato. Ammessi solo JPG o PNG" }),
  size: z.number().max(10 * 1024 * 1024, { message: "L'immagine del post non può superare i 10MB" }),
  width: z.number().min(400, { message: "La foto del post deve essere almeno 400px di larghezza" }),
  height: z.number().min(400, { message: "La foto del post deve essere almeno 400px di altezza" })
});

// 7. SCHEMA VIDEO POST
export const PostVideoSchema = z.object({
  // Il formato video standard mp4 ha come mimetype video/mp4
  mimetype: z.string().regex(/^video\/(mp4|quicktime)$/, { message: "Formato non supportato. Ammessi solo MP4 e MOV" }),
  size: z.number().max(100 * 1024 * 1024, { message: "Il video del post non può superare i 100MB" })
  // Nota: Il codec H.264 verrà verificato a livello di backend con una libreria di analisi (es. fluent-ffmpeg) se necessario.
});

/**
 * ==============================================================================
 * SCHEMI PER INTERAZIONI E POST
 * ==============================================================================
 */

/**
 * 8. SCHEMA COMPLETAMENTO SFIDA SETTIMANALE (POST)
 * Descrizione: Opzionale. 
 * Posizione (latitude/longitude): Opzionale.
 * Media: La validazione del tipo di file specifico userà PostImageSchema o PostVideoSchema nel controller.
 */
export const CompleteChallengeSchema = z.object({
  description: z.string().max(1000, "La descrizione non può superare i 1000 caratteri").optional().nullable(),
  latitude: z.preprocess((val) => {
    if (val === '' || val === 'null' || val === undefined || val === null) return null;
    return Number(val);
  }, z.number().min(-90).max(90).optional().nullable()),
  longitude: z.preprocess((val) => {
    if (val === '' || val === 'null' || val === undefined || val === null) return null;
    return Number(val);
  }, z.number().min(-180).max(180).optional().nullable()),
  locationName: z.string().max(255, "Il nome del luogo è troppo lungo").optional().nullable(),
  difficoltaAttesa: z.enum(['facile', 'medio', 'difficile']).optional().nullable(),
  difficoltaPercepita: z.enum(['facile', 'medio', 'difficile']).optional().nullable(),
  
  // Toggle booleani inviati dal frontend in linea con la tabella consenso
  consensi: z.preprocess((val) => {
    if (typeof val === 'string') {
      try { return JSON.parse(val); } catch { return undefined; }
    }
    return val;
  }, z.object({
    Galleria: z.boolean().optional(),
    Fotocamera: z.boolean().optional(),
    GNSS: z.boolean().optional()
  }).optional())
})
.refine((data) => {
  const hasLat = data.latitude !== undefined && data.latitude !== null;
  const hasLng = data.longitude !== undefined && data.longitude !== null;
  const hasLoc = data.locationName !== undefined && data.locationName !== null;
  
  // Devono essere tutti veri o tutti falsi
  return (hasLat && hasLng && hasLoc) || (!hasLat && !hasLng && !hasLoc);
}, {
  message: "I dati geografici devono essere completi (latitudine, longitudine e nome luogo) oppure totalmente assenti.",
  path: ["locationName"] // Evidenzia l'errore sulla geolocalizzazione
});

/**
 * 9. SCHEMA INSERIMENTO COMMENTO
 */
export const CommentSchema = z.object({
  text: z.string().min(1, { message: "Il commento non può essere vuoto" })
});

/**
 * 10. SCHEMA SEGNALAZIONE POST
 */
export const ReportSchema = z.object({
  reason: z.string().min(1, { message: "Minimo 5 caratteri di motivazione" }).max(300)
});

/**
 * ==============================================================================
 * SCHEMI PER LE PREFERENZE UTENTE
 * ==============================================================================
 */

/**
 * Schema per l'aggiornamento dei 3 toggle di notifica
 */
export const UpdatePreferencesSchema = z.object({
  sfide: z.boolean({ required_error: "Il campo sfide è obbligatorio" }),
  progressi: z.boolean({ required_error: "Il campo progressi è obbligatorio" }),
  social: z.boolean({ required_error: "Il campo social è obbligatorio" })
});

/**
 * SCHEMA AGGIORNAMENTO MEDIA PROFILO (Foto Profilo e/o Copertina)
 */
export const UpdateProfileMediaSchema = z.object({
  sorgenteMediaFoto: z.enum(['galleria', 'fotocamera']).optional().nullable(),
  sorgenteMediaCopertina: z.enum(['galleria', 'fotocamera']).optional().nullable(),
  
  // Consensi hardware passati dal frontend
  consensi: z.preprocess((val) => {
    if (typeof val === 'string') {
      try { return JSON.parse(val); } catch { return undefined; }
    }
    return val;
  }, z.object({
    Galleria: z.boolean().optional(),
    Fotocamera: z.boolean().optional()
  }).optional())
});
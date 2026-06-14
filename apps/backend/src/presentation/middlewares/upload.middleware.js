import multer from 'multer';
import path from 'path';
import fs from 'fs';

// 1. Usa la variabile d'ambiente se esiste, altrimenti calcola il percorso standard
const baseUploadDir = process.env.UPLOAD_PATH || path.join(process.cwd(), 'uploads');
const uploadDir = path.join(baseUploadDir, 'posts');

// Ci assicuriamo che la cartella esista, altrimenti la creiamo all'avvio del server
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. Configurazione dello Storage: come rinominare i file per evitare sovrascritture
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generiamo un nome unico: timestamp + numero casuale + estensione originale
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `post-${uniqueSuffix}${ext}`);
  }
});

// 3. Filtro di Sicurezza sui Mimetypes (presi dai tuoi schemi in schemas.js)
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/png'];
  const allowedVideoTypes = ['video/mp4', 'video/quicktime']; // MP4 e MOV

  if (allowedImageTypes.includes(file.mimetype) || allowedVideoTypes.includes(file.mimetype)) {
    cb(null, true); // Accetta il file
  } else {
    const error = new Error('Formato file non supportato. Ammessi solo JPG, PNG, MP4 o MOV.');
    error.statusCode = 400;
    error.type = 'ValidationError';
    cb(error, false); // Rifiuta il file
  }
};

// 4. Inizializzazione di Multer con limite massimo globale di 100MB (per i video)
export const uploadMedia = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB massimo
  }
}).single('media'); // 'media' è il nome della chiave del pacchetto FormData che userà Axios

// 5. Un secondo middleware di controllo specifico per stringere le maglie (Immagini max 10MB)
export const validateMediaSize = (req, res, next) => {
  // Se non è stato caricato nessun file, andiamo avanti (il media è opzionale)
  if (!req.file) return next();

  const isImage = req.file.mimetype.startsWith('image/');
  const imageMaxSize = 10 * 1024 * 1024; // 10MB

  if (isImage && req.file.size > imageMaxSize) {
    // Rimuoviamo il file appena salvato per non sprecare spazio sul server
    fs.unlinkSync(req.file.path);
    
    return res.status(400).json({
      status: 'error',
      type: 'ValidationError',
      errors: [{ field: 'media', message: "L'immagine del post non può superare i 10MB" }] // Allineato al tuo schema
    });
  }

  next();
};

// Configurazione per i profili utenti
const profileUploadDir = path.join(baseUploadDir, 'profiles');

// Ci assicuriamo che la cartella uploads/profiles esista
if (!fs.existsSync(profileUploadDir)) {
  fs.mkdirSync(profileUploadDir, { recursive: true });
}

const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profileUploadDir);
  },
  filename: (req, file, cb) => {
    // campo file.fieldname sarà 'foto' o 'copertina'
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

export const uploadProfileMedia = multer({
  storage: profileStorage,
  fileFilter: (req, file, cb) => {
    const allowedImageTypes = ['image/jpeg', 'image/png'];
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const error = new Error('Formato file non supportato. Ammessi solo JPG o PNG.');
      error.statusCode = 400;
      error.type = 'ValidationError';
      cb(error, false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB massimo come da ProfilePictureSchema/CoverPictureSchema
  }
}).fields([
  { name: 'foto', maxCount: 1 },
  { name: 'copertina', maxCount: 1 }
]);
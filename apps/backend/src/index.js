import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import './infrastructure/database/db.js';
import authRoutes from './presentation/routes/auth.routes.js';
import preferenzaRoutes from './presentation/routes/preferenza.routes.js';
import commentoRoutes from './presentation/routes/commento.routes.js';
import sfidaCompletataRoutes from './presentation/routes/sfida.completata.routes.js';
import feedRoutes from './presentation/routes/feed.routes.js';
import sfidaRoutes from './presentation/routes/sfida.routes.js';
import utenteRoutes from './presentation/routes/utente.routes.js';
import { globalErrorHandler } from './presentation/middlewares/error.middleware.js';

// ==========================================
// 1. CONFIGURAZIONE AMBIENTE & MONOREPO
// ==========================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Trucco per leggere l'.env della root se avviato senza Docker
if (!process.env.DOCKER_ENV) {
  dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
}

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// 2. MIDDLEWARES GLOBALI
// ==========================================
app.use(cors()); // Permette al frontend React Native di comunicare con il backend
app.use(express.json()); // Permette a Express di leggere i body delle richieste in JSON

// Determina il percorso dei file statici usando la variabile d'ambiente
const staticUploadPath = process.env.UPLOAD_PATH || path.join(process.cwd(), 'uploads');
// Serve i file multimediali tramite Express (utile come fallback o in locale)
app.use('/uploads', express.static(staticUploadPath));

// ==========================================
// 3. ROTTA DI TEST (Smoke Test)
// ==========================================
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'success', 
    message: 'Il backend di Outgrow è attivo e funzionante!',
    environment: process.env.NODE_ENV || 'development'
  });
});

// ==========================================
// 4. ROTTE DELL'APPLICAZIONE
// ==========================================
app.use('/api/auth', authRoutes); // Le rotte di registrazione e login
app.use('/api/preferences', preferenzaRoutes); // Gestione toggle notifiche (Sfide, Progressi, Social)
app.use('/api/comments', commentoRoutes);
app.use('/api/sfide-completate', sfidaCompletataRoutes); // Corrisponde a: POST /api/sfide-completate/:sfidaId
app.use('/api/feed', feedRoutes);                       // Corrisponde a: GET /api/feed/ e POST /api/feed/:postId/like
app.use('/api/sfide', sfidaRoutes);
app.use('/api/utente', utenteRoutes);

// ==========================================
// 4.5 GESTIONE ERRORI GLOBALE
// ==========================================
app.use(globalErrorHandler);

// ==========================================
// 5. AVVIO DEL SERVER
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 Server in ascolto sulla porta ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
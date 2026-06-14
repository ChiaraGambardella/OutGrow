import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;

// ==========================================
// TRUCCO MONOREPO PER L'AVVIO SINGOLO
// ==========================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carica l'.env dalla root solo se siamo fuori da Docker
if (!process.env.DOCKER_ENV) {
  dotenv.config({ path: path.resolve(__dirname, '../../../../../.env') });
}

// ==========================================
// CONFIGURAZIONE DEL POOL
// ==========================================
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST || 'localhost', // Fallback se avviato fuori da Docker
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  max: 20, 
  idleTimeoutMillis: 30000, 
  connectionTimeoutMillis: 10000, 
});

// Ascolta eventuali errori imprevisti sui client inattivi nel pool
pool.on('error', (err) => {
  console.error('❌ Errore imprevisto nel pool di Postgres:', err);
});

// Spostiamo la verifica all'avvio nell'index.js (opzionale ma consigliato), 
// oppure la lasciamo qui per comodità come avevi fatto tu:
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Errore critico di connessione al database PostgreSQL:', err.stack);
  } else {
    console.log('✅ Connessione al database PostgreSQL stabilita con successo.');
  }
});

export default pool;
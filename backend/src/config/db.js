import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const { Pool } = pg;


// Configuración del pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Eventos de conexión
pool.on('connect', () => {
  console.log('Conectado a la base de datos de producción (Neon)');
});

pool.on('error', (err) => {
  console.error('Error inesperado en el cliente inactivo', err);
  process.exit(-1);
});
/*

//Conexión a bd local
// Si en tu .env dice 'localhost' o no hay variable, sabemos que es tu PC.
const isLocal = process.env.DB_HOST === 'localhost' || !process.env.DB_HOST;

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 10,
  // La magia: Si es tu PC apagamos SSL. Si no dice 'localhost', es NeonDB y encendemos SSL.
  ssl: isLocal ? false : { rejectUnauthorized: false }
});

pool.on('connect', () => {
  console.log(`✅ BD conectada en entorno: ${isLocal ? 'LOCAL (Localhost)' : 'PRODUCCIÓN (Neon)'}`);
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en la base de datos', err);
  process.exit(-1);
});
*/
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const { Pool } = pg;

// Detectamos si el código está corriendo en Render (producción) o en tu PC (local)
const isProduction = process.env.NODE_ENV === 'production' || process.env.DB_HOST !== undefined;

export const pool = new Pool({
  host: isProduction ? process.env.DB_HOST : 'localhost',
  port: isProduction ? (process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432) : 5432,
  user: isProduction ? process.env.DB_USER : 'postgres', // Ajusta tu usuario local si es diferente
  password: isProduction ? process.env.DB_PASSWORD : 'tu_contraseña_local', // Pónle aquí tu contraseña de tu Postgres local
  database: isProduction ? process.env.DB_NAME : 'tu_nombre_bd_local', // Pon aquí el nombre de tu base de datos local
  max: 10,
  // El SSL SOLO se activa si está en producción (Neon), en tu PC local se desactiva
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

pool.on('connect', () => {
  console.log(`✅ Base de datos conectada en entorno: ${isProduction ? 'PRODUCCIÓN (Neon)' : 'LOCAL (Localhost)'}`);
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en la base de datos', err);
  process.exit(-1);
});
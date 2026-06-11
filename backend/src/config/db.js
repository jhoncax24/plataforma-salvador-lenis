import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 10,
  // 👇 ESTO ES OBLIGATORIO PARA NEON.TECH EN PRODUCCIÓN 👇
  ssl: {
    rejectUnauthorized: false
  }
});

// Agregamos un pequeño mensaje para saber si la conexión fue exitosa
pool.on('connect', () => {
  console.log('✅ Base de datos conectada correctamente a Neon.tech');
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en la base de datos', err);
  process.exit(-1);
});
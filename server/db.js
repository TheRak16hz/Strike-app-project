const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const connectionString = process.env.DATABASE_URL;

if (isProduction && !process.env.DATABASE_URL) {
  console.warn('⚠️ ADVERTENCIA: DATABASE_URL no está definida en producción. Usando valores por defecto de fallback.');
}

const pool = new Pool({
  connectionString,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};

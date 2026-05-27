const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
console.log('Connecting to:', connectionString ? connectionString.split('@')[1] : 'undefined');

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function test() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Success! Database time:', res.rows[0]);
    
    const users = await pool.query('SELECT count(*) FROM users');
    console.log('Users count:', users.rows[0]);
  } catch (err) {
    console.error('Database connection error:', err);
  } finally {
    await pool.end();
  }
}

test();

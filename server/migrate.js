const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function run() {
  try {
    const nutritionSql = fs.readFileSync(path.join(__dirname, '../db/update_v4_nutrition.sql'), 'utf8');
    const sleepSql = fs.readFileSync(path.join(__dirname, '../db/update_v4_sleep.sql'), 'utf8');
    const financeSql = fs.readFileSync(path.join(__dirname, '../db/update_v4_finance_metadata.sql'), 'utf8');
    const seedSql = fs.readFileSync(path.join(__dirname, '../db/update_v5_seed.sql'), 'utf8');
    const gymSql = fs.readFileSync(path.join(__dirname, '../db/update_v6_gym.sql'), 'utf8');
    const sleepTagsSql = fs.readFileSync(path.join(__dirname, '../db/update_v7_sleep_tags.sql'), 'utf8');
    const financeUsdtSql = fs.readFileSync(path.join(__dirname, '../db/update_v8_finance_usdt.sql'), 'utf8');
    
    console.log('Running nutrition migrations...');
    await pool.query(nutritionSql);
    console.log('Nutrition done.');

    console.log('Running sleep migrations...');
    await pool.query(sleepSql);
    console.log('Sleep done.');

    console.log('Running finance metadata migrations...');
    await pool.query(financeSql);
    console.log('Finance done.');

    console.log('Running seed migrations...');
    await pool.query(seedSql);
    console.log('Seed done.');

    console.log('Running gym migrations...');
    await pool.query(gymSql);
    console.log('Gym done.');

    console.log('Running sleep tags migrations...');
    await pool.query(sleepTagsSql);
    console.log('Sleep tags done.');

    console.log('Running finance USDT and categories migrations...');
    await pool.query(financeUsdtSql);
    console.log('Finance USDT and categories done.');

    console.log('All migrations executed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    pool.end();
  }
}
run();

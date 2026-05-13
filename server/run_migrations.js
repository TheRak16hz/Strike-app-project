const fs = require('fs');
const path = require('path');
const db = require('./db');

async function runMigrations() {
  const files = [
    '../db/update_v4_nutrition.sql',
    '../db/update_v4_sleep.sql',
    '../db/update_v4_finance_metadata.sql'
  ];

  for (const file of files) {
    console.log(`Running ${file}...`);
    try {
      const sql = fs.readFileSync(path.join(__dirname, file), 'utf8');
      await db.query(sql);
      console.log(`✅ Success: ${file}`);
    } catch (err) {
      console.error(`❌ Error running ${file}:`, err.message);
    }
  }
  process.exit(0);
}

runMigrations();

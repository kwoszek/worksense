const { Pool, pg } = require('pg');


const db = new Pool({
    host: process.env.PGHOST || 'localhost',
    port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
    database: process.env.PGDATABASE || 'worksense',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || ''
  }
);

async function checkDb() {
  try {
    const result = await db.query('SELECT 1 AS ok');
    return result?.rows?.[0]?.ok === 1;
  } catch (err) {
    return false;
  }
}

module.exports = { db, checkDb };

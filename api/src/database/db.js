const mysql = require('mysql2/promise');

// Allow both old PG* envs and new MYSQL_* envs for smoother transition.
const host = process.env.MYSQL_HOST || process.env.PGHOST || 'localhost';
const port = Number(process.env.MYSQL_PORT || process.env.PGPORT || 3306);
const database = process.env.MYSQL_DATABASE || process.env.PGDATABASE || 'worksense';
const user = process.env.MYSQL_USER || process.env.PGUSER || 'root';
const password = process.env.MYSQL_PASSWORD || process.env.PGPASSWORD || '';

// Create pool
const pool = mysql.createPool({
  host,
  port,
  database,
  user,
  password,
  connectionLimit: Number(process.env.MYSQL_POOL_LIMIT || 10),
  timezone: 'Z'
});

// Simple wrapper to mimic pg's db.query signature (returns { rows, rowCount })
async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  // rows may be RowDataPacket[] or OkPacket depending on query type
  if (Array.isArray(rows)) {
    return { rows, rowCount: rows.length };
  } else {
    // OkPacket for INSERT/UPDATE/DELETE
    return { rows: [], rowCount: rows.affectedRows || 0, insertId: rows.insertId };
  }
}

async function checkDb() {
  try {
    const result = await query('SELECT 1 AS ok');
    if (result.rows.length && result.rows[0].ok === 1) return true;
    return false;
  } catch {
    return false;
  }
}

const db = { query, pool };

module.exports = { db, checkDb };

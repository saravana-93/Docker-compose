const mysql = require('mysql2/promise');
const env = require('./env');
let pool;

function getPool() {
  if (!pool) pool = mysql.createPool({
    host: env.database.host,
    port: env.database.port,
    user: env.database.user,
    password: env.database.password,
    database: env.database.name,
    ssl: env.database.ssl ? { rejectUnauthorized: true } : undefined,
    waitForConnections: true,
    connectionLimit: 10,
    decimalNumbers: true,
    dateStrings: true,
  });
  return pool;
}
async function closePool() { if (pool) await pool.end(); }
module.exports = { getPool, closePool };

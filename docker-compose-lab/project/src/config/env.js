const path = require('node:path');
require('dotenv').config({ path: process.env.ENV_FILE || path.join(process.cwd(), '.env') });

const databaseName = process.env.DB_NAME || 'carebridge_hospital';
if (!/^[a-zA-Z0-9_]+$/.test(databaseName)) throw new Error('Invalid DB_NAME.');

module.exports = Object.freeze({
  port: Number(process.env.PORT || 3000),
  database: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: databaseName,
    ssl: String(process.env.DB_SSL || 'false').toLowerCase() === 'true',
  },
});

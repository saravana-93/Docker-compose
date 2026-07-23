const express = require('express');
const path = require('node:path');
const helmet = require('helmet');
const morgan = require('morgan');
const apiRoutes = require('./routes/api');
const pageRoutes = require('./routes/pages');
const { getPool } = require('./config/database');
const { ensureDatabase, databaseStatus } = require('./db/state');

function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(morgan('dev'));
  app.use(express.json({ limit: '20kb' }));
  app.use(express.urlencoded({ extended: false, limit: '20kb' }));
  app.use('/images', express.static(path.join(__dirname, '..', 'public', 'images'), {
    immutable: true,
    maxAge: '1d',
  }));

  app.use(pageRoutes);

  app.get('/health', async (request, response) => {
    try {
      await ensureDatabase();
      await getPool().query('SELECT 1');
      return response.json({ status: 'ok', database: 'connected' });
    } catch (error) {
      return response.status(503).json({
        status: 'degraded',
        database: 'disconnected',
        message: 'Start MySQL and verify the credentials in .env.',
      });
    }
  });

  app.use('/api', async (request, response, next) => {
    try {
      await ensureDatabase();
      return next();
    } catch (error) {
      const status = databaseStatus();
      return response.status(503).json({
        error: 'Database unavailable',
        message: 'Start MySQL and verify the credentials in .env.',
        detail: status.message,
      });
    }
  }, apiRoutes);

  app.use((request, response) => response.status(404).json({ error: 'Endpoint not found' }));
  app.use((error, request, response, next) => {
    console.error(error);
    if (response.headersSent) return next(error);
    return response.status(500).json({ error: 'Internal server error' });
  });
  return app;
}

module.exports = { createApp };

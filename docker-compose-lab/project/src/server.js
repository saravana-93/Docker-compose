const env = require('./config/env');
const { ensureDatabase } = require('./db/state');
const { closePool } = require('./config/database');
const { createApp } = require('./app');

const server = createApp().listen(env.port, () => {
  console.log(`\nCareBridge API ready: http://localhost:${env.port}`);
  ensureDatabase().catch((error) => {
    console.warn('MySQL is not available yet. API data endpoints will return 503.');
    console.warn(`Reason: ${error.message}`);
  });
});

const stop = () => server.close(async () => {
  await closePool();
  process.exit(0);
});
process.on('SIGINT', stop);
process.on('SIGTERM', stop);

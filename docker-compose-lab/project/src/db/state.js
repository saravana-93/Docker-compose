const { initializeDatabase } = require('./initialize');

let ready = false;
let initialization;
let lastError;

async function ensureDatabase() {
  if (ready) return;
  if (!initialization) {
    initialization = initializeDatabase()
      .then(() => {
        ready = true;
        lastError = undefined;
        console.log('MySQL connected and initialized.');
      })
      .catch((error) => {
        lastError = error;
        throw error;
      })
      .finally(() => {
        initialization = undefined;
      });
  }
  return initialization;
}

function databaseStatus() {
  return { ready, message: lastError?.message };
}

module.exports = { ensureDatabase, databaseStatus };

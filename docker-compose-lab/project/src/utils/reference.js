const crypto = require('node:crypto');
function createReference() { return `CB${new Date().toISOString().slice(2,10).replaceAll('-','')}${crypto.randomBytes(3).toString('hex').toUpperCase()}`; }
module.exports = { createReference };

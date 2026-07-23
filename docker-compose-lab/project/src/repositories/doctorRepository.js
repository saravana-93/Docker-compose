const { getPool } = require('../config/database');
async function getDoctors(specialty = '') {
  if (specialty) { const [rows] = await getPool().execute('SELECT * FROM doctors WHERE available=TRUE AND specialty=? ORDER BY rating DESC', [specialty]); return rows; }
  const [rows] = await getPool().query('SELECT * FROM doctors WHERE available=TRUE ORDER BY rating DESC, name'); return rows;
}
async function getDoctor(id) { const [rows] = await getPool().execute('SELECT * FROM doctors WHERE id=? AND available=TRUE LIMIT 1', [id]); return rows[0] || null; }
async function getSpecialties() { const [rows] = await getPool().query('SELECT DISTINCT specialty FROM doctors WHERE available=TRUE ORDER BY specialty'); return rows.map((row) => row.specialty); }
module.exports = { getDoctors, getDoctor, getSpecialties };

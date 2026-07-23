const { getPool } = require('../config/database');
const { createReference } = require('../utils/reference');

async function createAppointment(data) {
  const reference = createReference();
  try {
    await getPool().execute(`INSERT INTO appointments
      (reference_code,doctor_id,patient_name,patient_email,patient_phone,appointment_date,appointment_time,reason)
      VALUES (?,?,?,?,?,?,?,?)`, [reference, data.doctorId, data.name, data.email, data.phone, data.date, data.time, data.reason]);
    return reference;
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') { const conflict = new Error('This appointment time was just booked. Please choose another slot.'); conflict.status = 409; throw conflict; }
    throw error;
  }
}
async function getAppointment(reference) {
  const [rows] = await getPool().execute(`SELECT a.*, d.name AS doctor_name, d.specialty, d.consultation_fee
    FROM appointments a JOIN doctors d ON d.id=a.doctor_id WHERE a.reference_code=? LIMIT 1`, [reference]);
  return rows[0] || null;
}
async function cancelAppointment(reference) {
  const [result] = await getPool().execute(
    `UPDATE appointments SET status='CANCELLED'
     WHERE reference_code=? AND status='CONFIRMED' AND appointment_date >= CURDATE()`,
    [reference],
  );
  return result.affectedRows === 1;
}
module.exports = { createAppointment, getAppointment, cancelAppointment };

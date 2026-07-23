const mysql = require('mysql2/promise');
const env = require('../config/env');
const { getPool } = require('../config/database');

const doctors = [
  ['Dr. Maya Raman', 'Cardiology', 14, 4.9, 800, 'MBBS, MD Cardiology', 'Heart health, hypertension and preventive cardiac care.'],
  ['Dr. Arjun Mehta', 'Orthopedics', 11, 4.8, 700, 'MBBS, MS Orthopedics', 'Joint pain, sports injuries and mobility restoration.'],
  ['Dr. Nila Joseph', 'Dermatology', 9, 4.9, 650, 'MBBS, MD Dermatology', 'Clinical dermatology, hair care and skin wellness.'],
  ['Dr. Sara Iqbal', 'Pediatrics', 12, 4.7, 600, 'MBBS, MD Pediatrics', 'Compassionate healthcare for infants, children and teens.'],
  ['Dr. Vikram Rao', 'Neurology', 16, 4.9, 950, 'MBBS, DM Neurology', 'Headache, epilepsy and comprehensive neurological care.'],
  ['Dr. Ananya Bose', 'General Medicine', 8, 4.8, 500, 'MBBS, MD Medicine', 'Everyday illness, diagnosis and long-term wellness plans.'],
];

async function initializeDatabase() {
  const admin = await mysql.createConnection({
    host: env.database.host,
    port: env.database.port,
    user: env.database.user,
    password: env.database.password,
    ssl: env.database.ssl ? { rejectUnauthorized: true } : undefined,
  });
  await admin.query(`CREATE DATABASE IF NOT EXISTS \`${env.database.name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await admin.end();
  const pool = getPool();
  await pool.query(`CREATE TABLE IF NOT EXISTS doctors (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL,
    specialty VARCHAR(80) NOT NULL, experience_years TINYINT UNSIGNED NOT NULL,
    rating DECIMAL(2,1) NOT NULL, consultation_fee DECIMAL(10,2) NOT NULL,
    qualification VARCHAR(140) NOT NULL, bio VARCHAR(300) NOT NULL, available BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE KEY uq_doctor_name (name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  await pool.query(`CREATE TABLE IF NOT EXISTS appointments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, reference_code VARCHAR(18) NOT NULL UNIQUE,
    doctor_id INT UNSIGNED NOT NULL, patient_name VARCHAR(100) NOT NULL,
    patient_email VARCHAR(160) NOT NULL, patient_phone VARCHAR(30) NOT NULL,
    appointment_date DATE NOT NULL, appointment_time TIME NOT NULL,
    reason VARCHAR(500) NOT NULL, status ENUM('CONFIRMED','CANCELLED') NOT NULL DEFAULT 'CONFIRMED',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_doctor_slot (doctor_id, appointment_date, appointment_time),
    CONSTRAINT fk_appointment_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  for (const doctor of doctors) {
    await pool.execute(`INSERT INTO doctors (name,specialty,experience_years,rating,consultation_fee,qualification,bio)
      VALUES (?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE specialty=VALUES(specialty), rating=VALUES(rating), bio=VALUES(bio)`, doctor);
  }
}
module.exports = { initializeDatabase };

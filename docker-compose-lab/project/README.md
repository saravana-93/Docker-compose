# CareBridge Hospital Appointment Backend

A Node.js, Express, and MySQL hospital appointment application. Express serves
the appointment webpage and a JSON REST API from the same backend process.

## Features

- Doctor and specialty directory
- Appointment form with server-side validation
- MySQL persistence and automatic schema initialization
- Duplicate doctor/date/time slot protection
- Appointment confirmation and cancellation APIs
- AWS RDS-compatible TLS connection
- Health endpoint, security headers, request logging, tests, and CI

## Requirements

- Node.js 20 or newer
- MySQL 8 locally, or an accessible MySQL-compatible AWS RDS instance

## Clone and run

```bash
git clone https://github.com/SaranKumar409/sample-application-backend.git
cd sample-application-backend
npm ci
cp .env.example .env
```

Edit `.env` with your database credentials, then run:

```bash
npm run build
npm start
```

Open `http://localhost:3000`.

The configured database user must be able to create the configured database
and its tables. On first startup the application creates the `doctors` and
`appointments` tables and seeds sample doctors.

## Local MySQL setup

Connect as a local MySQL administrator and run:

```sql
CREATE DATABASE IF NOT EXISTS carebridge_hospital;
CREATE USER IF NOT EXISTS 'carebridge_user'@'localhost'
  IDENTIFIED BY 'replace_with_a_strong_password';
GRANT ALL PRIVILEGES ON carebridge_hospital.* TO 'carebridge_user'@'localhost';
FLUSH PRIVILEGES;
```

Use the same username/password in `.env` and leave `DB_SSL=false`.

## AWS RDS setup

Set `DB_HOST` to the RDS endpoint and `DB_SSL=true`. The RDS security group must
allow inbound TCP port 3306 from the machine running this application. Never
commit `.env` or database passwords.

## REST API

```text
GET    /health
GET    /api/specialties
GET    /api/doctors
GET    /api/doctors/:doctorId
POST   /api/appointments
GET    /api/appointments/:reference
PATCH  /api/appointments/:reference/cancel
```

Example appointment request:

```json
{
  "doctorId": 1,
  "name": "Arun Kumar",
  "email": "arun@example.com",
  "phone": "+91 98765 43210",
  "date": "2026-08-20",
  "time": "10:30:00",
  "reason": "Regular heart health consultation"
}
```

## Validation commands

```bash
npm run check
npm run build
npm test
npm audit --audit-level=high
```

`npm run build` creates a credential-free production bundle in `dist/`.

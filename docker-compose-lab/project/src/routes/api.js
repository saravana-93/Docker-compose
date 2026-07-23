const express = require('express');
const { body, param, query, validationResult, matchedData } = require('express-validator');
const doctorRepository = require('../repositories/doctorRepository');
const appointmentService = require('../services/appointmentService');

const router = express.Router();
const today = () => new Date().toISOString().slice(0, 10);

function validate(request, response, next) {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(({ path, msg }) => ({ field: path, message: msg })),
    });
  }
  return next();
}

router.get('/specialties', async (request, response) => {
  response.json({ data: await doctorRepository.getSpecialties() });
});

router.get(
  '/doctors',
  [query('specialty').optional({ checkFalsy: true }).trim().isLength({ max: 80 }), validate],
  async (request, response) => {
    const data = await doctorRepository.getDoctors(request.query.specialty || '');
    response.json({ data, count: data.length });
  },
);

router.get(
  '/doctors/:doctorId',
  [param('doctorId').isInt({ min: 1 }).toInt(), validate],
  async (request, response) => {
    const doctor = await doctorRepository.getDoctor(request.params.doctorId);
    if (!doctor) return response.status(404).json({ error: 'Doctor not found' });
    return response.json({ data: doctor });
  },
);

router.post(
  '/appointments',
  [
    body('doctorId').isInt({ min: 1 }).toInt(),
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Enter patient name.'),
    body('email').isEmail().normalizeEmail().withMessage('Enter a valid email.'),
    body('phone').trim().matches(/^[+0-9 ()-]{7,30}$/).withMessage('Enter a valid phone number.'),
    body('date').isISO8601().custom((value) => value >= today()).withMessage('Choose today or a future date.'),
    body('time').isIn(['09:00:00', '10:30:00', '12:00:00', '14:00:00', '15:30:00', '17:00:00']),
    body('reason').trim().isLength({ min: 5, max: 500 }),
    validate,
  ],
  async (request, response) => {
    const data = matchedData(request);
    const doctor = await doctorRepository.getDoctor(data.doctorId);
    if (!doctor) return response.status(404).json({ error: 'Doctor not found' });
    try {
      const reference = await appointmentService.createAppointment(data);
      const appointment = await appointmentService.getAppointment(reference);
      return response.status(201).location(`/api/appointments/${reference}`).json({ data: appointment });
    } catch (error) {
      if (error.status === 409) return response.status(409).json({ error: error.message });
      throw error;
    }
  },
);

router.get(
  '/appointments/:reference',
  [param('reference').matches(/^CB[0-9A-F]+$/), validate],
  async (request, response) => {
    const appointment = await appointmentService.getAppointment(request.params.reference);
    if (!appointment) return response.status(404).json({ error: 'Appointment not found' });
    return response.json({ data: appointment });
  },
);

router.patch(
  '/appointments/:reference/cancel',
  [param('reference').matches(/^CB[0-9A-F]+$/), validate],
  async (request, response) => {
    const cancelled = await appointmentService.cancelAppointment(request.params.reference);
    if (!cancelled) return response.status(409).json({ error: 'Appointment cannot be cancelled' });
    return response.json({ message: 'Appointment cancelled' });
  },
);

module.exports = router;

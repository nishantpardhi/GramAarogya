import { Router } from 'express';
import {
  getAppointments,
  createAppointment,
  updateAppointmentStatus,
  suggestTelemedicine,
  acceptTelemedicine,
} from '../controllers/appointmentController';
import { optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuth, getAppointments);
router.post('/', optionalAuth, createAppointment);
router.patch('/:id/status', optionalAuth, updateAppointmentStatus);
router.post('/:id/suggest-telemedicine', optionalAuth, suggestTelemedicine);
router.post('/:id/accept-telemedicine', optionalAuth, acceptTelemedicine);

export default router;

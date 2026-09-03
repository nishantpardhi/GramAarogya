import { Router } from 'express';
import {
  getDoctors,
  getDoctorById,
  getDoctorAvailability,
  updateDoctorAvailability,
  findAlternativeDoctors,
  registerDoctor,
  verifyDoctor,
  updateDoctorProfile,
} from '../controllers/doctorController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

router.get('/', getDoctors);
router.get('/alternatives', findAlternativeDoctors);
router.post('/register', registerDoctor);
router.get('/:id', getDoctorById);
router.put('/:id', updateDoctorProfile);
router.patch('/:id', updateDoctorProfile);
router.get('/:doctorId/availability', getDoctorAvailability);
router.post('/:doctorId/availability', updateDoctorAvailability);
router.post('/:id/verify', authenticateToken, authorizeRoles('admin'), verifyDoctor);

export default router;

import { Router } from 'express';
import {
  triggerEmergencySOS,
  getEmergencyStatus,
  updateEmergencyStatus,
  getAllEmergencies,
} from '../controllers/emergencyController';
import { optionalAuth } from '../middleware/auth';

const router = Router();

router.post('/sos', triggerEmergencySOS);
router.get('/all', optionalAuth, getAllEmergencies);
router.get('/:id', getEmergencyStatus);
router.patch('/:id/status', optionalAuth, updateEmergencyStatus);

export default router;

import { Router } from 'express';
import {
  getPrescriptions,
  createPrescription,
  getReferrals,
  createReferral,
  getHealthRecords,
  uploadHealthRecord,
  getHealthSchemes,
  getMedicines,
  getHealthCamps,
  registerForCamp,
  getAuditLogs,
} from '../controllers/medicalController';
import { optionalAuth, authenticateToken } from '../middleware/auth';

const router = Router();

// Prescriptions
router.get('/prescriptions', optionalAuth, getPrescriptions);
router.post('/prescriptions', optionalAuth, createPrescription);

// Referrals
router.get('/referrals', optionalAuth, getReferrals);
router.post('/referrals', optionalAuth, createReferral);

// Health Records
router.get('/health-records', optionalAuth, getHealthRecords);
router.post('/health-records', optionalAuth, uploadHealthRecord);

// Schemes & Medicines
router.get('/health-schemes', getHealthSchemes);
router.get('/medicines', getMedicines);

// Camps
router.get('/health-camps', getHealthCamps);
router.post('/health-camps/:id/register', registerForCamp);

// Audit Logs
router.get('/audit-logs', optionalAuth, getAuditLogs);

export default router;

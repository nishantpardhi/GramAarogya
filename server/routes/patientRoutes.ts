import { Router } from 'express';
import {
  getCurrentUserProfile,
  updateProfile,
  uploadProfilePhoto,
} from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Dedicated Patient Profile Endpoints (Strictly Authenticated)
router.get('/profile', authenticateToken, getCurrentUserProfile);
router.put('/profile', authenticateToken, updateProfile);
router.post('/profile', authenticateToken, updateProfile);
router.post('/profile/photo', authenticateToken, uploadProfilePhoto);

export default router;

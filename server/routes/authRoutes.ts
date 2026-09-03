import { Router } from 'express';
import {
  sendPhoneOtp,
  verifyPhoneOtp,
  loginWithPassword,
  loginWithPin,
  getCurrentUserProfile,
  updateProfile,
  uploadProfilePhoto,
  sendPasswordReset,
} from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Patient Phone OTP Auth
router.post('/phone/send-otp', sendPhoneOtp);
router.post('/phone/verify-otp', verifyPhoneOtp);

// Patient Mobile PIN Auth
router.post('/login-pin', loginWithPin);

// Doctor & Staff Password Auth
router.post('/login', loginWithPassword);
router.post('/password-reset', sendPasswordReset);

// User Profile (Authenticated)
router.get('/profile', authenticateToken, getCurrentUserProfile);
router.put('/profile', authenticateToken, updateProfile);
router.post('/profile', authenticateToken, updateProfile);
router.post('/profile/photo', authenticateToken, uploadProfilePhoto);

export default router;

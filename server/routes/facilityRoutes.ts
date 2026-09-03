import { Router } from 'express';
import { getFacilities, getNearbyFacilities, getFacilityById } from '../controllers/facilityController';

const router = Router();

router.get('/', getFacilities);
router.get('/nearby', getNearbyFacilities);
router.get('/:id', getFacilityById);

export default router;

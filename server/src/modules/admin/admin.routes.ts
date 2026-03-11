import { Router } from 'express';
import * as adminController from './admin.controller.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/users/pending', adminController.listPending);
router.get('/users', adminController.listAll);
router.post('/users/:userId/approve', adminController.approve);
router.post('/users/:userId/reject', adminController.reject);

export default router;

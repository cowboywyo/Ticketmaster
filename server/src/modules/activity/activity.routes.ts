import { Router } from 'express';
import * as activityController from './activity.controller.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = Router({ mergeParams: true });
router.use(authMiddleware);
router.get('/', activityController.list);

export default router;

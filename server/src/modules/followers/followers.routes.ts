import { Router } from 'express';
import * as followersController from './followers.controller.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.get('/', followersController.list);
router.get('/me', followersController.status);
router.post('/', followersController.follow);
router.delete('/', followersController.unfollow);

export default router;

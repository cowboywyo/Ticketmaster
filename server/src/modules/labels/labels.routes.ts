import { Router } from 'express';
import * as labelsController from './labels.controller.js';
import { authMiddleware } from '../../middleware/auth.js';
import { requireProjectMember } from '../../middleware/projectAccess.js';

const router = Router({ mergeParams: true });
router.use(authMiddleware);
router.use(requireProjectMember());

router.get('/', labelsController.list);
router.post('/', requireProjectMember('admin'), labelsController.create);
router.patch('/:labelId', requireProjectMember('admin'), labelsController.update);
router.delete('/:labelId', requireProjectMember('admin'), labelsController.remove);

export default router;

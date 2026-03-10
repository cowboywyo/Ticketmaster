import { Router } from 'express';
import * as commentsController from './comments.controller.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = Router({ mergeParams: true });
router.use(authMiddleware);

router.get('/', commentsController.list);
router.post('/', commentsController.create);
router.patch('/:commentId', commentsController.update);
router.delete('/:commentId', commentsController.remove);

export default router;

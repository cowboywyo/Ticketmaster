import { Router } from 'express';
import multer from 'multer';
import * as attachmentsController from './attachments.controller.js';
import { authMiddleware } from '../../middleware/auth.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });
const router = Router({ mergeParams: true });
router.use(authMiddleware);

router.get('/', attachmentsController.list);
router.post('/', upload.single('file'), attachmentsController.create);
router.delete('/:attachmentId', attachmentsController.remove);

export default router;

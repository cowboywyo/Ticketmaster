import { Router } from 'express';
import * as ticketsController from './tickets.controller.js';
import { validate } from '../../middleware/validate.js';
import { authMiddleware } from '../../middleware/auth.js';
import { requireProjectMember } from '../../middleware/projectAccess.js';
import { createTicketSchema, updateTicketSchema } from './tickets.validation.js';

const router = Router({ mergeParams: true });

router.use(authMiddleware);
router.use(requireProjectMember());

router.get('/', ticketsController.list);
router.post('/', validate(createTicketSchema), ticketsController.create);
router.get('/:ticketId', ticketsController.get);
router.patch('/:ticketId', validate(updateTicketSchema), ticketsController.update);
router.delete('/:ticketId', requireProjectMember('admin'), ticketsController.remove);

export default router;

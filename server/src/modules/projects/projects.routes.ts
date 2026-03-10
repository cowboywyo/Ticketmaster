import { Router } from 'express';
import * as projectsController from './projects.controller.js';
import { validate } from '../../middleware/validate.js';
import { authMiddleware } from '../../middleware/auth.js';
import { requireProjectMember } from '../../middleware/projectAccess.js';
import { createProjectSchema, updateProjectSchema, inviteMemberSchema } from './projects.validation.js';

const router = Router();

router.use(authMiddleware);

router.get('/', projectsController.list);
router.post('/', validate(createProjectSchema), projectsController.create);

router.get('/:projectId', requireProjectMember(), projectsController.get);
router.patch('/:projectId', requireProjectMember('admin'), validate(updateProjectSchema), projectsController.update);
router.delete('/:projectId', requireProjectMember('admin'), projectsController.remove);

router.get('/:projectId/members', requireProjectMember(), projectsController.listMembers);
router.post('/:projectId/members', requireProjectMember('admin'), validate(inviteMemberSchema), projectsController.inviteMember);
router.patch('/:projectId/members/:userId', requireProjectMember('admin'), projectsController.updateMemberRole);
router.delete('/:projectId/members/:userId', requireProjectMember('admin'), projectsController.removeMember);

export default router;

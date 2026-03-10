import { Request, Response, NextFunction } from 'express';
import db from '../db/connection.js';
import { ForbiddenError, UnauthorizedError } from '../utils/errors.js';

export function requireProjectMember(requiredRole?: 'admin') {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw new UnauthorizedError();

    const projectId = req.params.projectId as string | undefined;
    if (!projectId) return next();

    const member = await db('project_members')
      .where({ project_id: projectId, user_id: req.user.userId })
      .first();

    if (!member) throw new ForbiddenError('Not a member of this project');
    if (requiredRole === 'admin' && member.role !== 'admin') {
      throw new ForbiddenError('Admin access required');
    }

    (req as any).memberRole = member.role;
    next();
  };
}

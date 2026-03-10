import { Request, Response } from 'express';
import * as commentsService from './comments.service.js';

export async function list(req: Request, res: Response) {
  const comments = await commentsService.listComments(req.params.ticketId as string);
  res.json({ comments });
}

export async function create(req: Request, res: Response) {
  const comment = await commentsService.createComment(req.params.ticketId as string, req.user!.userId, req.body.body);
  res.status(201).json({ comment });
}

export async function update(req: Request, res: Response) {
  await commentsService.updateComment(req.params.commentId as string, req.user!.userId, req.body.body);
  res.json({ success: true });
}

export async function remove(req: Request, res: Response) {
  const isAdmin = (req as any).memberRole === 'admin';
  await commentsService.deleteComment(req.params.commentId as string, req.user!.userId, isAdmin);
  res.status(204).send();
}

import { Request, Response } from 'express';
import * as attachmentsService from './attachments.service.js';

export async function list(req: Request, res: Response) {
  const attachmentType = req.query.type as string | undefined;
  const attachments = await attachmentsService.listAttachments(req.params.ticketId as string, attachmentType);
  res.json({ attachments });
}

export async function create(req: Request, res: Response) {
  const file = req.file as Express.Multer.File;
  if (!file) {
    res.status(400).json({ error: { code: 'NO_FILE', message: 'No file uploaded' } });
    return;
  }
  const attachmentType = (req.body.attachmentType === 'log' ? 'log' : 'file') as 'file' | 'log';
  const attachment = await attachmentsService.createAttachment(
    req.params.ticketId as string,
    req.user!.userId,
    file,
    attachmentType,
  );
  res.status(201).json({ attachment });
}

export async function remove(req: Request, res: Response) {
  await attachmentsService.deleteAttachment(req.params.attachmentId as string);
  res.status(204).send();
}

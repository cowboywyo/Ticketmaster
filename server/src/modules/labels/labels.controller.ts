import { Request, Response } from 'express';
import * as labelsService from './labels.service.js';

export async function list(req: Request, res: Response) {
  const labels = await labelsService.listLabels(req.params.projectId as string);
  res.json({ labels });
}

export async function create(req: Request, res: Response) {
  const label = await labelsService.createLabel(req.params.projectId as string, req.body.name, req.body.color || '#6B7280');
  res.status(201).json({ label });
}

export async function update(req: Request, res: Response) {
  const label = await labelsService.updateLabel(req.params.labelId as string, req.body);
  res.json({ label });
}

export async function remove(req: Request, res: Response) {
  await labelsService.deleteLabel(req.params.labelId as string);
  res.status(204).send();
}

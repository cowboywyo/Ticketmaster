import { Request, Response } from 'express';
import * as adminService from './admin.service.js';

export async function listPending(req: Request, res: Response) {
  await adminService.requireRoot(req.user!.userId);
  const users = await adminService.listPendingUsers();
  res.json({ users });
}

export async function listAll(req: Request, res: Response) {
  await adminService.requireRoot(req.user!.userId);
  const users = await adminService.listAllUsers();
  res.json({ users });
}

export async function approve(req: Request, res: Response) {
  await adminService.requireRoot(req.user!.userId);
  await adminService.approveUser(req.params.userId as string);
  res.json({ success: true });
}

export async function reject(req: Request, res: Response) {
  await adminService.requireRoot(req.user!.userId);
  await adminService.rejectUser(req.params.userId as string);
  res.json({ success: true });
}

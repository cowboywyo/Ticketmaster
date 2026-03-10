import { Request, Response } from 'express';
import * as projectsService from './projects.service.js';

export async function list(req: Request, res: Response) {
  const projects = await projectsService.listProjects(req.user!.userId);
  res.json({ projects });
}

export async function get(req: Request, res: Response) {
  const project = await projectsService.getProject(req.params.projectId as string);
  res.json({ project });
}

export async function create(req: Request, res: Response) {
  const project = await projectsService.createProject(req.user!.userId, req.body);
  res.status(201).json({ project });
}

export async function update(req: Request, res: Response) {
  const project = await projectsService.updateProject(req.params.projectId as string, req.body);
  res.json({ project });
}

export async function remove(req: Request, res: Response) {
  await projectsService.deleteProject(req.params.projectId as string);
  res.status(204).send();
}

export async function listMembers(req: Request, res: Response) {
  const members = await projectsService.listMembers(req.params.projectId as string);
  res.json({ members });
}

export async function inviteMember(req: Request, res: Response) {
  const member = await projectsService.inviteMember(req.params.projectId as string, req.body.email, req.body.role);
  res.status(201).json({ member });
}

export async function updateMemberRole(req: Request, res: Response) {
  await projectsService.updateMemberRole(req.params.projectId as string, req.params.userId as string, req.body.role);
  res.json({ success: true });
}

export async function removeMember(req: Request, res: Response) {
  await projectsService.removeMember(req.params.projectId as string, req.params.userId as string);
  res.status(204).send();
}

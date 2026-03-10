import { Request, Response } from 'express';
import * as ticketsService from './tickets.service.js';
import { parsePagination } from '../../utils/pagination.js';

export async function list(req: Request, res: Response) {
  const pagination = parsePagination(req.query as any);
  const filters = {
    status: req.query.status as string | undefined,
    priority: req.query.priority as string | undefined,
    type: req.query.type as string | undefined,
    assigneeId: req.query.assigneeId as string | undefined,
    labelId: req.query.labelId as string | undefined,
    q: req.query.q as string | undefined,
    sort: req.query.sort as string | undefined,
    order: req.query.order as string | undefined,
  };
  const result = await ticketsService.listTickets(req.params.projectId as string, filters, pagination);
  res.json(result);
}

export async function get(req: Request, res: Response) {
  const ticket = await ticketsService.getTicket(req.params.ticketId as string);
  res.json({ ticket });
}

export async function create(req: Request, res: Response) {
  const ticket = await ticketsService.createTicket(req.params.projectId as string, req.user!.userId, req.body);
  res.status(201).json({ ticket });
}

export async function update(req: Request, res: Response) {
  const ticket = await ticketsService.updateTicket(req.params.ticketId as string, req.user!.userId, req.body);
  res.json({ ticket });
}

export async function remove(req: Request, res: Response) {
  await ticketsService.deleteTicket(req.params.ticketId as string);
  res.status(204).send();
}

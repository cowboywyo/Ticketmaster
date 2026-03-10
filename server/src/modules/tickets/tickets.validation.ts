import { z } from 'zod';

export const createTicketSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(10000).optional(),
  type: z.enum(['bug', 'feature', 'task', 'improvement']).default('bug'),
  priority: z.enum(['critical', 'high', 'medium', 'low']).default('medium'),
  assigneeId: z.string().uuid().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  labelIds: z.array(z.string().uuid()).optional(),
});

export const updateTicketSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(10000).optional().nullable(),
  type: z.enum(['bug', 'feature', 'task', 'improvement']).optional(),
  priority: z.enum(['critical', 'high', 'medium', 'low']).optional(),
  status: z.enum(['open', 'in_progress', 'in_review', 'resolved', 'closed']).optional(),
  assigneeId: z.string().uuid().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  labelIds: z.array(z.string().uuid()).optional(),
});

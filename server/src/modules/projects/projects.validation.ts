import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1).max(255),
  key: z.string().min(2).max(10).regex(/^[A-Z][A-Z0-9]*$/, 'Key must be uppercase letters/numbers, starting with a letter'),
  description: z.string().max(2000).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'member']).default('member'),
});

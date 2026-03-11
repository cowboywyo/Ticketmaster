import db from '../../db/connection.js';
import { NotFoundError, ForbiddenError } from '../../utils/errors.js';

export async function requireRoot(userId: string) {
  const user = await db('users').where({ id: userId }).first();
  if (!user || user.system_role !== 'root') {
    throw new ForbiddenError('Root access required');
  }
}

export async function listPendingUsers() {
  return db('users')
    .where({ approved: false })
    .select('id', 'email', 'display_name as displayName', 'system_role as systemRole', 'created_at as createdAt')
    .orderBy('created_at', 'asc');
}

export async function listAllUsers() {
  return db('users')
    .select('id', 'email', 'display_name as displayName', 'system_role as systemRole', 'approved', 'created_at as createdAt')
    .orderBy('created_at', 'desc');
}

export async function approveUser(userId: string) {
  const user = await db('users').where({ id: userId }).first();
  if (!user) throw new NotFoundError('User not found');
  if (user.approved) return; // already approved
  await db('users').where({ id: userId }).update({ approved: true, updated_at: db.fn.now() });
}

export async function rejectUser(userId: string) {
  const user = await db('users').where({ id: userId }).first();
  if (!user) throw new NotFoundError('User not found');
  if (user.system_role === 'root') throw new ForbiddenError('Cannot reject root user');
  // Delete the rejected user entirely
  await db('users').where({ id: userId }).delete();
}

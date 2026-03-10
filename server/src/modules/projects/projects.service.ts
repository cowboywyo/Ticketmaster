import { v4 as uuid } from 'uuid';
import db from '../../db/connection.js';
import { NotFoundError, ConflictError } from '../../utils/errors.js';

export async function listProjects(userId: string) {
  const projects = await db('projects')
    .join('project_members', 'projects.id', 'project_members.project_id')
    .where('project_members.user_id', userId)
    .select(
      'projects.id',
      'projects.name',
      'projects.key',
      'projects.description',
      'projects.owner_id',
      'projects.created_at',
      'project_members.role as myRole'
    );

  // Add member count for each project
  const projectIds = projects.map((p) => p.id);
  const counts = await db('project_members')
    .whereIn('project_id', projectIds)
    .groupBy('project_id')
    .select('project_id')
    .count('* as memberCount');

  const countMap = new Map(counts.map((c: any) => [c.project_id, c.memberCount]));

  return projects.map((p) => ({
    ...p,
    memberCount: countMap.get(p.id) || 0,
  }));
}

export async function getProject(projectId: string) {
  const project = await db('projects').where({ id: projectId }).first();
  if (!project) throw new NotFoundError('Project not found');
  return project;
}

export async function createProject(userId: string, data: { name: string; key: string; description?: string }) {
  const existing = await db('projects').where({ key: data.key }).first();
  if (existing) throw new ConflictError('Project key already exists');

  const id = uuid();
  await db.transaction(async (trx) => {
    await trx('projects').insert({
      id,
      name: data.name,
      key: data.key,
      description: data.description || null,
      owner_id: userId,
    });
    await trx('project_members').insert({
      id: uuid(),
      project_id: id,
      user_id: userId,
      role: 'admin',
    });
  });

  return db('projects').where({ id }).first();
}

export async function updateProject(projectId: string, data: { name?: string; description?: string }) {
  await db('projects').where({ id: projectId }).update({ ...data, updated_at: db.fn.now() });
  return db('projects').where({ id: projectId }).first();
}

export async function deleteProject(projectId: string) {
  await db('projects').where({ id: projectId }).delete();
}

export async function listMembers(projectId: string) {
  return db('project_members')
    .join('users', 'project_members.user_id', 'users.id')
    .where('project_members.project_id', projectId)
    .select(
      'users.id',
      'users.email',
      'users.display_name as displayName',
      'users.avatar_url as avatarUrl',
      'project_members.role',
      'project_members.invited_at as invitedAt'
    );
}

export async function inviteMember(projectId: string, email: string, role: string) {
  const user = await db('users').where({ email }).first();
  if (!user) throw new NotFoundError('User not found with that email');

  const existing = await db('project_members')
    .where({ project_id: projectId, user_id: user.id })
    .first();
  if (existing) throw new ConflictError('User is already a member');

  await db('project_members').insert({
    id: uuid(),
    project_id: projectId,
    user_id: user.id,
    role,
  });

  return { id: user.id, email: user.email, displayName: user.display_name, role };
}

export async function updateMemberRole(projectId: string, userId: string, role: string) {
  const updated = await db('project_members')
    .where({ project_id: projectId, user_id: userId })
    .update({ role });
  if (!updated) throw new NotFoundError('Member not found');
}

export async function removeMember(projectId: string, userId: string) {
  const deleted = await db('project_members')
    .where({ project_id: projectId, user_id: userId })
    .delete();
  if (!deleted) throw new NotFoundError('Member not found');
}

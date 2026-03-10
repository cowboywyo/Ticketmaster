import { v4 as uuid } from 'uuid';
import db from '../../db/connection.js';
import { NotFoundError, ConflictError } from '../../utils/errors.js';

export async function listLabels(projectId: string) {
  return db('labels').where({ project_id: projectId }).select('id', 'name', 'color').orderBy('name');
}

export async function createLabel(projectId: string, name: string, color: string) {
  const existing = await db('labels').where({ project_id: projectId, name }).first();
  if (existing) throw new ConflictError('Label already exists');
  const id = uuid();
  await db('labels').insert({ id, project_id: projectId, name, color });
  return { id, name, color };
}

export async function updateLabel(labelId: string, data: { name?: string; color?: string }) {
  const updated = await db('labels').where({ id: labelId }).update(data);
  if (!updated) throw new NotFoundError('Label not found');
  return db('labels').where({ id: labelId }).first();
}

export async function deleteLabel(labelId: string) {
  await db('labels').where({ id: labelId }).delete();
}

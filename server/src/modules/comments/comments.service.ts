import { v4 as uuid } from 'uuid';
import db from '../../db/connection.js';
import { NotFoundError, ForbiddenError } from '../../utils/errors.js';

export async function listComments(ticketId: string) {
  return db('comments')
    .where('comments.ticket_id', ticketId)
    .join('users', 'comments.author_id', 'users.id')
    .select(
      'comments.id',
      'comments.body',
      'comments.created_at as createdAt',
      'comments.updated_at as updatedAt',
      'users.id as authorId',
      'users.display_name as authorName',
      'users.email as authorEmail',
      'users.avatar_url as authorAvatar'
    )
    .orderBy('comments.created_at', 'asc');
}

export async function createComment(ticketId: string, authorId: string, body: string) {
  const id = uuid();
  await db('comments').insert({ id, ticket_id: ticketId, author_id: authorId, body });
  await db('activity_logs').insert({
    id: uuid(),
    ticket_id: ticketId,
    user_id: authorId,
    action: 'comment_added',
    new_value: body.slice(0, 200),
  });
  return db('comments')
    .where('comments.id', id)
    .join('users', 'comments.author_id', 'users.id')
    .select(
      'comments.id',
      'comments.body',
      'comments.created_at as createdAt',
      'comments.updated_at as updatedAt',
      'users.id as authorId',
      'users.display_name as authorName',
      'users.email as authorEmail'
    )
    .first();
}

export async function updateComment(commentId: string, userId: string, body: string) {
  const comment = await db('comments').where({ id: commentId }).first();
  if (!comment) throw new NotFoundError('Comment not found');
  if (comment.author_id !== userId) throw new ForbiddenError('Can only edit your own comments');
  await db('comments').where({ id: commentId }).update({ body, updated_at: db.fn.now() });
}

export async function deleteComment(commentId: string, userId: string, isAdmin: boolean) {
  const comment = await db('comments').where({ id: commentId }).first();
  if (!comment) throw new NotFoundError('Comment not found');
  if (comment.author_id !== userId && !isAdmin) throw new ForbiddenError('Can only delete your own comments');
  await db('comments').where({ id: commentId }).delete();
}

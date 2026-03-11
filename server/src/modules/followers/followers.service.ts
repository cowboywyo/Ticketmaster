import db from '../../db/connection.js';
import { ConflictError, NotFoundError, ForbiddenError } from '../../utils/errors.js';

/** Get explicit followers (DB rows only) */
export async function getExplicitFollowers(ticketId: string) {
  return db('ticket_followers')
    .join('users', 'ticket_followers.user_id', 'users.id')
    .where('ticket_followers.ticket_id', ticketId)
    .select(
      'users.id',
      'users.email',
      'users.display_name as displayName',
      'users.avatar_url as avatarUrl',
      'ticket_followers.created_at as followedAt'
    );
}

/** Get ALL follower emails for notification (implicit + explicit, deduplicated) */
export async function getAllFollowerEmails(
  ticketId: string,
  excludeUserId?: string
): Promise<{ id: string; email: string; displayName: string }[]> {
  const ticket = await db('tickets').where({ id: ticketId }).first();
  if (!ticket) throw new NotFoundError('Ticket not found');

  // Implicit followers: reporter + assignee
  const implicitUserIds: string[] = [ticket.reporter_id];
  if (ticket.assignee_id) implicitUserIds.push(ticket.assignee_id);

  // Explicit followers from DB
  const explicitRows = await db('ticket_followers')
    .where({ ticket_id: ticketId })
    .select('user_id');
  const explicitUserIds = explicitRows.map((r: any) => r.user_id as string);

  // Deduplicate
  const allUserIds = [...new Set([...implicitUserIds, ...explicitUserIds])];

  // Exclude the person who triggered the change
  const filteredIds = excludeUserId
    ? allUserIds.filter((id) => id !== excludeUserId)
    : allUserIds;

  if (filteredIds.length === 0) return [];

  return db('users')
    .whereIn('id', filteredIds)
    .select('id', 'email', 'display_name as displayName');
}

/** Follow a ticket (explicit) */
export async function followTicket(ticketId: string, userId: string) {
  // Verify ticket exists
  const ticket = await db('tickets').where({ id: ticketId }).first();
  if (!ticket) throw new NotFoundError('Ticket not found');

  // Verify the user is a project member
  const member = await db('project_members')
    .where({ project_id: ticket.project_id, user_id: userId })
    .first();
  if (!member) throw new ForbiddenError('Only project members can follow tickets');

  const existing = await db('ticket_followers')
    .where({ ticket_id: ticketId, user_id: userId })
    .first();
  if (existing) throw new ConflictError('Already following this ticket');

  await db('ticket_followers').insert({
    ticket_id: ticketId,
    user_id: userId,
  });
}

/** Unfollow a ticket (explicit) */
export async function unfollowTicket(ticketId: string, userId: string) {
  const deleted = await db('ticket_followers')
    .where({ ticket_id: ticketId, user_id: userId })
    .delete();
  if (!deleted) throw new NotFoundError('Not following this ticket');
}

/** Check if a specific user is explicitly following */
export async function isFollowing(ticketId: string, userId: string): Promise<boolean> {
  const row = await db('ticket_followers')
    .where({ ticket_id: ticketId, user_id: userId })
    .first();
  return !!row;
}

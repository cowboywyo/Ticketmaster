import { Request, Response } from 'express';
import db from '../../db/connection.js';

export async function list(req: Request, res: Response) {
  const activity = await db('activity_logs')
    .where('activity_logs.ticket_id', req.params.ticketId as string)
    .join('users', 'activity_logs.user_id', 'users.id')
    .select(
      'activity_logs.id',
      'activity_logs.action',
      'activity_logs.old_value as oldValue',
      'activity_logs.new_value as newValue',
      'activity_logs.created_at as createdAt',
      'users.id as userId',
      'users.display_name as userName',
      'users.email as userEmail'
    )
    .orderBy('activity_logs.created_at', 'desc');

  res.json({ activity });
}

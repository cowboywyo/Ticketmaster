import { v4 as uuid } from 'uuid';
import db from '../../db/connection.js';
import { NotFoundError } from '../../utils/errors.js';
import { PaginationParams, PaginatedResult } from '../../utils/pagination.js';
import { getAllFollowerEmails } from '../followers/followers.service.js';
import { sendEmail, buildStatusChangeEmail } from '../../services/email.js';
import config from '../../config/index.js';

interface CreateTicketData {
  title: string;
  description?: string;
  type?: string;
  priority?: string;
  assigneeId?: string | null;
  dueDate?: string | null;
  labelIds?: string[];
}

interface UpdateTicketData {
  title?: string;
  description?: string | null;
  type?: string;
  priority?: string;
  status?: string;
  assigneeId?: string | null;
  dueDate?: string | null;
  labelIds?: string[];
}

interface TicketFilters {
  status?: string;
  priority?: string;
  type?: string;
  assigneeId?: string;
  labelId?: string;
  q?: string;
  sort?: string;
  order?: string;
}

async function logActivity(ticketId: string, userId: string, action: string, oldValue?: string | null, newValue?: string | null) {
  await db('activity_logs').insert({
    id: uuid(),
    ticket_id: ticketId,
    user_id: userId,
    action,
    old_value: oldValue || null,
    new_value: newValue || null,
  });
}

export async function listTickets(
  projectId: string,
  filters: TicketFilters,
  pagination: PaginationParams
): Promise<PaginatedResult<any>> {
  let query = db('tickets')
    .where('tickets.project_id', projectId)
    .leftJoin('users as reporter', 'tickets.reporter_id', 'reporter.id')
    .leftJoin('users as assignee', 'tickets.assignee_id', 'assignee.id');

  if (filters.status) {
    const statuses = filters.status.split(',');
    query = query.whereIn('tickets.status', statuses);
  }
  if (filters.priority) {
    const priorities = filters.priority.split(',');
    query = query.whereIn('tickets.priority', priorities);
  }
  if (filters.type) {
    const types = filters.type.split(',');
    query = query.whereIn('tickets.type', types);
  }
  if (filters.assigneeId) {
    query = query.where('tickets.assignee_id', filters.assigneeId);
  }
  if (filters.labelId) {
    query = query.whereIn('tickets.id', function () {
      this.select('ticket_id').from('ticket_labels').where('label_id', filters.labelId!);
    });
  }
  if (filters.q) {
    const term = `%${filters.q}%`;
    query = query.where(function () {
      this.where('tickets.title', 'like', term).orWhere('tickets.description', 'like', term);
    });
  }

  const countResult = await query.clone().count('tickets.id as total').first();
  const total = (countResult as any)?.total || 0;

  const sort = filters.sort || 'created_at';
  const order = filters.order === 'asc' ? 'asc' : 'desc';
  const validSorts = ['created_at', 'updated_at', 'priority', 'status', 'ticket_number', 'title', 'due_date'];
  const sortColumn = validSorts.includes(sort) ? `tickets.${sort}` : 'tickets.created_at';

  const offset = (pagination.page - 1) * pagination.limit;
  const data = await query
    .select(
      'tickets.*',
      'reporter.display_name as reporter_name',
      'reporter.email as reporter_email',
      'assignee.display_name as assignee_name',
      'assignee.email as assignee_email'
    )
    .orderBy(sortColumn, order)
    .limit(pagination.limit)
    .offset(offset);

  // Get labels for these tickets
  const ticketIds = data.map((t: any) => t.id);
  const labels = ticketIds.length
    ? await db('ticket_labels')
        .join('labels', 'ticket_labels.label_id', 'labels.id')
        .whereIn('ticket_labels.ticket_id', ticketIds)
        .select('ticket_labels.ticket_id', 'labels.id', 'labels.name', 'labels.color')
    : [];

  const labelMap = new Map<string, any[]>();
  for (const l of labels) {
    const arr = labelMap.get(l.ticket_id) || [];
    arr.push({ id: l.id, name: l.name, color: l.color });
    labelMap.set(l.ticket_id, arr);
  }

  const enriched = data.map((t: any) => ({
    id: t.id,
    projectId: t.project_id,
    ticketNumber: t.ticket_number,
    title: t.title,
    description: t.description,
    type: t.type,
    priority: t.priority,
    status: t.status,
    reporter: { id: t.reporter_id, name: t.reporter_name, email: t.reporter_email },
    assignee: t.assignee_id
      ? { id: t.assignee_id, name: t.assignee_name, email: t.assignee_email }
      : null,
    dueDate: t.due_date,
    labels: labelMap.get(t.id) || [],
    createdAt: t.created_at,
    updatedAt: t.updated_at,
  }));

  return {
    data: enriched,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit),
    },
  };
}

export async function getTicket(ticketId: string) {
  const t = await db('tickets')
    .where('tickets.id', ticketId)
    .leftJoin('users as reporter', 'tickets.reporter_id', 'reporter.id')
    .leftJoin('users as assignee', 'tickets.assignee_id', 'assignee.id')
    .leftJoin('projects', 'tickets.project_id', 'projects.id')
    .select(
      'tickets.*',
      'reporter.display_name as reporter_name',
      'reporter.email as reporter_email',
      'assignee.display_name as assignee_name',
      'assignee.email as assignee_email',
      'projects.key as project_key'
    )
    .first();

  if (!t) throw new NotFoundError('Ticket not found');

  const labels = await db('ticket_labels')
    .join('labels', 'ticket_labels.label_id', 'labels.id')
    .where('ticket_labels.ticket_id', ticketId)
    .select('labels.id', 'labels.name', 'labels.color');

  return {
    id: t.id,
    projectId: t.project_id,
    projectKey: t.project_key,
    ticketNumber: t.ticket_number,
    title: t.title,
    description: t.description,
    type: t.type,
    priority: t.priority,
    status: t.status,
    reporter: { id: t.reporter_id, name: t.reporter_name, email: t.reporter_email },
    assignee: t.assignee_id
      ? { id: t.assignee_id, name: t.assignee_name, email: t.assignee_email }
      : null,
    dueDate: t.due_date,
    labels,
    createdAt: t.created_at,
    updatedAt: t.updated_at,
  };
}

export async function createTicket(projectId: string, userId: string, data: CreateTicketData) {
  const id = uuid();

  await db.transaction(async (trx) => {
    const result = await trx('tickets')
      .where({ project_id: projectId })
      .max('ticket_number as maxNum')
      .first();
    const ticketNumber = ((result as any)?.maxNum || 0) + 1;

    await trx('tickets').insert({
      id,
      project_id: projectId,
      ticket_number: ticketNumber,
      title: data.title,
      description: data.description || null,
      type: data.type || 'bug',
      priority: data.priority || 'medium',
      status: 'open',
      reporter_id: userId,
      assignee_id: data.assigneeId || null,
      due_date: data.dueDate || null,
    });

    if (data.labelIds?.length) {
      await trx('ticket_labels').insert(
        data.labelIds.map((labelId) => ({ ticket_id: id, label_id: labelId }))
      );
    }

    await trx('activity_logs').insert({
      id: uuid(),
      ticket_id: id,
      user_id: userId,
      action: 'ticket_created',
      new_value: data.title,
    });
  });

  return getTicket(id);
}

export async function updateTicket(ticketId: string, userId: string, data: UpdateTicketData) {
  const existing = await db('tickets').where({ id: ticketId }).first();
  if (!existing) throw new NotFoundError('Ticket not found');

  await db.transaction(async (trx) => {
    const updates: Record<string, any> = { updated_at: db.fn.now() };
    const trackFields = ['title', 'type', 'priority', 'status'] as const;

    for (const field of trackFields) {
      if (data[field] !== undefined && data[field] !== existing[field]) {
        updates[field] = data[field];
        await logActivity(ticketId, userId, `${field}_change`, existing[field], data[field]);
      }
    }

    if (data.description !== undefined) {
      updates.description = data.description;
    }

    if (data.assigneeId !== undefined && data.assigneeId !== existing.assignee_id) {
      updates.assignee_id = data.assigneeId;
      await logActivity(ticketId, userId, 'assignment_change', existing.assignee_id, data.assigneeId);
    }

    if (data.dueDate !== undefined) {
      updates.due_date = data.dueDate;
    }

    await trx('tickets').where({ id: ticketId }).update(updates);

    if (data.labelIds !== undefined) {
      await trx('ticket_labels').where({ ticket_id: ticketId }).delete();
      if (data.labelIds.length) {
        await trx('ticket_labels').insert(
          data.labelIds.map((labelId) => ({ ticket_id: ticketId, label_id: labelId }))
        );
      }
    }
  });

  // Fire-and-forget email notifications for status changes
  if (data.status !== undefined && data.status !== existing.status) {
    (async () => {
      try {
        const followers = await getAllFollowerEmails(ticketId, userId);
        if (followers.length === 0) return;

        const ticket = await getTicket(ticketId);
        const changedByUser = await db('users').where({ id: userId }).select('display_name').first();
        const ticketKey = `${ticket.projectKey}-${ticket.ticketNumber}`;
        const ticketUrl = `${config.clientUrl}/projects/${ticket.projectId}/tickets/${ticketId}`;

        const { subject, html } = buildStatusChangeEmail({
          ticketKey,
          ticketTitle: ticket.title,
          oldStatus: existing.status,
          newStatus: data.status!,
          changedByName: changedByUser?.display_name || 'Someone',
          ticketUrl,
        });

        await Promise.all(
          followers.map((f) => sendEmail(f.email, subject, html))
        );
      } catch (err) {
        console.error('[Notification error]', err);
      }
    })();
  }

  return getTicket(ticketId);
}

export async function deleteTicket(ticketId: string) {
  const deleted = await db('tickets').where({ id: ticketId }).delete();
  if (!deleted) throw new NotFoundError('Ticket not found');
}

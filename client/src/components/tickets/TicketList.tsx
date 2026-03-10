import { Link, useParams } from 'react-router-dom';
import { StatusBadge } from './StatusBadge';
import { PriorityIcon } from './PriorityIcon';
import { Badge } from '../ui/Badge';
import { timeAgo } from '../../utils/formatDate';
import { TYPE_COLORS, TYPE_LABELS } from '../../utils/constants';
import type { Ticket } from '../../types';

interface Props {
  tickets: Ticket[];
  projectKey: string;
}

export function TicketList({ tickets, projectKey }: Props) {
  const { projectId } = useParams();

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No tickets found. Create your first ticket to get started.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
          <tr>
            <th className="px-4 py-3 text-left">ID</th>
            <th className="px-4 py-3 text-left">Title</th>
            <th className="px-4 py-3 text-left">Type</th>
            <th className="px-4 py-3 text-left">Priority</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Assignee</th>
            <th className="px-4 py-3 text-left">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {tickets.map((ticket) => (
            <tr key={ticket.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                {projectKey}-{ticket.ticketNumber}
              </td>
              <td className="px-4 py-3">
                <Link
                  to={`/projects/${projectId}/tickets/${ticket.id}`}
                  className="text-sm font-medium text-gray-900 hover:text-indigo-600"
                >
                  {ticket.title}
                </Link>
                <div className="flex gap-1 mt-1">
                  {ticket.labels.map((l) => (
                    <Badge key={l.id} color={l.color}>
                      {l.name}
                    </Badge>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3">
                <Badge className={TYPE_COLORS[ticket.type]}>{TYPE_LABELS[ticket.type]}</Badge>
              </td>
              <td className="px-4 py-3">
                <PriorityIcon priority={ticket.priority} />
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={ticket.status} />
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {ticket.assignee?.name || '-'}
              </td>
              <td className="px-4 py-3 text-xs text-gray-500">
                {timeAgo(ticket.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

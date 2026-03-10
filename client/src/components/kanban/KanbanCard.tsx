import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link, useParams } from 'react-router-dom';
import { PriorityIcon } from '../tickets/PriorityIcon';
import { Badge } from '../ui/Badge';
import { TYPE_COLORS, TYPE_LABELS } from '../../utils/constants';
import type { Ticket } from '../../types';

export function KanbanCard({ ticket, projectKey }: { ticket: Ticket; projectKey: string }) {
  const { projectId } = useParams();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: ticket.id,
    data: { ticket },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-lg border p-3 shadow-sm hover:shadow cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-center gap-1 mb-1">
        <span className="text-xs text-gray-400 font-mono">
          {projectKey}-{ticket.ticketNumber}
        </span>
        <Badge className={TYPE_COLORS[ticket.type] + ' text-[10px] py-0'}>{TYPE_LABELS[ticket.type]}</Badge>
      </div>
      <Link
        to={`/projects/${projectId}/tickets/${ticket.id}`}
        className="text-sm font-medium text-gray-900 hover:text-indigo-600 block mb-2"
        onClick={(e) => e.stopPropagation()}
      >
        {ticket.title}
      </Link>
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {ticket.labels.slice(0, 2).map((l) => (
            <Badge key={l.id} color={l.color} className="text-[10px]">
              {l.name}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <PriorityIcon priority={ticket.priority} />
          {ticket.assignee && (
            <span className="w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full text-[10px] flex items-center justify-center font-medium">
              {ticket.assignee.name?.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

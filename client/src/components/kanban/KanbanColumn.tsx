import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard } from './KanbanCard';
import { STATUS_LABELS, STATUS_COLORS } from '../../utils/constants';
import { cn } from '../../utils/cn';
import type { Ticket } from '../../types';

interface Props {
  status: string;
  tickets: Ticket[];
  projectKey: string;
}

export function KanbanColumn({ status, tickets, projectKey }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex-shrink-0 w-72">
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', STATUS_COLORS[status])}>
          {STATUS_LABELS[status]}
        </span>
        <span className="text-xs text-gray-400">{tickets.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          'space-y-2 min-h-[200px] p-2 rounded-lg transition-colors',
          isOver ? 'bg-indigo-50' : 'bg-gray-100'
        )}
      >
        <SortableContext items={tickets.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tickets.map((ticket) => (
            <KanbanCard key={ticket.id} ticket={ticket} projectKey={projectKey} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

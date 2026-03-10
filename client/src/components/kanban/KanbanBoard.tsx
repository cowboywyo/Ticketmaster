import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTicket } from '../../api/tickets';
import { KanbanColumn } from './KanbanColumn';
import { STATUSES } from '../../utils/constants';
import type { Ticket } from '../../types';

interface Props {
  tickets: Ticket[];
  projectId: string;
  projectKey: string;
}

export function KanbanBoard({ tickets, projectId, projectKey }: Props) {
  const queryClient = useQueryClient();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const mutation = useMutation({
    mutationFn: ({ ticketId, status }: { ticketId: string; status: string }) =>
      updateTicket(projectId, ticketId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets', projectId] });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const ticketId = active.id as string;
    const newStatus = over.id as string;
    const ticket = tickets.find((t) => t.id === ticketId);

    if (ticket && ticket.status !== newStatus && STATUSES.includes(newStatus as any)) {
      // Optimistic update
      queryClient.setQueryData(['tickets', projectId], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((t: Ticket) =>
            t.id === ticketId ? { ...t, status: newStatus } : t
          ),
        };
      });
      mutation.mutate({ ticketId, status: newStatus });
    }
  };

  const grouped = STATUSES.reduce(
    (acc, status) => {
      acc[status] = tickets.filter((t) => t.status === status);
      return acc;
    },
    {} as Record<string, Ticket[]>
  );

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tickets={grouped[status] || []}
            projectKey={projectKey}
          />
        ))}
      </div>
    </DndContext>
  );
}

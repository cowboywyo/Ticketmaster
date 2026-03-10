import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listTickets } from '../api/tickets';
import { getProject } from '../api/projects';
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { TicketFilters } from '../components/tickets/TicketFilters';
import { TicketForm } from '../components/tickets/TicketForm';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { Plus, List } from 'lucide-react';

export function ProjectBoardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [showCreate, setShowCreate] = useState(false);
  const [filters, setFilters] = useState({ status: '', priority: '', type: '', q: '' });

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProject(projectId!),
    enabled: !!projectId,
  });

  const params: Record<string, string> = { limit: '200' };
  if (filters.priority) params.priority = filters.priority;
  if (filters.type) params.type = filters.type;
  if (filters.q) params.q = filters.q;

  const { data, isLoading } = useQuery({
    queryKey: ['tickets', projectId, params],
    queryFn: () => listTickets(projectId!, params),
    enabled: !!projectId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">{project?.name}</h1>
          <Link
            to={`/projects/${projectId}/list`}
            className="text-gray-400 hover:text-gray-600"
            title="List view"
          >
            <List size={18} />
          </Link>
        </div>
        <Button onClick={() => setShowCreate(true)} size="sm">
          <Plus size={14} className="mr-1" /> New Ticket
        </Button>
      </div>
      <div className="mb-4">
        <TicketFilters filters={filters} onChange={setFilters} />
      </div>
      <KanbanBoard
        tickets={data?.data || []}
        projectId={projectId!}
        projectKey={project?.key || ''}
      />
      <TicketForm projectId={projectId!} open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}

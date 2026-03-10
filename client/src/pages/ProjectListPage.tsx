import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listTickets } from '../api/tickets';
import { getProject } from '../api/projects';
import { TicketList } from '../components/tickets/TicketList';
import { TicketFilters } from '../components/tickets/TicketFilters';
import { TicketForm } from '../components/tickets/TicketForm';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { Plus, Columns3 } from 'lucide-react';

export function ProjectListPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [showCreate, setShowCreate] = useState(false);
  const [filters, setFilters] = useState({ status: '', priority: '', type: '', q: '' });
  const [page, setPage] = useState(1);

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProject(projectId!),
    enabled: !!projectId,
  });

  const params: Record<string, string> = { page: String(page), limit: '25' };
  if (filters.status) params.status = filters.status;
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

  const totalPages = data?.pagination?.totalPages || 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">{project?.name}</h1>
          <Link
            to={`/projects/${projectId}/board`}
            className="text-gray-400 hover:text-gray-600"
            title="Board view"
          >
            <Columns3 size={18} />
          </Link>
        </div>
        <Button onClick={() => setShowCreate(true)} size="sm">
          <Plus size={14} className="mr-1" /> New Ticket
        </Button>
      </div>
      <div className="mb-4">
        <TicketFilters filters={filters} onChange={setFilters} />
      </div>
      <TicketList tickets={data?.data || []} projectKey={project?.key || ''} />
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
      <TicketForm projectId={projectId!} open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}

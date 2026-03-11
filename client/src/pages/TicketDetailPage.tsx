import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTicket, updateTicket, deleteTicket } from '../api/tickets';
import { listMembers } from '../api/projects';
import { listLabels } from '../api/labels';
import { CommentList } from '../components/comments/CommentList';
import { FileUpload } from '../components/attachments/FileUpload';
import { LogFileUpload } from '../components/attachments/LogFileUpload';
import { ActivityFeed } from '../components/activity/ActivityFeed';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Spinner } from '../components/ui/Spinner';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { STATUSES, PRIORITIES, STATUS_LABELS, PRIORITY_LABELS, TYPE_LABELS, TYPE_COLORS } from '../utils/constants';
import { formatDateTime } from '../utils/formatDate';
import toast from 'react-hot-toast';
import type { Ticket, ProjectMember, Label } from '../types';

export function TicketDetailPage() {
  const { projectId, ticketId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: ticket, isLoading } = useQuery<Ticket>({
    queryKey: ['ticket', ticketId],
    queryFn: () => getTicket(projectId!, ticketId!),
    enabled: !!projectId && !!ticketId,
  });

  const { data: members = [] } = useQuery<ProjectMember[]>({
    queryKey: ['members', projectId],
    queryFn: () => listMembers(projectId!),
    enabled: !!projectId,
  });

  const { data: labels = [] } = useQuery<Label[]>({
    queryKey: ['labels', projectId],
    queryFn: () => listLabels(projectId!),
    enabled: !!projectId,
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateTicket(projectId!, ticketId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['tickets', projectId] });
      queryClient.invalidateQueries({ queryKey: ['activity', ticketId] });
      toast.success('Updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTicket(projectId!, ticketId!),
    onSuccess: () => {
      toast.success('Ticket deleted');
      navigate(`/projects/${projectId}/list`);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (!ticket) return <div className="text-center py-12 text-gray-500">Ticket not found</div>;

  return (
    <div className="max-w-5xl">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft size={14} /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-400 font-mono">
                {ticket.projectKey}-{ticket.ticketNumber}
              </span>
              <Badge className={TYPE_COLORS[ticket.type]}>{TYPE_LABELS[ticket.type]}</Badge>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-4">{ticket.title}</h1>
            {ticket.description && (
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                {ticket.description}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg border p-6">
            <CommentList ticketId={ticketId!} />
          </div>

          <div className="bg-white rounded-lg border p-6">
            <FileUpload ticketId={ticketId!} />
          </div>

          <div className="bg-white rounded-lg border p-6">
            <LogFileUpload ticketId={ticketId!} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg border p-4 space-y-4">
            <Select
              id="detail-status"
              label="Status"
              value={ticket.status}
              onChange={(e) => updateMutation.mutate({ status: e.target.value })}
              options={STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }))}
            />
            <Select
              id="detail-priority"
              label="Priority"
              value={ticket.priority}
              onChange={(e) => updateMutation.mutate({ priority: e.target.value })}
              options={PRIORITIES.map((p) => ({ value: p, label: PRIORITY_LABELS[p] }))}
            />
            <Select
              id="detail-assignee"
              label="Assignee"
              value={ticket.assignee?.id || ''}
              onChange={(e) => updateMutation.mutate({ assigneeId: e.target.value || null })}
              options={[
                { value: '', label: 'Unassigned' },
                ...members.map((m) => ({ value: m.id, label: m.displayName })),
              ]}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Labels</label>
              <div className="flex flex-wrap gap-1">
                {labels.map((label) => {
                  const isSelected = ticket.labels.some((l) => l.id === label.id);
                  return (
                    <button
                      key={label.id}
                      onClick={() => {
                        const newLabels = isSelected
                          ? ticket.labels.filter((l) => l.id !== label.id).map((l) => l.id)
                          : [...ticket.labels.map((l) => l.id), label.id];
                        updateMutation.mutate({ labelIds: newLabels });
                      }}
                      className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                        isSelected ? 'border-transparent text-white' : 'border-gray-300 text-gray-600'
                      }`}
                      style={isSelected ? { backgroundColor: label.color } : undefined}
                    >
                      {label.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="text-xs text-gray-500 space-y-1 pt-2 border-t">
              <p>Reporter: {ticket.reporter.name}</p>
              <p>Created: {formatDateTime(ticket.createdAt)}</p>
              <p>Updated: {formatDateTime(ticket.updatedAt)}</p>
            </div>

            <Button
              variant="danger"
              size="sm"
              className="w-full"
              onClick={() => {
                if (confirm('Delete this ticket?')) deleteMutation.mutate();
              }}
            >
              <Trash2 size={14} className="mr-1" /> Delete Ticket
            </Button>
          </div>

          <div className="bg-white rounded-lg border p-4">
            <ActivityFeed ticketId={ticketId!} />
          </div>
        </div>
      </div>
    </div>
  );
}

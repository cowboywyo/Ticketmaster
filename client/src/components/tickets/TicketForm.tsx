import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createTicket } from '../../api/tickets';
import { listMembers } from '../../api/projects';
import { listLabels } from '../../api/labels';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { TICKET_TYPES, PRIORITIES, TYPE_LABELS, PRIORITY_LABELS } from '../../utils/constants';
import toast from 'react-hot-toast';
import type { ProjectMember, Label } from '../../types';

interface Props {
  projectId: string;
  open: boolean;
  onClose: () => void;
}

export function TicketForm({ projectId, open, onClose }: Props) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('bug');
  const [priority, setPriority] = useState('medium');
  const [assigneeId, setAssigneeId] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  const { data: members = [] } = useQuery<ProjectMember[]>({
    queryKey: ['members', projectId],
    queryFn: () => listMembers(projectId),
    enabled: open,
  });

  const { data: labels = [] } = useQuery<Label[]>({
    queryKey: ['labels', projectId],
    queryFn: () => listLabels(projectId),
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: () =>
      createTicket(projectId, {
        title,
        description,
        type,
        priority,
        assigneeId: assigneeId || undefined,
        labelIds: selectedLabels.length ? selectedLabels : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets', projectId] });
      toast.success('Ticket created');
      onClose();
      setTitle('');
      setDescription('');
      setType('bug');
      setPriority('medium');
      setAssigneeId('');
      setSelectedLabels([]);
    },
    onError: (err: any) => toast.error(err.response?.data?.error?.message || 'Failed'),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  const toggleLabel = (id: string) => {
    setSelectedLabels((prev) => (prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]));
  };

  return (
    <Modal open={open} onClose={onClose} title="Create Ticket">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="ticket-title"
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue (markdown supported)"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select
            id="ticket-type"
            label="Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={TICKET_TYPES.map((t) => ({ value: t, label: TYPE_LABELS[t] }))}
          />
          <Select
            id="ticket-priority"
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            options={PRIORITIES.map((p) => ({ value: p, label: PRIORITY_LABELS[p] }))}
          />
        </div>
        <Select
          id="ticket-assignee"
          label="Assignee"
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
          options={[
            { value: '', label: 'Unassigned' },
            ...members.map((m) => ({ value: m.id, label: m.displayName })),
          ]}
        />
        {labels.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Labels</label>
            <div className="flex flex-wrap gap-2">
              {labels.map((label) => (
                <button
                  key={label.id}
                  type="button"
                  onClick={() => toggleLabel(label.id)}
                  className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                    selectedLabels.includes(label.id)
                      ? 'border-transparent text-white'
                      : 'border-gray-300 text-gray-600'
                  }`}
                  style={
                    selectedLabels.includes(label.id)
                      ? { backgroundColor: label.color }
                      : undefined
                  }
                >
                  {label.name}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Creating...' : 'Create Ticket'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

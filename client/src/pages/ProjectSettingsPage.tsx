import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProject, updateProject } from '../api/projects';
import { listLabels, createLabel, deleteLabel } from '../api/labels';
import { MemberManagement } from '../components/projects/MemberManagement';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Label } from '../types';

export function ProjectSettingsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProject(projectId!),
    enabled: !!projectId,
  });

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [initialized, setInitialized] = useState(false);

  if (project && !initialized) {
    setName(project.name);
    setDescription(project.description || '');
    setInitialized(true);
  }

  const updateMutation = useMutation({
    mutationFn: () => updateProject(projectId!, { name, description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project updated');
    },
  });

  // Labels
  const { data: labels = [] } = useQuery<Label[]>({
    queryKey: ['labels', projectId],
    queryFn: () => listLabels(projectId!),
    enabled: !!projectId,
  });

  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#6B7280');

  const createLabelMutation = useMutation({
    mutationFn: () => createLabel(projectId!, newLabelName, newLabelColor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels', projectId] });
      setNewLabelName('');
      toast.success('Label created');
    },
    onError: (err: any) => toast.error(err.response?.data?.error?.message || 'Failed'),
  });

  const deleteLabelMutation = useMutation({
    mutationFn: (labelId: string) => deleteLabel(projectId!, labelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels', projectId] });
      toast.success('Label deleted');
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-xl font-bold text-gray-900">Project Settings</h1>

      {/* General */}
      <section className="bg-white rounded-lg border p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">General</h2>
        <Input
          id="settings-name"
          label="Project Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="flex justify-end">
          <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
            Save Changes
          </Button>
        </div>
      </section>

      {/* Members */}
      <section className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Members</h2>
        <MemberManagement projectId={projectId!} />
      </section>

      {/* Labels */}
      <section className="bg-white rounded-lg border p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Labels</h2>
        <div className="flex gap-2">
          <Input
            id="new-label"
            placeholder="Label name"
            value={newLabelName}
            onChange={(e) => setNewLabelName(e.target.value)}
            className="flex-1"
          />
          <input
            type="color"
            value={newLabelColor}
            onChange={(e) => setNewLabelColor(e.target.value)}
            className="w-10 h-10 rounded border cursor-pointer"
          />
          <Button
            size="sm"
            onClick={() => createLabelMutation.mutate()}
            disabled={!newLabelName.trim()}
          >
            Add
          </Button>
        </div>
        <div className="space-y-2">
          {labels.map((label) => (
            <div key={label.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: label.color }}
                />
                <span className="text-sm text-gray-700">{label.name}</span>
              </div>
              <button
                onClick={() => deleteLabelMutation.mutate(label.id)}
                className="text-gray-400 hover:text-red-600"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

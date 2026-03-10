import { useState, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listMembers, inviteMember, removeMember } from '../../api/projects';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import type { ProjectMember } from '../../types';

export function MemberManagement({ projectId }: { projectId: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');

  const { data: members = [] } = useQuery<ProjectMember[]>({
    queryKey: ['members', projectId],
    queryFn: () => listMembers(projectId),
  });

  const invite = useMutation({
    mutationFn: () => inviteMember(projectId, email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', projectId] });
      setEmail('');
      toast.success('Member invited');
    },
    onError: (err: any) => toast.error(err.response?.data?.error?.message || 'Failed to invite'),
  });

  const remove = useMutation({
    mutationFn: (userId: string) => removeMember(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', projectId] });
      toast.success('Member removed');
    },
  });

  const handleInvite = (e: FormEvent) => {
    e.preventDefault();
    invite.mutate();
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleInvite} className="flex gap-2">
        <Input
          id="invite-email"
          placeholder="user@example.com"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1"
        />
        <Button type="submit" disabled={invite.isPending} size="sm">
          Invite
        </Button>
      </form>

      <div className="divide-y">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-gray-900">{member.displayName}</p>
              <p className="text-xs text-gray-500">{member.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={member.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'}>
                {member.role}
              </Badge>
              {member.id !== user?.id && (
                <button
                  onClick={() => remove.mutate(member.id)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

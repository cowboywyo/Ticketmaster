import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFollowers, getFollowStatus, followTicket, unfollowTicket } from '../../api/tickets';
import { Button } from '../ui/Button';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Follower } from '../../types';

interface Props {
  ticketId: string;
}

export function TicketFollowers({ ticketId }: Props) {
  const queryClient = useQueryClient();

  const { data: isFollowing = false } = useQuery<boolean>({
    queryKey: ['followStatus', ticketId],
    queryFn: () => getFollowStatus(ticketId),
  });

  const { data: followers = [] } = useQuery<Follower[]>({
    queryKey: ['followers', ticketId],
    queryFn: () => getFollowers(ticketId),
  });

  const toggleFollow = useMutation({
    mutationFn: () => (isFollowing ? unfollowTicket(ticketId) : followTicket(ticketId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followStatus', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['followers', ticketId] });
      toast.success(isFollowing ? 'Unfollowed' : 'Now following');
    },
    onError: (err: any) => toast.error(err.response?.data?.error?.message || 'Failed'),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">Followers</label>
        <Button
          size="sm"
          variant={isFollowing ? 'secondary' : 'primary'}
          onClick={() => toggleFollow.mutate()}
          disabled={toggleFollow.isPending}
        >
          {isFollowing ? (
            <>
              <EyeOff size={14} className="mr-1" /> Unfollow
            </>
          ) : (
            <>
              <Eye size={14} className="mr-1" /> Follow
            </>
          )}
        </Button>
      </div>
      <p className="text-xs text-gray-400 mb-2">Reporter &amp; assignee are always notified.</p>
      {followers.length > 0 ? (
        <div className="space-y-1">
          {followers.map((f) => (
            <div key={f.id} className="text-xs text-gray-600">
              {f.displayName} <span className="text-gray-400">({f.email})</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400">No additional followers.</p>
      )}
    </div>
  );
}

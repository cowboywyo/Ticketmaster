import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createComment } from '../../api/comments';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

export function CommentForm({ ticketId }: { ticketId: string }) {
  const [body, setBody] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => createComment(ticketId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['activity', ticketId] });
      setBody('');
      toast.success('Comment added');
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    mutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        rows={3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Add a comment..."
      />
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={mutation.isPending || !body.trim()}>
          {mutation.isPending ? 'Adding...' : 'Comment'}
        </Button>
      </div>
    </form>
  );
}

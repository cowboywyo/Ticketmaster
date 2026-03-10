import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listComments, deleteComment } from '../../api/comments';
import { CommentForm } from './CommentForm';
import { useAuth } from '../../context/AuthContext';
import { timeAgo } from '../../utils/formatDate';
import { Trash2, User } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Comment } from '../../types';

export function CommentList({ ticketId }: { ticketId: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: ['comments', ticketId],
    queryFn: () => listComments(ticketId),
  });

  const removeMutation = useMutation({
    mutationFn: (commentId: string) => deleteComment(ticketId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', ticketId] });
      toast.success('Comment deleted');
    },
  });

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">Comments ({comments.length})</h3>
      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User size={12} className="text-indigo-600" />
                </div>
                <span className="text-sm font-medium text-gray-900">{comment.authorName}</span>
                <span className="text-xs text-gray-500">{timeAgo(comment.createdAt)}</span>
              </div>
              {comment.authorId === user?.id && (
                <button
                  onClick={() => removeMutation.mutate(comment.id)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.body}</p>
          </div>
        ))}
      </div>
      <CommentForm ticketId={ticketId} />
    </div>
  );
}

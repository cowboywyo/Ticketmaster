import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listPendingUsers, listAllUsers, approveUser, rejectUser } from '../api/admin';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { Shield, UserCheck, UserX } from 'lucide-react';
import toast from 'react-hot-toast';
import { Navigate } from 'react-router-dom';
import type { PendingUser, User } from '../types';

export function AdminPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Only root users can access this page
  if (user?.systemRole !== 'root') {
    return <Navigate to="/" replace />;
  }

  const { data: pendingUsers = [], isLoading: pendingLoading } = useQuery<PendingUser[]>({
    queryKey: ['admin', 'pending'],
    queryFn: listPendingUsers,
  });

  const { data: allUsers = [], isLoading: allLoading } = useQuery<(User & { approved: boolean; createdAt: string })[]>({
    queryKey: ['admin', 'users'],
    queryFn: listAllUsers,
  });

  const approveMutation = useMutation({
    mutationFn: approveUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      toast.success('User approved');
    },
    onError: () => toast.error('Failed to approve user'),
  });

  const rejectMutation = useMutation({
    mutationFn: rejectUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      toast.success('User rejected');
    },
    onError: () => toast.error('Failed to reject user'),
  });

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center gap-3">
        <Shield className="text-indigo-600" size={28} />
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
      </div>

      {/* Pending Approvals */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Pending Approvals
            {pendingUsers.length > 0 && (
              <span className="ml-2 text-sm bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                {pendingUsers.length}
              </span>
            )}
          </h2>
        </div>
        <div className="divide-y">
          {pendingLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : pendingUsers.length === 0 ? (
            <p className="text-sm text-gray-500 p-4">No pending approvals</p>
          ) : (
            pendingUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">{u.displayName}</p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => approveMutation.mutate(u.id)}
                    disabled={approveMutation.isPending}
                  >
                    <UserCheck size={14} className="mr-1" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      if (confirm(`Reject and delete ${u.displayName}?`)) {
                        rejectMutation.mutate(u.id);
                      }
                    }}
                    disabled={rejectMutation.isPending}
                  >
                    <UserX size={14} className="mr-1" /> Reject
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* All Users */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">All Users</h2>
        </div>
        <div className="overflow-x-auto">
          {allLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {allUsers.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-3 font-medium text-gray-900">{u.displayName}</td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.systemRole === 'root'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {u.systemRole || 'user'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.approved
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {u.approved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

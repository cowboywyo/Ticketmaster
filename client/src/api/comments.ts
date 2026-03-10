import api from './client';

export async function listComments(ticketId: string) {
  const { data } = await api.get(`/tickets/${ticketId}/comments`);
  return data.comments;
}

export async function createComment(ticketId: string, body: string) {
  const { data } = await api.post(`/tickets/${ticketId}/comments`, { body });
  return data.comment;
}

export async function updateComment(ticketId: string, commentId: string, body: string) {
  await api.patch(`/tickets/${ticketId}/comments/${commentId}`, { body });
}

export async function deleteComment(ticketId: string, commentId: string) {
  await api.delete(`/tickets/${ticketId}/comments/${commentId}`);
}

import api from './client';

export async function listTickets(projectId: string, params?: Record<string, string>) {
  const { data } = await api.get(`/projects/${projectId}/tickets`, { params });
  return data;
}

export async function getTicket(projectId: string, ticketId: string) {
  const { data } = await api.get(`/projects/${projectId}/tickets/${ticketId}`);
  return data.ticket;
}

export async function createTicket(projectId: string, body: any) {
  const { data } = await api.post(`/projects/${projectId}/tickets`, body);
  return data.ticket;
}

export async function updateTicket(projectId: string, ticketId: string, body: any) {
  const { data } = await api.patch(`/projects/${projectId}/tickets/${ticketId}`, body);
  return data.ticket;
}

export async function deleteTicket(projectId: string, ticketId: string) {
  await api.delete(`/projects/${projectId}/tickets/${ticketId}`);
}

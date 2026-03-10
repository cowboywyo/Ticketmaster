import api from './client';

export async function listActivity(ticketId: string) {
  const { data } = await api.get(`/tickets/${ticketId}/activity`);
  return data.activity;
}

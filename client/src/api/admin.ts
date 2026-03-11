import api from './client';

export async function listPendingUsers() {
  const { data } = await api.get('/admin/users/pending');
  return data.users;
}

export async function listAllUsers() {
  const { data } = await api.get('/admin/users');
  return data.users;
}

export async function approveUser(userId: string) {
  const { data } = await api.post(`/admin/users/${userId}/approve`);
  return data;
}

export async function rejectUser(userId: string) {
  const { data } = await api.post(`/admin/users/${userId}/reject`);
  return data;
}

import api from './client';

export async function login(email: string, password: string) {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}

export async function register(email: string, password: string, displayName: string) {
  const { data } = await api.post('/auth/register', { email, password, displayName });
  return data;
}

export async function getMe() {
  const { data } = await api.get('/auth/me');
  return data.user;
}

export async function refreshToken() {
  const { data } = await api.post('/auth/refresh');
  return data;
}

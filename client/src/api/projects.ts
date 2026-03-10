import api from './client';

export async function listProjects() {
  const { data } = await api.get('/projects');
  return data.projects;
}

export async function getProject(projectId: string) {
  const { data } = await api.get(`/projects/${projectId}`);
  return data.project;
}

export async function createProject(body: { name: string; key: string; description?: string }) {
  const { data } = await api.post('/projects', body);
  return data.project;
}

export async function updateProject(projectId: string, body: { name?: string; description?: string }) {
  const { data } = await api.patch(`/projects/${projectId}`, body);
  return data.project;
}

export async function deleteProject(projectId: string) {
  await api.delete(`/projects/${projectId}`);
}

export async function listMembers(projectId: string) {
  const { data } = await api.get(`/projects/${projectId}/members`);
  return data.members;
}

export async function inviteMember(projectId: string, email: string, role: string = 'member') {
  const { data } = await api.post(`/projects/${projectId}/members`, { email, role });
  return data.member;
}

export async function removeMember(projectId: string, userId: string) {
  await api.delete(`/projects/${projectId}/members/${userId}`);
}

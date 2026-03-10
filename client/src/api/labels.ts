import api from './client';

export async function listLabels(projectId: string) {
  const { data } = await api.get(`/projects/${projectId}/labels`);
  return data.labels;
}

export async function createLabel(projectId: string, name: string, color: string) {
  const { data } = await api.post(`/projects/${projectId}/labels`, { name, color });
  return data.label;
}

export async function deleteLabel(projectId: string, labelId: string) {
  await api.delete(`/projects/${projectId}/labels/${labelId}`);
}

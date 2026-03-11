import api from './client';

export async function listAttachments(ticketId: string, type?: 'file' | 'log') {
  const params = type ? { type } : {};
  const { data } = await api.get(`/tickets/${ticketId}/attachments`, { params });
  return data.attachments;
}

export async function uploadAttachment(ticketId: string, file: File, attachmentType: 'file' | 'log' = 'file') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('attachmentType', attachmentType);
  const { data } = await api.post(`/tickets/${ticketId}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.attachment;
}

export async function deleteAttachment(ticketId: string, attachmentId: string) {
  await api.delete(`/tickets/${ticketId}/attachments/${attachmentId}`);
}

import { v4 as uuid } from 'uuid';
import db from '../../db/connection.js';
import { NotFoundError } from '../../utils/errors.js';
import { uploadFile, deleteFile } from '../../services/oss.js';

export async function listAttachments(ticketId: string, attachmentType?: string) {
  let query = db('attachments')
    .where({ ticket_id: ticketId })
    .join('users', 'attachments.uploader_id', 'users.id');

  if (attachmentType) {
    query = query.where('attachments.attachment_type', attachmentType);
  }

  return query
    .select(
      'attachments.id',
      'attachments.filename',
      'attachments.file_size as fileSize',
      'attachments.mime_type as mimeType',
      'attachments.oss_url as url',
      'attachments.attachment_type as attachmentType',
      'attachments.created_at as createdAt',
      'users.display_name as uploaderName'
    )
    .orderBy('attachments.created_at', 'desc');
}

export async function createAttachment(
  ticketId: string,
  uploaderId: string,
  file: { originalname: string; buffer: Buffer; size: number; mimetype: string },
  attachmentType: 'file' | 'log' = 'file'
) {
  const id = uuid();
  const folder = attachmentType === 'log' ? 'logs' : 'attachments';
  const key = `${folder}/${ticketId}/${id}-${file.originalname}`;
  const { ossKey, ossUrl } = await uploadFile(file.buffer, key, file.mimetype);

  await db('attachments').insert({
    id,
    ticket_id: ticketId,
    uploader_id: uploaderId,
    filename: file.originalname,
    file_size: file.size,
    mime_type: file.mimetype,
    oss_key: ossKey,
    oss_url: ossUrl,
    attachment_type: attachmentType,
  });

  const actionName = attachmentType === 'log' ? 'log_uploaded' : 'attachment_added';
  await db('activity_logs').insert({
    id: uuid(),
    ticket_id: ticketId,
    user_id: uploaderId,
    action: actionName,
    new_value: file.originalname,
  });

  return {
    id,
    filename: file.originalname,
    fileSize: file.size,
    mimeType: file.mimetype,
    url: ossUrl,
    attachmentType,
  };
}

export async function deleteAttachment(attachmentId: string) {
  const attachment = await db('attachments').where({ id: attachmentId }).first();
  if (!attachment) throw new NotFoundError('Attachment not found');
  await deleteFile(attachment.oss_key);
  await db('attachments').where({ id: attachmentId }).delete();
}

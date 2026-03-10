import { v4 as uuid } from 'uuid';
import db from '../../db/connection.js';
import { NotFoundError } from '../../utils/errors.js';
import { uploadFile, deleteFile } from '../../services/oss.js';

export async function listAttachments(ticketId: string) {
  return db('attachments')
    .where({ ticket_id: ticketId })
    .join('users', 'attachments.uploader_id', 'users.id')
    .select(
      'attachments.id',
      'attachments.filename',
      'attachments.file_size as fileSize',
      'attachments.mime_type as mimeType',
      'attachments.oss_url as url',
      'attachments.created_at as createdAt',
      'users.display_name as uploaderName'
    )
    .orderBy('attachments.created_at', 'desc');
}

export async function createAttachment(
  ticketId: string,
  uploaderId: string,
  file: { originalname: string; buffer: Buffer; size: number; mimetype: string }
) {
  const id = uuid();
  const key = `attachments/${ticketId}/${id}-${file.originalname}`;
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
  });

  await db('activity_logs').insert({
    id: uuid(),
    ticket_id: ticketId,
    user_id: uploaderId,
    action: 'attachment_added',
    new_value: file.originalname,
  });

  return { id, filename: file.originalname, fileSize: file.size, mimeType: file.mimetype, url: ossUrl };
}

export async function deleteAttachment(attachmentId: string) {
  const attachment = await db('attachments').where({ id: attachmentId }).first();
  if (!attachment) throw new NotFoundError('Attachment not found');
  await deleteFile(attachment.oss_key);
  await db('attachments').where({ id: attachmentId }).delete();
}

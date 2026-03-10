import { useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listAttachments, uploadAttachment, deleteAttachment } from '../../api/attachments';
import { Button } from '../ui/Button';
import { Paperclip, Trash2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Attachment } from '../../types';

export function FileUpload({ ticketId }: { ticketId: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: attachments = [] } = useQuery<Attachment[]>({
    queryKey: ['attachments', ticketId],
    queryFn: () => listAttachments(ticketId),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadAttachment(ticketId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['activity', ticketId] });
      toast.success('File uploaded');
    },
    onError: () => toast.error('Upload failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (attachmentId: string) => deleteAttachment(ticketId, attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', ticketId] });
      toast.success('Attachment deleted');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
    if (fileRef.current) fileRef.current.value = '';
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Attachments ({attachments.length})</h3>
        <input ref={fileRef} type="file" className="hidden" onChange={handleFileChange} />
        <Button
          size="sm"
          variant="secondary"
          onClick={() => fileRef.current?.click()}
          disabled={uploadMutation.isPending}
        >
          <Upload size={14} className="mr-1" />
          {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
        </Button>
      </div>
      {attachments.map((a) => (
        <div key={a.id} className="flex items-center justify-between bg-gray-50 rounded p-2">
          <div className="flex items-center gap-2">
            <Paperclip size={14} className="text-gray-400" />
            <a
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-indigo-600 hover:underline"
            >
              {a.filename}
            </a>
            <span className="text-xs text-gray-500">{formatSize(a.fileSize)}</span>
          </div>
          <button
            onClick={() => deleteMutation.mutate(a.id)}
            className="text-gray-400 hover:text-red-600"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

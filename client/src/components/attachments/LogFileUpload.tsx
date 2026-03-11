import { useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listAttachments, uploadAttachment, deleteAttachment } from '../../api/attachments';
import { Button } from '../ui/Button';
import { FileText, Trash2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Attachment } from '../../types';

export function LogFileUpload({ ticketId }: { ticketId: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: logs = [] } = useQuery<Attachment[]>({
    queryKey: ['attachments', ticketId, 'log'],
    queryFn: () => listAttachments(ticketId, 'log'),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadAttachment(ticketId, file, 'log'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['activity', ticketId] });
      toast.success('Log file uploaded');
    },
    onError: () => toast.error('Upload failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (attachmentId: string) => deleteAttachment(ticketId, attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', ticketId] });
      toast.success('Log file deleted');
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
        <h3 className="text-sm font-semibold text-gray-700">Log Files ({logs.length})</h3>
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          accept=".log,.txt,.json,.xml,.csv,.gz,.zip"
          onChange={handleFileChange}
        />
        <Button
          size="sm"
          variant="secondary"
          onClick={() => fileRef.current?.click()}
          disabled={uploadMutation.isPending}
        >
          <Upload size={14} className="mr-1" />
          {uploadMutation.isPending ? 'Uploading...' : 'Upload Log'}
        </Button>
      </div>
      {logs.length === 0 && (
        <p className="text-xs text-gray-400">No log files attached</p>
      )}
      {logs.map((log) => (
        <div key={log.id} className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded p-2">
          <div className="flex items-center gap-2">
            <FileText size={14} className="text-amber-600" />
            <a
              href={log.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-amber-700 hover:underline font-mono"
            >
              {log.filename}
            </a>
            <span className="text-xs text-gray-500">{formatSize(log.fileSize)}</span>
          </div>
          <button
            onClick={() => deleteMutation.mutate(log.id)}
            className="text-gray-400 hover:text-red-600"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

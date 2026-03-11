import { useQuery } from '@tanstack/react-query';
import { listActivity } from '../../api/activity';
import { timeAgo } from '../../utils/formatDate';
import { STATUS_LABELS, PRIORITY_LABELS } from '../../utils/constants';
import type { ActivityLog } from '../../types';

const ACTION_LABELS: Record<string, string> = {
  ticket_created: 'created this ticket',
  status_change: 'changed status',
  priority_change: 'changed priority',
  assignment_change: 'changed assignee',
  title_change: 'updated the title',
  type_change: 'changed type',
  comment_added: 'added a comment',
  attachment_added: 'added an attachment',
  log_uploaded: 'uploaded a log file',
  label_added: 'added a label',
  label_removed: 'removed a label',
};

function formatValue(action: string, value: string | undefined) {
  if (!value) return 'none';
  if (action.includes('status')) return STATUS_LABELS[value] || value;
  if (action.includes('priority')) return PRIORITY_LABELS[value] || value;
  return value;
}

export function ActivityFeed({ ticketId }: { ticketId: string }) {
  const { data: activity = [] } = useQuery<ActivityLog[]>({
    queryKey: ['activity', ticketId],
    queryFn: () => listActivity(ticketId),
  });

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">Activity</h3>
      <div className="space-y-2">
        {activity.map((log) => (
          <div key={log.id} className="flex items-start gap-2 text-xs text-gray-600">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 flex-shrink-0" />
            <div>
              <span className="font-medium text-gray-900">{log.userName}</span>{' '}
              {ACTION_LABELS[log.action] || log.action}
              {log.oldValue && log.newValue && (
                <>
                  {' '}
                  from <span className="font-medium">{formatValue(log.action, log.oldValue)}</span>{' '}
                  to <span className="font-medium">{formatValue(log.action, log.newValue)}</span>
                </>
              )}
              {!log.oldValue && log.newValue && log.action !== 'ticket_created' && (
                <>
                  : <span className="font-medium">{log.newValue}</span>
                </>
              )}
              <span className="text-gray-400 ml-2">{timeAgo(log.createdAt)}</span>
            </div>
          </div>
        ))}
        {activity.length === 0 && (
          <p className="text-xs text-gray-400">No activity yet</p>
        )}
      </div>
    </div>
  );
}

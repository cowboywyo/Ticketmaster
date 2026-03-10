export const TICKET_TYPES = ['bug', 'feature', 'task', 'improvement'] as const;
export const PRIORITIES = ['critical', 'high', 'medium', 'low'] as const;
export const STATUSES = ['open', 'in_progress', 'in_review', 'resolved', 'closed'] as const;

export const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  in_review: 'In Review',
  resolved: 'Resolved',
  closed: 'Closed',
};

export const PRIORITY_LABELS: Record<string, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const TYPE_LABELS: Record<string, string> = {
  bug: 'Bug',
  feature: 'Feature',
  task: 'Task',
  improvement: 'Improvement',
};

export const STATUS_COLORS: Record<string, string> = {
  open: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  in_review: 'bg-purple-100 text-purple-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
};

export const PRIORITY_COLORS: Record<string, string> = {
  critical: 'text-red-600',
  high: 'text-orange-500',
  medium: 'text-yellow-500',
  low: 'text-gray-400',
};

export const TYPE_COLORS: Record<string, string> = {
  bug: 'bg-red-100 text-red-800',
  feature: 'bg-green-100 text-green-800',
  task: 'bg-blue-100 text-blue-800',
  improvement: 'bg-teal-100 text-teal-800',
};

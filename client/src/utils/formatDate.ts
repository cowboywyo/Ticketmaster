import { formatDistanceToNow, format } from 'date-fns';

export function timeAgo(date: string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDate(date: string) {
  return format(new Date(date), 'MMM d, yyyy');
}

export function formatDateTime(date: string) {
  return format(new Date(date), 'MMM d, yyyy h:mm a');
}

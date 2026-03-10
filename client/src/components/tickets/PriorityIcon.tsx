import { AlertTriangle, ArrowUp, ArrowRight, ArrowDown } from 'lucide-react';
import { PRIORITY_COLORS, PRIORITY_LABELS } from '../../utils/constants';

const ICONS: Record<string, typeof AlertTriangle> = {
  critical: AlertTriangle,
  high: ArrowUp,
  medium: ArrowRight,
  low: ArrowDown,
};

export function PriorityIcon({ priority }: { priority: string }) {
  const Icon = ICONS[priority] || ArrowRight;
  return (
    <span className={PRIORITY_COLORS[priority]} title={PRIORITY_LABELS[priority]}>
      <Icon size={14} />
    </span>
  );
}

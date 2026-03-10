import { Badge } from '../ui/Badge';
import { STATUS_LABELS, STATUS_COLORS } from '../../utils/constants';

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge className={STATUS_COLORS[status]}>
      {STATUS_LABELS[status] || status}
    </Badge>
  );
}

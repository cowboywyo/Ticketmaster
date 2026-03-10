import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { STATUSES, PRIORITIES, TICKET_TYPES, STATUS_LABELS, PRIORITY_LABELS, TYPE_LABELS } from '../../utils/constants';

interface FiltersState {
  status: string;
  priority: string;
  type: string;
  q: string;
}

interface Props {
  filters: FiltersState;
  onChange: (filters: FiltersState) => void;
}

export function TicketFilters({ filters, onChange }: Props) {
  const update = (key: keyof FiltersState, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div className="flex-1 min-w-[200px]">
        <Input
          id="search"
          placeholder="Search tickets..."
          value={filters.q}
          onChange={(e) => update('q', e.target.value)}
        />
      </div>
      <Select
        id="filter-status"
        value={filters.status}
        onChange={(e) => update('status', e.target.value)}
        options={[
          { value: '', label: 'All Statuses' },
          ...STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] })),
        ]}
      />
      <Select
        id="filter-priority"
        value={filters.priority}
        onChange={(e) => update('priority', e.target.value)}
        options={[
          { value: '', label: 'All Priorities' },
          ...PRIORITIES.map((p) => ({ value: p, label: PRIORITY_LABELS[p] })),
        ]}
      />
      <Select
        id="filter-type"
        value={filters.type}
        onChange={(e) => update('type', e.target.value)}
        options={[
          { value: '', label: 'All Types' },
          ...TICKET_TYPES.map((t) => ({ value: t, label: TYPE_LABELS[t] })),
        ]}
      />
    </div>
  );
}

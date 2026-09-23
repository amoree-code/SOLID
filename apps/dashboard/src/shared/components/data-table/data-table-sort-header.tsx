import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

type DataTableSortHeaderProps = {
  label: string;
  /** The column's current sort, or `false` when the table is sorted by another column. */
  direction: 'asc' | 'desc' | false;
  onToggle: () => void;
};

/**
 * A clickable column header. It only reports the click — the page decides what
 * the next sort is and where it lives (normally the URL).
 */
export function DataTableSortHeader({ label, direction, onToggle }: DataTableSortHeaderProps) {
  const Icon = direction === 'asc' ? ArrowUp : direction === 'desc' ? ArrowDown : ArrowUpDown;
  const state =
    direction === 'asc'
      ? 'sorted ascending'
      : direction === 'desc'
        ? 'sorted descending'
        : 'not sorted';

  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ms-3 h-8"
      aria-label={`${label}, ${state}. Click to change sort.`}
      onClick={onToggle}
    >
      {label}
      <Icon className={direction ? 'size-4' : 'size-4 opacity-40'} />
    </Button>
  );
}

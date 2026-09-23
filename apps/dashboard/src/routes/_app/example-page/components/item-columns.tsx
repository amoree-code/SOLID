import { Link } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/shared/components/ui/badge';
import type { Item } from '../types';
import { ItemActions } from './item-actions';

const STATUS_LABELS: Record<Item['status'], string> = {
  active: 'Active',
  inactive: 'Inactive',
};

export const itemColumns: ColumnDef<Item, unknown>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <Link
        to="/example-page/$itemId"
        params={{ itemId: row.original.id }}
        className="font-medium underline-offset-4 hover:underline"
      >
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={row.original.status === 'active' ? 'secondary' : 'outline'}>
        {STATUS_LABELS[row.original.status]}
      </Badge>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
  {
    id: 'actions',
    header: '',
    enableHiding: false,
    cell: ({ row }) => (
      <div className="text-end">
        <ItemActions item={row.original} />
      </div>
    ),
  },
];

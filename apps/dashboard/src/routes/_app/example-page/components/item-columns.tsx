import { Link } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import type { Item } from '../types';
import { ItemActions } from './item-actions';

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
    cell: ({ row }) => <ItemActions item={row.original} />,
  },
];

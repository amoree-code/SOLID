import { getRouteApi, Link } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { DataTableSortHeader } from '@/shared/components/data-table/data-table-sort-header';
import { Badge } from '@/shared/components/ui/badge';
import type { ItemSearch } from '../schemas/item-search.schema';
import type { Item } from '../types';
import { ItemActions } from './item-actions';

const routeApi = getRouteApi('/_app/example-page/');

const STATUS_LABELS: Record<Item['status'], string> = {
  active: 'Active',
  inactive: 'Inactive',
};

type SortState = Pick<ItemSearch, 'sort' | 'order'>;

/** Clicking the sorted column flips its order; clicking another column sorts it ascending. */
export function nextSort(current: SortState, column: ItemSearch['sort']): SortState {
  if (current.sort === column) {
    return { sort: column, order: current.order === 'asc' ? 'desc' : 'asc' };
  }
  return { sort: column, order: 'asc' };
}

export function useItemColumns(): ColumnDef<Item, unknown>[] {
  const { sort, order } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  return useMemo(() => {
    function sortHeader(column: ItemSearch['sort'], label: string) {
      return () => (
        <DataTableSortHeader
          label={label}
          direction={sort === column ? order : false}
          onToggle={() =>
            navigate({
              search: (prev) => ({ ...prev, ...nextSort({ sort, order }, column), page: 1 }),
            })
          }
        />
      );
    }

    return [
      {
        id: 'name',
        accessorKey: 'name',
        header: sortHeader('name', 'Name'),
        meta: { label: 'Name' },
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
        id: 'createdAt',
        accessorKey: 'createdAt',
        header: sortHeader('createdAt', 'Created'),
        meta: { label: 'Created' },
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
  }, [sort, order, navigate]);
}

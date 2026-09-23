import { Link } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { useTranslation } from '@/shared/i18n/use-translation';
import type { Item } from '../types';
import { ItemActions } from './item-actions';

export function useItemColumns(): ColumnDef<Item, unknown>[] {
  const { t, locale } = useTranslation('items');

  return useMemo(
    () => [
      {
        accessorKey: 'name',
        header: t('column.name'),
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
        header: t('column.status'),
        cell: ({ row }) => (
          <Badge variant={row.original.status === 'active' ? 'secondary' : 'outline'}>
            {t(`status.${row.original.status}`)}
          </Badge>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: t('column.createdAt'),
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(locale),
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
    ],
    [t, locale],
  );
}

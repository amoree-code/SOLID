import { getRouteApi } from '@tanstack/react-router';
import type { Table } from '@tanstack/react-table';
import { useState } from 'react';
import { DataTable } from '@/shared/components/data-table/data-table';
import { DataTableColumnToggle } from '@/shared/components/data-table/data-table-column-toggle';
import { DataTableEmpty } from '@/shared/components/data-table/data-table-empty';
import { DataTablePagination } from '@/shared/components/data-table/data-table-pagination';
import { useTranslation } from '@/shared/i18n/use-translation';
import type { Item, ItemListResponse } from '../types';
import { useItemColumns } from './item-columns';

const routeApi = getRouteApi('/_dashboard/example-page/');

type ItemTableProps = {
  data: ItemListResponse;
};

export function ItemTable({ data }: ItemTableProps) {
  const navigate = routeApi.useNavigate();
  const [table, setTable] = useState<Table<Item> | null>(null);
  const columns = useItemColumns();
  const { t } = useTranslation('items');

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        {table ? <DataTableColumnToggle table={table} /> : null}
      </div>
      <DataTable
        columns={columns}
        data={data.items}
        empty={<DataTableEmpty>{t('empty')}</DataTableEmpty>}
        onTableReady={setTable}
      />
      <DataTablePagination
        page={data.page}
        pageSize={data.pageSize}
        total={data.total}
        onPageChange={(page) => navigate({ search: (prev) => ({ ...prev, page }) })}
      />
    </div>
  );
}

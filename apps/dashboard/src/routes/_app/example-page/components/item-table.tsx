import { getRouteApi } from '@tanstack/react-router';
import { DataTable } from '@/shared/components/data-table/data-table';
import { DataTableColumnToggle } from '@/shared/components/data-table/data-table-column-toggle';
import { DataTablePagination } from '@/shared/components/data-table/data-table-pagination';
import { ITEM_PAGE_SIZES } from '../schemas/item-search.schema';
import type { ItemListResponse } from '../types';
import { itemColumns } from './item-columns';

const routeApi = getRouteApi('/_app/example-page/');

type ItemTableProps = {
  data: ItemListResponse;
};

export function ItemTable({ data }: ItemTableProps) {
  const navigate = routeApi.useNavigate();

  return (
    <div className="flex flex-col">
      <DataTable
        columns={itemColumns}
        data={data.items}
        getRowId={(item) => item.id}
        emptyMessage="No items match your filters."
        toolbar={(table) => <DataTableColumnToggle table={table} />}
      />
      <DataTablePagination
        page={data.page}
        pageSize={data.pageSize}
        total={data.total}
        pageSizeOptions={ITEM_PAGE_SIZES}
        onPageChange={(page) => navigate({ search: (prev) => ({ ...prev, page }) })}
        onPageSizeChange={(pageSize) =>
          navigate({ search: (prev) => ({ ...prev, pageSize, page: 1 }) })
        }
      />
    </div>
  );
}

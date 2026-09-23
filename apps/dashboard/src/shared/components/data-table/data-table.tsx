import type { ColumnDef, Table as TanStackTable } from '@tanstack/react-table';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import type { ReactNode } from 'react';
import { EmptyState, LoadingState } from '@/shared/components/feedback/states';

type DataTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  isLoading?: boolean;
  emptyMessage?: string;
  getRowId?: (row: TData) => string;
  /** Rendered above the table with the live table instance, e.g. a column toggle. */
  toolbar?: (table: TanStackTable<TData>) => ReactNode;
};

/**
 * Rendering only. Paging, sorting and filtering are server-side and owned by
 * the page (via URL search params) — this never slices or sorts `data` itself.
 */
export function DataTable<TData>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No results.',
  getRowId,
  toolbar,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });

  return (
    <div className="flex flex-col gap-3">
      {toolbar ? <div className="flex justify-end">{toolbar(table)}</div> : null}
      {isLoading ? (
        <LoadingState rows={5} />
      ) : data.length === 0 ? (
        <div className="rounded-md border border-border">
          <EmptyState title={emptyMessage} />
        </div>
      ) : (
        <DataTableBody table={table} />
      )}
    </div>
  );
}

function DataTableBody<TData>({ table }: { table: TanStackTable<TData> }) {
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted/50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-4 py-2 text-start font-medium">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b border-border last:border-0">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

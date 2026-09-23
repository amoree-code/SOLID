import type { ColumnDef, Table as TanStackTable } from '@tanstack/react-table';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import type { ReactNode } from 'react';
import { EmptyState, LoadingState } from '@/shared/components/feedback/states';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';

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
        <div className="rounded-md border">
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
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader className="bg-muted/50">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="px-4">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="px-4">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

import type { ColumnDef, Table as TanStackTable } from '@tanstack/react-table';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { type ReactNode, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { useTranslation } from '@/shared/i18n/use-translation';
import { DataTableEmpty } from './data-table-empty';
import { DataTableLoading } from './data-table-loading';

type DataTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  isLoading?: boolean;
  empty?: ReactNode;
  onTableReady?: (table: TanStackTable<TData>) => void;
};

export function DataTable<TData>({
  columns,
  data,
  isLoading = false,
  empty,
  onTableReady,
}: DataTableProps<TData>) {
  const { t } = useTranslation('common');
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  useEffect(() => {
    onTableReady?.(table);
  });

  if (isLoading) {
    return <DataTableLoading />;
  }

  if (data.length === 0) {
    return <>{empty ?? <DataTableEmpty>{t('table.noResults')}</DataTableEmpty>}</>;
  }

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

import type { RowData } from '@tanstack/react-table';

export type DataTablePaginationState = {
  page: number;
  pageSize: number;
  total: number;
};

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Human name for the column, used where the header isn't plain text (e.g. a sort button). */
    label?: string;
  }
}

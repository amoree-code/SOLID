import type { Column, Table } from '@tanstack/react-table';

// A string header is the user-facing name; fall back to the id for custom headers.
function columnLabel<TData>(column: Column<TData, unknown>): string {
  const { header } = column.columnDef;
  return typeof header === 'string' && header ? header : column.id;
}

type DataTableColumnToggleProps<TData> = {
  table: Table<TData>;
};

export function DataTableColumnToggle<TData>({ table }: DataTableColumnToggleProps<TData>) {
  return (
    <details className="relative">
      <summary className="cursor-pointer list-none rounded-md border border-input px-3 py-1.5 text-sm">
        Columns
      </summary>
      <div className="absolute end-0 z-10 mt-1 flex flex-col gap-1 rounded-md border border-border bg-card p-2 shadow-md">
        {table
          .getAllLeafColumns()
          .filter((column) => column.getCanHide())
          .map((column) => (
            <label key={column.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                aria-label={`Show ${columnLabel(column)} column`}
                checked={column.getIsVisible()}
                onChange={column.getToggleVisibilityHandler()}
              />
              {columnLabel(column)}
            </label>
          ))}
      </div>
    </details>
  );
}

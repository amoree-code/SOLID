import type { Table } from '@tanstack/react-table';

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
                checked={column.getIsVisible()}
                onChange={column.getToggleVisibilityHandler()}
              />
              {column.id}
            </label>
          ))}
      </div>
    </details>
  );
}

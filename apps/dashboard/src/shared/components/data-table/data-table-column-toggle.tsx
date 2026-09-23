import type { Column, Table } from '@tanstack/react-table';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {table
          .getAllLeafColumns()
          .filter((column) => column.getCanHide())
          .map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(value)}
              // Keep the menu open so several columns can be toggled in a row.
              onSelect={(event) => event.preventDefault()}
            >
              {columnLabel(column)}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import type { ColumnDef } from '@tanstack/react-table';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DataTable } from '../data-table';
import { DataTableColumnToggle } from '../data-table-column-toggle';
import { DataTablePagination } from '../data-table-pagination';

type Row = { id: string; name: string };

const columns: ColumnDef<Row, unknown>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Name' },
];

describe('DataTable', () => {
  it('renders a header and one row per item', () => {
    render(<DataTable columns={columns} data={[{ id: '1', name: 'Alpha' }]} />);

    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Alpha' })).toBeInTheDocument();
  });

  it('renders the loading state instead of rows while loading', () => {
    render(<DataTable columns={columns} data={[{ id: '1', name: 'Alpha' }]} isLoading />);

    expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders the empty message when there is no data', () => {
    render(<DataTable columns={columns} data={[]} emptyMessage="Nothing here." />);

    expect(screen.getByText('Nothing here.')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('hides a column from the toolbar column toggle', async () => {
    render(
      <DataTable
        columns={columns}
        data={[{ id: '1', name: 'Alpha' }]}
        toolbar={(table) => <DataTableColumnToggle table={table} />}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Columns' }));
    await userEvent.click(await screen.findByRole('menuitemcheckbox', { name: 'Name' }));

    expect(screen.queryByRole('columnheader', { name: 'Name' })).not.toBeInTheDocument();
    // The menu stays open, so the checkbox can be read back right away.
    expect(screen.getByRole('menuitemcheckbox', { name: 'Name' })).not.toBeChecked();
  });
});

describe('DataTablePagination', () => {
  it('disables Previous on the first page and Next on the last', () => {
    render(<DataTablePagination page={1} pageSize={25} total={25} onPageChange={() => {}} />);

    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('reports the requested page and page size', async () => {
    const onPageChange = vi.fn();
    const onPageSizeChange = vi.fn();
    render(
      <DataTablePagination
        page={2}
        pageSize={25}
        total={100}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    await userEvent.click(screen.getByRole('combobox', { name: 'Rows per page' }));
    await userEvent.click(await screen.findByRole('option', { name: '50 / page' }));

    expect(onPageChange).toHaveBeenCalledWith(3);
    expect(onPageSizeChange).toHaveBeenCalledWith(50);
  });
});

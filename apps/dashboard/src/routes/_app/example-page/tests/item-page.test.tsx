import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { httpClient } from '@/shared/services/http-client';
import { renderApp } from '@/shared/testing/render';

const items = [
  { id: '1', name: 'Alpha', status: 'active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: '2', name: 'Beta', status: 'inactive', createdAt: '2026-01-02T00:00:00.000Z' },
];

type ListParams = { page?: number; pageSize?: number };

function stubList(total = items.length) {
  return vi.spyOn(httpClient, 'get').mockImplementation(async (_url, config) => {
    const params = (config?.params ?? {}) as ListParams;
    return { data: { items, total, page: params.page ?? 1, pageSize: params.pageSize ?? 25 } };
  });
}

describe('example page', () => {
  it('sends the validated URL search state to the API and renders the rows', async () => {
    const get = stubList();

    await renderApp('/example-page?page=2&status=active&search=al&sort=name&order=asc&bogus=1');

    expect(get).toHaveBeenCalledWith('/items', {
      params: { page: 2, pageSize: 25, status: 'active', search: 'al', sort: 'name', order: 'asc' },
    });
    const table = await screen.findByRole('table');
    expect(within(table).getByRole('link', { name: 'Alpha' })).toBeInTheDocument();
    expect(within(table).getByRole('link', { name: 'Beta' })).toBeInTheDocument();
  });

  it('writes a filter change back to the URL and resets to page 1', async () => {
    stubList(100);
    const { router } = await renderApp('/example-page?page=3');

    await userEvent.click(await screen.findByRole('combobox', { name: 'Status' }));
    await userEvent.click(await screen.findByRole('option', { name: 'Inactive' }));

    expect(router.state.location.search).toEqual({ status: 'inactive' });
  });

  it('moves to the next page through the URL', async () => {
    stubList(100);
    const { router } = await renderApp('/example-page');

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }));

    expect(router.state.location.search).toEqual({ page: 2 });
  });

  it('shows the empty state when nothing matches', async () => {
    vi.spyOn(httpClient, 'get').mockResolvedValue({
      data: { items: [], total: 0, page: 1, pageSize: 25 },
    });

    await renderApp('/example-page?search=zzz');

    expect(await screen.findByText('No items match your filters.')).toBeInTheDocument();
  });
});

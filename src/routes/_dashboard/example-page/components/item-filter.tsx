import { getRouteApi } from '@tanstack/react-router';
import { Input } from '@/shared/components/ui/input';
import type { ItemSearch } from '../schemas/item-search.schema';

const routeApi = getRouteApi('/_dashboard/example-page/');

export function ItemFilter() {
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  function patch(partial: Partial<ItemSearch>) {
    navigate({ search: (prev) => ({ ...prev, ...partial, page: 1 }) });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Input
        placeholder="Search…"
        defaultValue={search.search}
        onChange={(event) => patch({ search: event.target.value })}
        className="max-w-64"
      />
      <select
        aria-label="Status"
        value={search.status}
        onChange={(event) => patch({ status: event.target.value as ItemSearch['status'] })}
        className="h-9 rounded-md border border-input bg-background px-2 text-sm"
      >
        <option value="all">All statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <select
        aria-label="Sort by"
        value={search.sort}
        onChange={(event) => patch({ sort: event.target.value as ItemSearch['sort'] })}
        className="h-9 rounded-md border border-input bg-background px-2 text-sm"
      >
        <option value="createdAt">Created date</option>
        <option value="name">Name</option>
      </select>
    </div>
  );
}

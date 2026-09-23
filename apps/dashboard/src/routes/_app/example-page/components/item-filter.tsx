import { getRouteApi } from '@tanstack/react-router';
import { useState } from 'react';
import { Input } from '@/shared/components/ui/input';
import { NativeSelect } from '@/shared/components/ui/native-select';
import { useDebouncedCallback } from '@/shared/hooks/use-debounced-callback';
import type { ItemSearch } from '../schemas/item-search.schema';

const routeApi = getRouteApi('/_app/example-page/');

export function ItemFilter() {
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  // The text box is local state so typing stays instant; the URL (and so the
  // query) only follows once the user pauses.
  const [searchText, setSearchText] = useState(search.search);
  const [syncedSearch, setSyncedSearch] = useState(search.search);

  // Back/forward (or any other navigation) changed the URL underneath the
  // input — follow it. Adjusting state during render avoids an effect loop.
  // (The schema trims, so "foo " round-trips as "foo" — don't eat the space.)
  if (search.search !== syncedSearch) {
    setSyncedSearch(search.search);
    if (search.search !== searchText.trim()) {
      setSearchText(search.search);
    }
  }

  // Any filter change resets to page 1 — page 3 of the old result set is meaningless.
  function patch(partial: Partial<ItemSearch>, replace = false) {
    navigate({ search: (prev) => ({ ...prev, ...partial, page: 1 }), replace });
  }

  const commitSearchText = useDebouncedCallback((value: string) => {
    patch({ search: value }, true);
  });

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Input
        type="search"
        aria-label="Search"
        placeholder="Search…"
        value={searchText}
        onChange={(event) => {
          setSearchText(event.target.value);
          commitSearchText(event.target.value);
        }}
        className="max-w-64"
      />
      <NativeSelect
        aria-label="Status"
        value={search.status}
        onChange={(event) => patch({ status: event.target.value as ItemSearch['status'] })}
      >
        <option value="all">All statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </NativeSelect>
      <NativeSelect
        aria-label="Sort by"
        value={search.sort}
        onChange={(event) => patch({ sort: event.target.value as ItemSearch['sort'] })}
      >
        <option value="createdAt">Created date</option>
        <option value="name">Name</option>
      </NativeSelect>
      <NativeSelect
        aria-label="Order"
        value={search.order}
        onChange={(event) => patch({ order: event.target.value as ItemSearch['order'] })}
      >
        <option value="desc">Descending</option>
        <option value="asc">Ascending</option>
      </NativeSelect>
    </div>
  );
}

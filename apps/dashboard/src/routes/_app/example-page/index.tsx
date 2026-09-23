import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { ItemPage } from './components/item-page';
import { itemListOptions } from './queries/item.queries';
import { defaultItemSearch, itemSearchSchema } from './schemas/item-search.schema';

export const Route = createFileRoute('/_app/example-page/')({
  validateSearch: zodValidator(itemSearchSchema),
  // Keep URLs short: values equal to their default are dropped from the query string.
  search: { middlewares: [stripSearchParams(defaultItemSearch)] },
  // Only the keys the query uses: an unrelated URL param must neither refetch
  // nor leak into the API request (the router keeps unknown keys in `search`).
  loaderDeps: ({ search: { page, pageSize, search, status, sort, order } }) => ({
    page,
    pageSize,
    search,
    status,
    sort,
    order,
  }),
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(itemListOptions(deps)),
  component: ItemRoute,
});

function ItemRoute() {
  return <ItemPage search={Route.useLoaderDeps()} />;
}

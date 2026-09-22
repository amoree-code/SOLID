import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { permissions } from '@/shared/permissions/permission-map';
import { requirePermission } from '@/shared/permissions/route-permission';
import { ItemPage } from './components/item-page';
import { itemListOptions } from './queries/item.queries';
import { itemSearchSchema } from './schemas/item-search.schema';

export const Route = createFileRoute('/_dashboard/example-page/')({
  validateSearch: zodValidator(itemSearchSchema),
  beforeLoad: ({ context }) => {
    requirePermission(context.queryClient, permissions.items.read);
  },
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(itemListOptions(deps.search)),
  component: ItemRoute,
});

function ItemRoute() {
  const search = Route.useSearch();
  return <ItemPage search={search} />;
}

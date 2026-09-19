import { createFileRoute } from '@tanstack/react-router';
import { permissions } from '@/shared/permissions/permission-map';
import { requirePermission } from '@/shared/permissions/route-permission';
import { ItemDetails } from './components/item-details';
import { itemDetailOptions } from './queries/item.queries';

export const Route = createFileRoute('/_dashboard/example-page/$itemId')({
  beforeLoad: ({ context }) => {
    requirePermission(context.queryClient, permissions.items.read);
  },
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(itemDetailOptions(params.itemId)),
  component: ItemDetailRoute,
});

function ItemDetailRoute() {
  const { itemId } = Route.useParams();
  return <ItemDetails itemId={itemId} />;
}

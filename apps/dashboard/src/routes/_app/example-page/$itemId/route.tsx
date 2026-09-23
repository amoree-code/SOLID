import { createFileRoute } from '@tanstack/react-router';
import { itemDetailOptions } from '../queries/item.queries';
import { ItemDetails } from './components/item-details';

export const Route = createFileRoute('/_app/example-page/$itemId')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(itemDetailOptions(params.itemId)),
  component: ItemDetailRoute,
});

function ItemDetailRoute() {
  const { itemId } = Route.useParams();
  return <ItemDetails itemId={itemId} />;
}

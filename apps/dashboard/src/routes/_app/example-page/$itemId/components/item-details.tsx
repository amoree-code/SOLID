import { useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { toast } from 'sonner';
import { PageHeader } from '@/shared/components/layout/page-header';
import { Card, CardContent } from '@/shared/components/ui/card';
import { ItemForm } from '../../components/item-form';
import { useUpdateItem } from '../../queries/item.mutations';
import { itemDetailOptions } from '../../queries/item.queries';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString();
}

type ItemDetailsProps = {
  itemId: string;
};

export function ItemDetails({ itemId }: ItemDetailsProps) {
  const { data: item } = useSuspenseQuery(itemDetailOptions(itemId));
  const updateMutation = useUpdateItem();

  return (
    <div className="flex flex-col gap-4">
      <Link to="/example-page" className="text-sm underline underline-offset-4">
        Back to items
      </Link>
      <PageHeader title={item.name} description={`Created ${formatDate(item.createdAt)}`} />
      <Card className="max-w-md">
        <CardContent className="flex flex-col gap-3">
          <ItemForm
            key={item.id}
            defaultValues={{ name: item.name, status: item.status }}
            isSubmitting={updateMutation.isPending}
            submitError={updateMutation.error}
            onSubmit={(values) =>
              updateMutation.mutate(
                { id: item.id, ...values },
                { onSuccess: (saved) => toast.success(`Saved "${saved.name}".`) },
              )
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}

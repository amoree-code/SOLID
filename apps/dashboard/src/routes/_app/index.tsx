import { createFileRoute } from '@tanstack/react-router';
import { appConfig } from '@/app/config/app-config';
import { PageHeader } from '@/shared/components/layout/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

export const Route = createFileRoute('/_app/')({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={appConfig.name} description="An empty base — add your first page." />
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Add a page</CardTitle>
          <CardDescription>
            Generates a complete list + detail page with URL-backed filters, sorting, paging, forms
            and its own tests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-md bg-muted px-3 py-2 text-sm" dir="ltr">
            <code>pnpm new:page user users</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

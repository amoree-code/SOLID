import { createFileRoute, Link } from '@tanstack/react-router';
import { appConfig } from '@/app/config/app-config';
import { PageHeader } from '@/shared/components/layout/page-header';
import { Button } from '@/shared/components/ui/button';
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
      <PageHeader title={appConfig.name} description="Start building from here." />
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Example page</CardTitle>
          <CardDescription>
            A reference list/detail page with URL-backed filters, pagination and sorting. Copy it
            with <code>pnpm new:page</code>, or delete it once you have your own pages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link to="/example-page">Open example page</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense, useState } from 'react';
import { appConfig } from '@/app/config/app-config';
import dashboardData from '@/app/dashboard/data.json';
import { SectionCards } from '@/shared/components/blocks/dashboard-01/section-cards';
import { Button } from '@/shared/components/ui/button';

const ChartAreaInteractive = lazy(() =>
  import('@/shared/components/blocks/dashboard-01/chart-area-interactive').then((module) => ({
    default: module.ChartAreaInteractive,
  })),
);
const DataTable = lazy(() =>
  import('@/shared/components/blocks/dashboard-01/data-table').then((module) => ({
    default: module.DataTable,
  })),
);

export const Route = createFileRoute('/_app/')({
  component: HomePage,
});

function HomePage() {
  const [showAnalytics, setShowAnalytics] = useState(false);

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <h1 className="px-4 text-2xl font-semibold lg:px-6">{appConfig.name}</h1>
        <SectionCards />
        <div className="px-4 lg:px-6">
          <Button variant="outline" onClick={() => setShowAnalytics((visible) => !visible)}>
            {showAnalytics ? 'Hide analytics' : 'View analytics'}
          </Button>
        </div>
        {showAnalytics ? (
          <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted" />}>
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive />
            </div>
            <DataTable data={dashboardData} />
          </Suspense>
        ) : null}
      </div>
    </div>
  );
}

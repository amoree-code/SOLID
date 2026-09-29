import { createFileRoute } from '@tanstack/react-router';
import dashboardData from '@/app/dashboard/data.json';
import { ChartAreaInteractive } from '@/shared/components/blocks/dashboard-01/chart-area-interactive';
import { DataTable } from '@/shared/components/blocks/dashboard-01/data-table';
import { SectionCards } from '@/shared/components/blocks/dashboard-01/section-cards';

export const Route = createFileRoute('/_app/')({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards />
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive />
        </div>
        <DataTable data={dashboardData} />
      </div>
    </div>
  );
}

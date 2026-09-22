import { createFileRoute } from '@tanstack/react-router';
import { ChartAreaInteractive } from '@/shared/components/chart-area-interactive';
import { SectionCards } from '@/shared/components/section-cards';

export const Route = createFileRoute('/_dashboard/')({
  component: DashboardHome,
});

function DashboardHome() {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <SectionCards />
      <ChartAreaInteractive />
    </div>
  );
}

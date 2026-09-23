import { Button } from '@/shared/components/ui/button';
import { useTranslation } from '@/shared/i18n/use-translation';
import type { DataTablePaginationState } from './data-table.types';

type DataTablePaginationProps = DataTablePaginationState & {
  onPageChange: (page: number) => void;
};

export function DataTablePagination({
  page,
  pageSize,
  total,
  onPageChange,
}: DataTablePaginationProps) {
  const { t } = useTranslation('common');
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex items-center justify-between py-3">
      <p className="text-sm text-muted-foreground">
        {t('pagination.pageOf')
          .replace('{page}', String(page))
          .replace('{count}', String(pageCount))}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          {t('pagination.previous')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          {t('pagination.next')}
        </Button>
      </div>
    </div>
  );
}

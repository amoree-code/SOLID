import { getRouteApi } from '@tanstack/react-router';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { useTranslation } from '@/shared/i18n/use-translation';
import type { ItemSearch } from '../schemas/item-search.schema';

const routeApi = getRouteApi('/_dashboard/example-page/');

export function ItemFilter() {
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const { t } = useTranslation('items');

  function patch(partial: Partial<ItemSearch>) {
    navigate({ search: (prev) => ({ ...prev, ...partial, page: 1 }) });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Input
        placeholder={t('search.placeholder')}
        defaultValue={search.search}
        onChange={(event) => patch({ search: event.target.value })}
        className="max-w-64"
      />
      <Select
        value={search.status}
        onValueChange={(value) => patch({ status: value as ItemSearch['status'] })}
      >
        <SelectTrigger aria-label={t('filter.status')}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('filter.allStatuses')}</SelectItem>
          <SelectItem value="active">{t('status.active')}</SelectItem>
          <SelectItem value="inactive">{t('status.inactive')}</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={search.sort}
        onValueChange={(value) => patch({ sort: value as ItemSearch['sort'] })}
      >
        <SelectTrigger aria-label={t('filter.sortBy')}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt">{t('sort.createdAt')}</SelectItem>
          <SelectItem value="name">{t('sort.name')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

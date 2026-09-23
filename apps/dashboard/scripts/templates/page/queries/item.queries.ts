import { queryOptions } from '@tanstack/react-query';
import type { ItemSearch } from '../schemas/item-search.schema';
import { getItem } from '../services/get-item.service';
import { listItems } from '../services/list-items.service';
import { itemKeys } from './item.keys';

export function itemListOptions(search: ItemSearch) {
  return queryOptions({
    queryKey: itemKeys.list(search),
    queryFn: () => listItems(search),
  });
}

export function itemDetailOptions(id: string) {
  return queryOptions({
    queryKey: itemKeys.detail(id),
    queryFn: () => getItem(id),
  });
}

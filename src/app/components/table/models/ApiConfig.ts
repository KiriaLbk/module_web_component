import { PaginatorCfgInterface } from './PaginatorCfg';

export interface ApiConfigInterface {
  paginatorCfg: PaginatorCfgInterface;
  filter: any[];
  sort: object;
  booleanFilters: string[];
}

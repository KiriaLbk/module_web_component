import { PaginatorFormat } from './PaginatorFormat';

export interface PaginatorCfgInterface {
  totalCount: number;
  pageSize?: number;
  pageIndex?: number;
  limit?: number;
  start?: number;
  pageSizes?: number[];
  /**
   * изменение состояния (отображение элементов) пагинатора
   */
  paginFormat?: PaginatorFormat;
  refresh?(cfg: PaginatorCfgInterface): void;
}

export class PaginatorCfg implements PaginatorCfgInterface {
  paginFormat = new PaginatorFormat();
  pageIndex = 1;
  pageSize = 50;
  totalCount = 0;
  limit = 50;
  start = 0;
  pageSizes = [25, 50, 100, 500, 1000];

  constructor(cfg: PaginatorCfgInterface = { totalCount: 0 }) {
    this.refresh(cfg);
  }

  refresh(cfg: PaginatorCfgInterface) {
    Object.keys(cfg).forEach((prop) => {
      if (this.hasOwnProperty(prop)) {
        this[prop] = cfg[prop];
        if (prop === 'paginFormat') {
          this.paginFormat = new PaginatorFormat(cfg[prop]);
        }
      }
    });
  }
}

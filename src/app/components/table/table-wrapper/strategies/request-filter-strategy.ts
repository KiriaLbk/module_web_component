import { IFilterStrategy } from './filter-strategy.interface';
import { ViewContainerRef } from '@angular/core';
import { getParentContext } from '../../../../../../helpers/others/parentContext';

export class RequestFilterStrategy implements IFilterStrategy {
  ctx;

  constructor(ctx) {
    this.ctx = ctx;
  }
  getDataForWindow(cfg): any {
    return getParentContext(this.ctx.vcr).getDataForFilter(cfg);
  }
  dispatchCfg(cfg: any): void {
    this.ctx.changeCfgEmit.next({
      ...{
        filter: this.ctx.table.filters,
        sort: this.ctx.table.sortingColumn,
        paginatorCfg: this.ctx.table.tableConfig.paginatorCfg,
        booleanFilters: this.ctx.table.booleanFilters,
      },
      ...cfg,
    });
  }
}

import { IFilterStrategy } from './filter-strategy.interface';
import { of } from 'rxjs/internal/observable/of';

export class LocalFilterStrategy implements IFilterStrategy {
  ctx;

  constructor(ctx) {
    this.ctx = ctx;
  }
  getDataForWindow(cfg): any {
    const filterUniqueValues = [];
    /**
     * заменить как то чтобы возвращал сразу массив значений
     * должен вернуть observable any или нет? протестить
     */
    this.ctx.startData.forEach((el) => {
      if (el[cfg['columns']] && !filterUniqueValues.includes(el[cfg['columns']])) {
        filterUniqueValues.push(el[cfg['columns']]);
      }
    });
    return of(filterUniqueValues);
  }
  dispatchCfg(cfg: any): void {
    /**
     * фильтруем дату и через деструктуриззацию закидлываем обратно
     */
    cfg = {
      ...{
        filter: this.ctx.table.filters,
        sort: this.ctx.grid.sortingExpressions.slice(-1).pop(),
        paginatorCfg: this.ctx.table.tableConfig.paginatorCfg,
      },
      ...cfg,
    };
    if (!this.ctx.data) {
      this.ctx.changeCfgEmit.next(cfg);
    } else {
      const filterCfg = {};
      cfg.filter.forEach((el) => {
        filterCfg[el.fieldName] = el.filteringOperands.map((operand) => {
          return operand.searchVal;
        });
      });
      this.ctx.data = this.ctx.startData.filter((el) => {
        return Object.keys(filterCfg).every((filterField) =>
          filterCfg[filterField].some((x) => {
            return el[filterField] === x;
          })
        );
      });
      this.ctx.dataLength = this.ctx.data.length;
      this.ctx.table.tableConfig.paginatorCfg.totalCount = this.ctx.startData.length;
    }
  }
}

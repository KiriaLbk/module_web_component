import { IFilterStrategy } from './filtering-strategy.interface';

export class DefaultFilteringStrategy implements IFilterStrategy {
  ctx;
  constructor(context) {
    this.ctx = context;
  }

  /**
   * Поиск столбца, заголовок которого содержит введенное слово
   */

  filteringColumns() {
    this.ctx.hidableColumns = this.ctx.cfg.columns.filter((el) => {
      return !el.disableHiding ? el.header.toLowerCase().includes(this.ctx.filterCriteria.toLowerCase()) : false;
    });
  }
}

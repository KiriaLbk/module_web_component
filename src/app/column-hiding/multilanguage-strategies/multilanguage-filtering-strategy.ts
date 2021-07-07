import { IFilterStrategy } from './filtering-strategy.interface';

export class MultilanguageFilteringStrategy implements IFilterStrategy {
  ctx;
  constructor(context) {
    this.ctx = context;
  }

  /**
   * Поиск столбца с учетом многоязычности, получает из LanguageService набор ключей,
   * значения которых содержат введенное слово
   */

  filteringColumns() {
    const keys = this.ctx.lang.getDictionaryKeys(this.ctx.filterCriteria);
    this.ctx.hidableColumns = this.ctx.cfg.columns.filter((el) => {
      return !el.disableHiding ? keys.some((x) => el.header === x) : false;
    });
  }
}

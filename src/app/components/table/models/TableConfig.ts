import { PaginatorCfg, PaginatorCfgInterface } from './PaginatorCfg';
import { FilterField, FiltersField } from '../../../adapters/table-adapter/FilterField';
import { GridTable, GridTableInterface } from './GridTable';
import { ITemplateTable, TemplateTable } from '../../../adapters/table-adapter/templateTable';
import { FilterFieldBuilder } from './FilterFieldBuilder.model';

export interface TableConfigInterface {
  /**
   * Столбцы для таблица
   */
  filtersFields: FiltersField[];
  /**
   * Шаблоны по умолчанию для таблицы
   */
  templatesTable?: ITemplateTable[];
  /**
   * Отображение пагинатора
   */
  paginator?: boolean;
  /**
   * Общий конфиг для таблицы
   */
  gridConfig?: GridTableInterface;
  /**
   * Конфиг для пагинатора
   */
  paginatorCfg?: PaginatorCfgInterface;
  refreshCfg?(cfg: TableConfigInterface): void;
}

export class TableConfig implements TableConfigInterface {
  filtersFields = [];
  templatesTable = [];
  paginator = true;
  gridConfig = new GridTable();
  paginatorCfg = new PaginatorCfg();

  constructor(cfg?: TableConfigInterface) {
    if (!cfg || !cfg.hasOwnProperty) return;
    Object.keys(cfg).forEach((prop) => {
      if (this.hasOwnProperty(prop)) {
        if (prop === 'paginatorCfg') {
          this.paginatorCfg = new PaginatorCfg(cfg[prop]);
        } else if (prop === 'gridConfig') {
          this.gridConfig = new GridTable(cfg[prop]);
          this.paginator = cfg[prop].hasOwnProperty('paginator') ? cfg[prop].paginator : this.paginator;
        } else if (prop === 'templatesTable') {
          this.templatesTable = cfg.templatesTable.map((el) => new TemplateTable(el));
        } else {
          this[prop] = cfg[prop];
        }
      }
    });
    if (cfg.filtersFields) {
      this.filtersFields = cfg.filtersFields.map((el) => new FilterField(new FilterFieldBuilder(this.gridConfig, el)));
    }
  }

  refreshCfg(cfg: TableConfigInterface) {
    Object.keys(cfg).forEach((prop) => {
      if (this.hasOwnProperty(prop)) this[prop] = cfg[prop];
    });
  }
}

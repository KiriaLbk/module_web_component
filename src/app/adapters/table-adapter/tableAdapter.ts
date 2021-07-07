import { SendAdapterCfg } from '../../components/table/models/TableAdapter.config';
import { Observable } from 'rxjs';
import { FiltersField } from './FilterField';
import { GridTableInterface } from '../../components/table/models/GridTable';
import { EditCellConfig, EditRowConfig } from '../../components/table/models/EditRow.config';
import { ITemplateTable } from './templateTable';
import { TableConfigInterface } from '../../components/table/models/TableConfig';
import { ISortingExpression } from 'igniteui-angular';

export interface TableAdapterCfg {
  /**
   * Конфиг для таблицы
   */
  gridConfig?: GridTableInterface;
  /**
   * Конфиг для колонок в таблице
   */
  filtersFields: FiltersField[];
  /**
   * Конфиг для шаблонов таблицы.
   * Разные представления таблицы.
   */
  templatesTable?: ITemplateTable[];
}

export interface TableAdapter {
  config: TableConfigInterface;

  /**
   * Получение значений для фильтра
   * @param cfg
   */
  getDataForFilter?(cfg: SendAdapterCfg, field?: string): Observable<any>;

  /**
   * Получение строк для таблицы
   * @param cfg
   */
  loadDataForTable(cfg: SendAdapterCfg): Observable<any>;

  /**
   * Обработка измененной строки после редактирования
   * @param rowCfg
   */
  onRowEdit?(rowCfg: EditRowConfig): void;

  /**
   * Обработка измененной ячейки после редактирования
   * @param cellCfg
   */
  onCellEdit?(cellCfg: EditCellConfig): void;

  /**
   * Выбор строк в таблице(через чекбоксы)
   * @param selections
   */
  onSelectionChange?(selections: string[]): void;
}

import { IgxColumnComponent } from 'igniteui-angular';

export interface ColumnHidingCfg {
  /**
   * Заголовок окна скрытия столбцов
   */
  title?: string;
  /**
   * максимальная высота динамического окна
   */
  columnsAreaMaxHeight?: string;
  /**
   * Массив колонок таблицы
   */
  columns?: IgxColumnComponent[];
  /**
   * Фоновый текст для поле воода имени колонки
   */
  filterColumnsPrompt?: string;
  /**
   * Флаг для возможности поиска столбцов
   */
  disableFilter?: boolean;
  /**
   * Флаг для возможности 'Показать все'
   */
  disableShowAll?: boolean;
  /**
   * Флаг для возможности "Скрыть все"
   */
  disableHideAll?: boolean;
  /**
   * Флаг мультиязычности
   */
  multiLanguage?: boolean;
}

export class ColumnHidingCfgModel implements ColumnHidingCfg {
  title = '';
  columnsAreaMaxHeight = '';
  columns = [];
  filterColumnsPrompt = 'Search column';
  disableFilter = false;
  disableShowAll = false;
  disableHideAll = false;
  multiLanguage = false;

  constructor(cfg = {}) {
    Object.keys(cfg).forEach((prop) => {
      if (this.hasOwnProperty(prop)) {
        this[prop] = cfg[prop];
      }
    });
  }
}

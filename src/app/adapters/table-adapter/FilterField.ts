import { Formatters } from './formatters';
import { DropdownListFactory, DropdownListMode } from './dropDownListFactory';

export type CellEditorType = 'none' | 'select' | 'slideToggle';

export interface FiltersField {
  /**
   * Ключ для колонки
   */
  field: string;
  /**
   * Перевод - то, что отображается в таблице для header
   */
  name?: string;
  /**
   * Сортировка
   */
  sortable?: boolean;
  /**
   * Фильтрация
   */
  filterable?: boolean;
  /**
   * Изменение размера столбца
   */
  resizable?: boolean;
  /**
   * Перетаскивание столбца
   */
  movable?: boolean;
  /**
   * Фильтрация по совпадению. Временно включена по умолчанию.
   */
  likeFilter?: boolean;
  /**
   * Подзаголовки
   */
  childs?: FiltersField[];
  /**
   * Закрепление столбцов. Чтобы при боковом скролле отображались.
   */
  pinned?: boolean;
  /**
   * Тип данных ('string')
   */
  dataType?: string;
  /**
   * Тип редактора ячейка
   */
  cellEditorType?: CellEditorType;
  /**
   * Ширина столбца
   */
  width?: string;
  /**
   * Скрытие столбца
   */
  hidden?: boolean;
  /**
   * Редактирование столбца (boolean) true
   */
  editable?: boolean;
  /**
   * поле для передачи функции трансформирования значения ячейки
   */
  formatter?: (data) => {};
  /**
   * индекс строки, с которой начинается поле
   */
  rowStart?: number;
  /**
   * индекс строки, где должно заканчиваться текущее поле.
   * Количество строк между rowStart и rowEnd будет определять количество охватывающих строк в этом поле
   */
  rowEnd?: number;
  /**
   * индекс столбца, с которого начинается поле
   */
  colStart?: number;
  /**
   * индекс столбца, где должно заканчиваться текущее поле
   */
  colEnd?: number;
  /**
   * Параметр для группировки.
   * Определяет будет ли включено поле в группировку
   */
  groupable?: boolean;
  /**
   * Infinity scroll
   * Динамическое получение данных при фильтрации
   */
  infinityScroll?: boolean;
  /**
   * Стратегия фильтрации
   * @param options
   * @param value
   */
  customFilterStrategy?: (options, value) => any[];
  /**
   * Формат отображения значений в выпадающем списке фильтра
   */
  dropdownListMode?: DropdownListMode;
}

/**
 *!!! Есть баг, когда включен movable все обработчики на фильтрации,
 * сортировке и прочих actions не будут работать
 * Обрпаботано параметром draggable false.
 */

export class FilterField implements FiltersField {
  field = '';
  filterable = true;
  movable = true;
  resizable = true;
  name = '';
  hidden = false;
  sortable = true;
  likeFilter = false;
  childs = [];
  pinned = false;
  dataType = 'string';
  width = null;
  editable = false;
  formatter = null;
  rowStart = null;
  rowEnd = null;
  colStart = null;
  colEnd = null;
  groupable = false;
  dropdownListMode: DropdownListMode = 'default';
  getDropdownList = null;
  selectDropdownList = null;
  infinityScroll = false;
  customFilterStrategy = null;

  constructor(cfg = {} as any) {
    Object.keys(cfg).forEach((prop) => {
      if (this.hasOwnProperty(prop)) {
        if (prop === 'childs') {
          this[prop] = cfg[prop].map((e) => new FilterField(e));
        } else if (prop === 'dataType') {
          if (cfg.field !== 'weldingDate') {
            this.formatter = Formatters[cfg[prop]] ? Formatters[cfg[prop]] : this.formatter;
          }
          this[prop] = cfg[prop];
        } else if (prop === 'dropdownListMode') {
          const factory = new DropdownListFactory(cfg[prop] as DropdownListMode);
          this.getDropdownList = factory.getList;
          this.selectDropdownList = factory.selectValue;
          this[prop] = cfg[prop];
        } else {
          this[prop] = cfg[prop];
        }
      }
    });
  }
}

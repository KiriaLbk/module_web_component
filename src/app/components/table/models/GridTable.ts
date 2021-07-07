import { TemplateRef } from '@angular/core';
import { PaginatorCfg } from './PaginatorCfg';
import { IFilterWrapper, InitialFilters } from './initialFilters';
import { ISortingExpression } from 'igniteui-angular';
import { IRowClasses } from './RowClasses.model';

export interface GridTableInterface {
  /**
   * Флаг обработки слушателей элементов из шаблона
   */
  templateElementKeydownListener?: boolean;
  /**
   * Конфиг копирования значения из ячеек
   */
  clipboardOptions?: { copyHeaders: boolean; separator: string; enabled: boolean };
  /**
   * Возможность скрытия столбцов (true)
   */
  columnHiding?: boolean;
  /**
   * Возможность выбора строк (Чекбоксы) (false)
   * @deprecated Использовать rowSelection
   */
  rowSelectable?: boolean;
  /**
   * Возможность выбора нескольких строк (Чекбоксы) (none, single, multiple)
   */
  rowSelection?: string;
  /**
   * Возможность выбора нескольких ячеек (none, single, multiple)
   */
  cellSelection?: string;
  /**
   * Размер строк по умолчанию ('compact')
   */
  displayDensity?: string;
  /**
   * !!!
   * Включение фильтрации. Не нужно сейчас, так как мы используем
   * свои фильтры(false)
   */
  allowFiltering?: boolean;
  /**
   * Мод фильтрации, также пока неактуален
   */
  filterMode?: string;
  /**
   * Высота igx сетки
   */
  height?: string;
  /**
   * Ширина igx сетки
   */
  width?: string;
  /**
   * Отображение верхнего toolbar
   */
  showToolbar?: boolean;
  /**
   * Название toolbar
   */
  toolbarTitle?: string;
  /**
   *  Название окна для скрытия столбцов
   */
  columnHidingTitle?: string;
  /**
   * Текст для скрытого количества
   */
  hiddenColumnsText?: string;
  /**
   * Редактирование строки (false)
   */
  rowEditable?: boolean;
  /**
   * Уникальный ключ, по которому привязывается строка ('id')
   */
  primaryKey?: string;
  /**
   * Индексация таблицы (false)
   */
  indexTable?: boolean;
  /**
   * Уникальный индекс таблицы для привязки пользовательского шаблона
   * Если не задан, по умолчанию поставит текущий url.
   */
  gridId?: string;
  /**
   * Закрепление столбцов. Действует для всех колонок. по умолчанию true
   */
  columnsPinned?: boolean;
  /**
   * Столбец для действий пользоватея
   */
  actionColumn?: boolean;
  /**
   * Ширина столбца для действий пользоватея
   */
  actionColumnWidth?: string;
  /**
   * Шаблон для столбца дейтсвий
   */
  actionColumnTemplate?: TemplateRef<any>;
  /**
   * Пагинатор (true)
   */
  paginator?: boolean;
  /**
   * Сохранение состояния таблицы (stater) false
   * либо массив с ключами, которые необходимо засэтать
   * [sorting, filtering] - default values
   */
  stater?: boolean | Array<'paging' | 'selection' | 'columns' | 'paginator'>;
  /**
   * Иконка шаблона
   */
  templateAdding?: boolean;
  /**
   * отображение тултипа
   */
  isShowTooltip?: boolean;
  /**
   * Расширенный фильтр (false)
   */
  advancedFilters?: boolean;
  /**
   * Фильтр при инициализации
   */
  initialFiltersConfig?: IFilterWrapper[];
  /*
   * Мультиязычность
   */
  multiLanguage?: boolean;

  /**
   * Локальный фильтр.
   * Данные получаются первым запросом и дальше уже вся фильтрация происходит
   * на клиенте.
   */
  localFilter?: boolean;
  /**
   * Стратегия для локального поиска.
   * Работает для всех столбцов у которых не задана своя стратегия фильтрации
   * @param options
   * @param value
   */
  customFilterStrategy?: (options, value) => any[];
  /**
   * отображение управляющей панели.
   */
  isControlButtons?: boolean;
  /**
   * Редактирование всех ячеек в таблице
   */
  cellEdit?: boolean;
  /**
   * Параметры для группировки
   */
  groupingExpressions?: ISortingExpression[];
  /**
   * Флаг на кастомную группирующую строку
   */
  groupHeaderMode?: boolean;
  /**
   * Выделение строки цветом
   */
  rowClasses?: IRowClasses;

  /**
   * Выбор строк, запрещенных для выбора
   */
  disableSelectRow?(row): boolean;
}

export class GridTable implements GridTableInterface {
  templateElementKeydownListener = false;
  allowFiltering = false;
  columnHiding = true;
  filterMode = 'excelStyleFilter';
  displayDensity = 'compact';
  height = '100%';
  width = '100%';
  showToolbar = true;
  rowSelectable = false;
  rowSelection = 'none';
  cellSelection = 'multiple';
  rowEditable = false;
  toolbarTitle = 'Таблица';
  columnHidingTitle = 'Скрытые столбцы';
  hiddenColumnsText = 'Скрыто';
  primaryKey = 'id';
  indexTable = false;
  gridId = '';
  columnsPinned = true;
  actionColumn = false;
  actionColumnWidth = '85px';
  actionColumnTemplate: TemplateRef<any>;
  paginator = true;
  stater = false;
  templateAdding = false;
  isShowTooltip = false;
  advancedFilters = false;
  initialFiltersConfig = null;
  rowClasses = null;
  disableSelectRow = null;
  multiLanguage = false;
  localFilter = false;
  customFilterStrategy = null;
  isControlButtons = true;
  cellEdit = false;
  groupingExpressions = [];
  groupHeaderMode = null;
  clipboardOptions = null;

  constructor(cfg = {}) {
    Object.keys(cfg).forEach((prop) => {
      if (this.hasOwnProperty(prop)) {
        try {
          switch (prop) {
            case 'initialFiltersConfig':
              this.initialFiltersConfig = cfg[prop] ? cfg[prop].map((x) => new InitialFilters(x)) : cfg[prop];
              break;
            case 'rowSelection':
              this.rowSelection = cfg[prop] ? cfg[prop] : 'none';
              break;
            case 'rowSelectable':
              this.rowSelection = cfg['rowSelection'] ? cfg['rowSelection'] : cfg[prop] ? 'multiple' : 'none';
              break;
            case 'groupHeaderMode':
              this.groupHeaderMode =
                !!cfg['groupingExpressions'] && !!cfg['groupingExpressions'].length && cfg['groupHeaderMode']
                  ? cfg['groupHeaderMode']
                  : false;
              break;
            default:
              this[prop] = cfg[prop];
          }
        } catch (e) {
          console.error(`GridTable: Неправильный формат ${prop}`, e.message);
        }
      }
    });
  }
}

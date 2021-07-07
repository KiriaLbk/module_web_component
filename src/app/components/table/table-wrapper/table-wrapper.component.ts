import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  EventEmitter,
  HostListener,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { TableWrapperService } from '../table.service';
import { TableConfigInterface } from '../models/TableConfig';
import { PaginatorCfg, PaginatorCfgInterface } from '../models/PaginatorCfg';
import { ApiConfigInterface } from '../models/ApiConfig';
import {
  DefaultSortingStrategy,
  IGridEditEventArgs,
  IgxColumnComponent,
  IgxGridComponent,
  IgxToastComponent,
  ISortingExpression,
  SortingDirection,
} from 'igniteui-angular';
import { FiltersField } from '../../../adapters/table-adapter/FilterField';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EditRowConfig } from '../models/EditRow.config';
import { IgxGridStateDirective } from './state.directive';
import { WbTableFeatureTemplateDirective } from '../../../directives/wb-table-feature-template.directive';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { AdvancedFiltersComponent } from '../../../advanced-filters/advanced-filter.component';
import { AdvancedFilterService } from '../../../advanced-filters/advanced-filter.service';
import { LanguageService } from '../../../../../services/language-service/language.service';
import { IFilterWrapper } from '../models/initialFilters';

import { LocalFilterStrategy } from './strategies/local-filter-strategy';
import { RequestFilterStrategy } from './strategies/request-filter-strategy';
import { IFilterStrategy } from './strategies/filter-strategy.interface';
import * as _ from 'lodash';
import { ColumnHidingComponent } from '../../../column-hiding/column-hiding.component';
import { ColumnHidingCfgModel } from '../../../column-hiding/column-hiding-cfg.model';
import { PagingComponent } from '../../paging/paging.component';
import { HeaderFeatureTemplateDirective } from '../../../directives/header-feature-template.directive';
import { RowClassesModel } from '../models/RowClasses.model';
import { WbCellEditorTemplateDirective } from '../../../directives/cell-editor-template.directive';
import { GroupHeaderRowTemplateDirective } from '../../../directives/group-header-row-template.directive';
import { TemplateTable } from '../../../adapters/table-adapter/templateTable';
import { WbSelectDirective } from '../../../../../../../projects/wb-ui/src/lib/modules/wb-select/wb-select/wb-select.directive';

enum TYPE {
  SINGLE = 'single',
  MULTI = 'multiple',
}

@Component({
  selector: 'app-table-wrapper',
  templateUrl: './table-wrapper.component.html',
  styleUrls: ['./table-wrapper.component.scss'],
  providers: [TableWrapperService, AdvancedFilterService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableWrapperComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  activDensity = 0;
  columns: FiltersField[];
  density = 'compact';
  headerGroupingRow: any[];
  displayDensities = [
    {
      label: 'compact',
      selected: this.density === 'compact',
      togglable: true,
    },
    {
      label: 'cosy',
      selected: this.density === 'cosy',
      togglable: true,
    },
    {
      label: 'comfortable',
      selected: this.density === 'comfortable',
      togglable: true,
    },
  ];
  clipboardOptions = {
    copyHeaders: false,
    enabled: true,
    // copyFormatters: false,
    separator: '\t',
  };
  columnHiding = true;
  isAdvancedClick = true;
  currentSortingType: TYPE = TYPE.SINGLE;
  destroy$ = new Subject();
  dataLength = 0;
  paginatorForm: boolean;
  templateBuffer: TemplateRef<any>;
  headerTemplateBuffer: TemplateRef<any>;
  cellEditorTemplateBuffer: TemplateRef<any>;
  currentTemplateNumber = '0';
  advancedService: AdvancedFilterService;
  advancedComponent: ComponentRef<AdvancedFiltersComponent>;
  columnHidingComponent: ComponentRef<ColumnHidingComponent>;
  sortingExpression: ISortingExpression[];

  strategy: IFilterStrategy;
  startData;
  checkSum: number;
  selectedCheckBox;

  get rowClasses() {
    if (!this.config.gridConfig.rowClasses) {
      return null;
    }
    return new RowClassesModel(this.config.gridConfig.rowClasses);
  }

  @Input() data;
  @Input() config: TableConfigInterface;
  @Input() actionsTemplate;
  @Input() indexTemplate;
  @Input() infoPaginatorTemplate;
  /**
   * Набор шаблонов для управляющей панели
   */
  @Input() controls;
  /**
   * Набор шаблонов для столбцов
   */
  @Input() arrColForFeatures: QueryList<WbTableFeatureTemplateDirective> | any[];
  /**
   * Шаблон для шапки таблиц
   */
  @Input() headerFeature: QueryList<HeaderFeatureTemplateDirective> | any[];
  /**
   * Шаблон для редактора ячеек
   */
  @Input() cellEditor: QueryList<WbCellEditorTemplateDirective> | any[];
  /**
   * Шаблон для группирующей строки
   */
  @Input() groupHeaderTemplate: GroupHeaderRowTemplateDirective;

  @Output() changeCfgEmit = new EventEmitter<ApiConfigInterface>();
  @Output() editRowEmit = new EventEmitter<EditRowConfig>();
  @Output() editCellEmit = new EventEmitter<EditRowConfig>();
  @Output() onSelectionEmit = new EventEmitter<string[]>();

  @ViewChild('gridRowEdit', { read: IgxGridComponent, static: true }) public gridRowEdit: IgxGridComponent;
  @ViewChild('grid', { static: true }) public grid: IgxGridComponent;
  @ViewChild('toast', { static: true }) public toast: IgxToastComponent;
  // @ViewChild('column', {static: false}) column: ElementRef;
  @ViewChild(IgxGridStateDirective, { static: true }) public state;
  @ViewChild('settings', { static: false }) settings: ElementRef;
  @ViewChild('settingsImg', { static: false }) settingsImg: ElementRef;
  @ViewChild('advancedFilter', { static: false, read: ViewContainerRef }) advancedFilter: ViewContainerRef;
  @ViewChild('hidingColumns', { static: false, read: ViewContainerRef }) hidingColumns: ViewContainerRef;
  @ViewChild('pagingComponent', { static: false, read: PagingComponent }) public pagingComponent: PagingComponent;
  @HostListener('pointerdown', ['$event'])
  public onClick(event) {
    const target = event.target ? event.target.tagName.toLowerCase() : '';
    if (
      this.grid.crudService.cell &&
      target !== 'igx-grid-cell' &&
      !event.path.map((e) => e.className).includes('igx-grid__tbody')
    ) {
      this.grid.endEdit();
      this.grid.cdr.detectChanges();
    }
  }
  constructor(
    private matDialog: MatDialog,
    public table: TableWrapperService,
    public cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private lang: LanguageService,
    private vcr: ViewContainerRef,
    private factory: ComponentFactoryResolver,
    private injector: Injector
  ) {
    this.lang.change$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.tableUpdate();
      this.cdr.detectChanges();
    });
  }

  /*
    Стандартная сортировка таблиц igx выключена из-за срабатывания по клюку заголовка
    и используется своя для кнпки сортировки
   */
  sort(col: IgxColumnComponent) {
    const sortingDirection = this.getSortingDirection(col.field);
    this.grid.sort({ fieldName: col.field, dir: sortingDirection, ignoreCase: true });
  }

  // получить напрвление сотировки
  // 0 - дефолт
  // 1 - возрастание
  // 2 - убывание
  getSortingDirection(colName: string) {
    if (!this.table.checkSortingOfActive(colName)) return SortingDirection.Asc;
    if (this.table.typeSorting === 'ASC') return SortingDirection.Desc;
    if (this.table.typeSorting === 'DESC') return SortingDirection.None;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.arrColForFeatures = this.arrColForFeatures['_results']
      ? this.arrColForFeatures['_results']
      : this.arrColForFeatures;
    this.headerFeature = this.headerFeature['_results'] ? this.headerFeature['_results'] : this.headerFeature;
    this.cellEditor = this.cellEditor['_results'] ? this.cellEditor['_results'] : this.cellEditor;
    if (changes.data && changes.data.currentValue) {
      this.stopViewLoading();
      this.dataLength = this.data.length;
      if (this.config.gridConfig.localFilter) {
        this.startData = _.cloneDeep(this.data);
      }
      if (this.grid.selectedRows().length) {
        const _selectedIds = this.grid.selectedRows();
        const _sortingIds = this.grid.groupingFlatResult
          .filter((el) =>
            this.config.gridConfig.disableSelectRow ? this.config.gridConfig.disableSelectRow(el) : true
          )
          .map((el) => el[this.config.gridConfig.primaryKey]);
        this.checkSelection({ newSelection: _sortingIds.filter((id) => _selectedIds.includes(id)) });
      }
      this.grid.cdr.detectChanges();
    } else if (changes.config) {
      this.setStrategy(this.getActualStrategy());
      if (this.config.gridConfig.advancedFilters) {
        this.advancedService = this.injector.get(AdvancedFilterService);
      }
      this.table.initTable(this.config);
      if (this.config.gridConfig.stater) {
        this.table.setCheckSumStorage(this.config, this.state.currentUrl);
        this.table.setCheckSumLocalStorage(this.config, this.state.currentUrl);
      }
      if (this.route.snapshot.queryParams.idQrCode && changes.config.firstChange) {
        this.getQRStateForInit(this.route.snapshot.queryParams.idQrCode);
      } else if (
        this.config.gridConfig.stater &&
        !this.config.gridConfig.initialFiltersConfig &&
        this.table.checkSumComparison(this.config, this.state.currentUrl)
      ) {
        this.getSavedStateForInit();
      } else {
        if (this.config.gridConfig.templateAdding) {
          this.getTemplate();
          // TODO delete after fix request
        }
        this.setFilters(this.config.gridConfig.initialFiltersConfig);
        this.currentTemplateNumber = '0';
        this.columns = this.config.filtersFields;
        this.dispatchCfg();
      }
    }
    this.config.gridConfig.localFilter
      ? this.table.setTotalCountPaginator(this.dataLength)
      : this.table.setTotalCountPaginator(this.config.paginatorCfg.totalCount);
    // this.createGroupHeaderInfo(this.grid.groupsRecords)
    this.cdr.detectChanges();

    if (!this.grid.sortingExpressions.length && !!this.config.gridConfig.groupingExpressions) {
      this.grid.sortingExpressions = this.config.gridConfig.groupingExpressions;
      // this.grid['_groupingExpressions'] = this.config.gridConfig.groupingExpressions;
    }
    if (this.config.gridConfig.templateElementKeydownListener) {
      this.onTemplateElementsKeydown();
    }
  }

  // срабатывает при событии onRangeSelection у igx-grid
  // т.е. при выборе диапазона
  onRangeSelection(e) {
    this.clipboardOptions.copyHeaders = true;
  }

  // срабатывает при событии onSelectionOwn у igx-grid
  // т.е. при выборе IgxGridCellComponent
  onSelectionOwn(e) {
    this.clipboardOptions.copyHeaders = false;
  }

  // установка фильтров
  setFilters(filters: IFilterWrapper[]) {
    if (!filters) {
      return;
    }
    this.table.filters = filters;
    this.table.filters.forEach((elem) => {
      if (this.table.activeFilters.every((item) => item !== elem['fieldName'])) {
        this.table.activeFilters.push(elem['fieldName']);
      }
    });
  }

  // проверяет компонент и дочерний компоненты на изменения
  updateTemplate() {
    this.cdr.detectChanges();
  }

  // нигде не используется
  transformDate(val) {
    return new Date(val);
  }

  ngOnInit() {
    this.startViewLoading();
  }

  ngAfterViewInit(): void {
    this.checkHiddenColumns();
    this.table.changeFilterFlag$.subscribe((res) => {
      if (this.pagingComponent && this.pagingComponent.page > 0) {
        this.pagingComponent.paginate(0, false);
      }
      this.table.cachedFieldFilters = [];
    });
  }

  // создать стратегию
  getActualStrategy() {
    return this.config.gridConfig.localFilter ? new LocalFilterStrategy(this) : new RequestFilterStrategy(this);
  }

  // присваиваем стратегию
  setStrategy(strategy: IFilterStrategy) {
    this.strategy = strategy;
  }

  // Функция вызывается при смене языка
  // помечает реест как измененный
  tableUpdate() {
    this.grid.cdr.markForCheck();
  }

  // Функция меняет свойство paginatorForm,
  // которое передается в компонент app-paging
  handlePaginatorForm(e) {
    this.paginatorForm = e;
  }

  // получение шаблона
  getTemplate() {
    this.table.getCustomTemplate({ typeTemplate: this.state.currentUrl }).subscribe((res) => {
      if (!!res.data) {
        res.data.forEach((el) => {
          this.config.templatesTable.push(
            new TemplateTable({
              ...JSON.parse(el.data),
              id: el.id,
              field: window.btoa(encodeURIComponent(el.nameTemplate)),
              name: el.nameTemplate,
              custom: true,
            })
          );
        });
      }
    });
  }

  /**
   * Получение шаблона для столбца по field
   * @param field
   */
  getTemplateForColumn(field: string) {
    return this.arrColForFeatures.some((e) => {
      if (e.columnsForFeatures.some((el) => el === field)) {
        this.templateBuffer = e.templateRef;
        return true;
      }
      return false;
    });
  }

  // проверка на наличие св-ва field
  // если true - отображение шаблона редатикрования ячеек
  getCellEditorTemplate(field: string) {
    return this.cellEditor.some((e) => {
      if (e.columnsForCellEditor.some((el) => el === field)) {
        this.cellEditorTemplateBuffer = e.templateRef;
        return true;
      }
      return false;
    });
  }

  // получить название группы
  getNameGroup(field) {
    let name = '';
    this.columns.some((el) => {
      if (el.field && el.field === field) {
        name = el.name;
        return true;
      } else {
        return el.childs.some((item) => {
          if (item.field === field) {
            name = el.name;
            return true;
          }
          return false;
        });
      }
    });
    return name;
  }

  /**
   * Обработка клика по ячейкам
   * @param args
   */
  checkSelection(args) {
    const event = args.event;
    if (event && !event.currentTarget.classList.contains('igx-grid__cbx-selection')) {
      args.cancel = true;
    } else {
      const data = this.grid.data
        .filter((el) => (this.config.gridConfig.disableSelectRow ? this.config.gridConfig.disableSelectRow(el) : false))
        .map((el) => el[this.config.gridConfig.primaryKey]);
      const newSelection = args.newSelection.filter((id) => data.indexOf(id) < 0);
      args.newSelection = newSelection;
    }
    if (args.cancel) {
      return;
    }
    this.handleRowSelection(args);
  }

  /**
   * Функция для получения сохраненных состояний
   * для фильтрации, сортировки, пагинации, закрепленых и скрытых столбцов
   */
  getSavedStateForInit() {
    this.state.setFiltersField(this.config.filtersFields);
    const savedConfig = {};
    const defaultActions = ['templateNumber', 'dataLength', 'filtering', 'sorting', 'booleanFilters'];
    const actions = Array.isArray(this.config.gridConfig.stater)
      ? [...this.config.gridConfig.stater, ...defaultActions]
      : [...['columns', 'paging', 'paginator', 'grouping', 'groupHeaderMode'], ...defaultActions];

    if (this.config.gridConfig.stater) {
      actions.forEach((el) => {
        savedConfig[el + 'FromState'] = this.state.getConfigForGrid(el);
      });
      if (this.config.gridConfig.templateAdding) {
        this.currentTemplateNumber = savedConfig['templateNumberFromState'] || this.currentTemplateNumber;
      }
    }
    this.checkSum = savedConfig['checkSum'] || null;

    this.grid.sortingExpressions = savedConfig['sortingFromState'] || this.grid.sortingExpressions;
    this.table.tableConfig.gridConfig.groupingExpressions = this.grid.groupingExpressions =
      savedConfig['groupingFromState'] || this.grid.groupingExpressions;
    this.table.tableConfig.gridConfig.groupHeaderMode =
      savedConfig['groupHeaderModeFromState'] || this.table.tableConfig.gridConfig.groupHeaderMode;
    this.columns = savedConfig['columnsFromState'] || this.config.filtersFields;
    this.table.tableConfig.paginatorCfg = savedConfig['pagingFromState']
      ? new PaginatorCfg(savedConfig['pagingFromState'])
      : new PaginatorCfg();
    this.paginatorForm = savedConfig['paginatorFromState'] || false;

    this.table.activeSorting = this.grid.sortingExpressions[0] ? this.grid.sortingExpressions[0]['fieldName'] : null;
    this.table.sortingColumn = this.grid.sortingExpressions[0] || null;
    this.table.typeSorting = this.grid.sortingExpressions[0]
      ? this.table.SORTING_TYPES[this.grid.sortingExpressions[0]['dir']]
      : null;
    this.table.booleanFilters = savedConfig['booleanFiltersFromState'] || this.table.booleanFilters;

    const filters = savedConfig['filteringFromState'] || this.table.filters;
    this.setFilters(filters);
    this.dispatchCfg();
  }

  /**
   * функция проверки скрытых столбцов, активирует иконку "настройки столбцов"
   */
  checkHiddenColumns() {
    if (!this.settingsImg) {
      return;
    }
    this.grid.columns.some((el) => {
      if (el.hidden === true) {
        this.settingsImg.nativeElement.style.opacity = '0.8';
        return true;
      }
      this.settingsImg.nativeElement.style.opacity = '0.5';
    });
  }

  /**
   * Функция для динамического создания/уничтожения окна для скрытия столбцов
   */
  chooseColumnHiding() {
    if (this.columnHiding && this.config.gridConfig.columnHiding) {
      const factory = this.factory.resolveComponentFactory(ColumnHidingComponent);
      this.hidingColumns.clear();
      this.columnHidingComponent = this.hidingColumns.createComponent(factory);
      this.columnHidingComponent.instance.cfg = new ColumnHidingCfgModel({
        columns: this.grid.columns,
        hideAllText: 'SHOW ALL',
        filterColumnsPrompt: 'COLUMN_SEARCH',
        multiLanguage: this.config.gridConfig.multiLanguage,
      });
      this.allowColumnHiding();
      fromEvent(document, 'mousedown')
        .pipe(takeUntil(this.destroy$))
        .subscribe((e) => {
          if (
            !e['path'].some((el) => {
              return el.className ? el.className.toString().includes('columnHidingContainer') : false;
            })
          ) {
            this.columnHidingComponent.destroy();
            this.columnHiding = true;
            this.destroy$.next();
          }
          this.checkHiddenColumns();
        });
      this.cdr.detectChanges();
    }
  }

  // Функция, которая срабатывает после открытия компонента для выбора скрытых св-в
  // меняет значение св-ва columnHiding, чтобы компонент снова не создавался до того,
  // пока его не закроют нажатием вне области компонента
  allowColumnHiding() {
    this.columnHiding = !this.columnHiding;
  }

  // Функция, реализующая события нажатия на кнопки разрядки
  selectDensity(event) {
    this.activDensity = event;
    this.density = this.displayDensities[event].label;
    this.grid.displayDensity = this.displayDensities[event].label;
    this.grid.reflow();
  }

  // Функция, реализующая изменение номера страницы, увеличения числа элементов таблицы
  paginatorChange(cfg: PaginatorCfgInterface) {
    this.table.tableConfig.paginatorCfg.refresh(cfg);
    this.dispatchCfg(cfg);
  }

  // Функция, которое вызывается, когда сортировка igx-grid проходит успешно
  // св-во класса igx-grid из библиотеки
  sortingDone($event) {
    if (this.currentSortingType === TYPE.SINGLE) {
      this.grid.sortingExpressions.forEach((el) => {
        if (el.fieldName !== $event.fieldName) {
          !!this.grid.groupingExpressions.length &&
          this.grid.groupingExpressions.some((item) => item.fieldName === el.fieldName)
            ? (el.dir = 0)
            : this.grid.clearSort(el.fieldName);
        }
      });
    }

    this.table.setSortingColumn($event);

    this.dispatchCfg();
  }

  // тоже самое, что и dispatchCfg()
  // обновление реестра
  changeCfg() {
    this.dispatchCfg();
  }

  // функция, которая вызывает метод dispatchCfg у strategy,
  // которая в свою очередь эмитит новое событие и вызывается метод ngOnChanges,
  // т.е. обновляется реестр
  dispatchCfg(cfg = {}) {
    /**
     * Временно this.table.filters пока используются наши фильтры.
     * Так должно быть this.grid.filteringExpressionsTree.filteringOperands
     */
    this.strategy.dispatchCfg(cfg);
  }

  // функция, которая переносит столбец в действующий(при событии mouseup на фильтре)
  toggleColumn(col: IgxColumnComponent) {
    col.pinned ? col.unpin() : col.pin();
  }

  // получить число строк, которые переведены в checked : true;
  public get allSelectable(): number {
    return (
      this.grid.data.length -
      this.grid.data.filter((el) =>
        this.config.gridConfig.disableSelectRow ? this.config.gridConfig.disableSelectRow(el) : false
      ).length
    );
  }

  // для проверки, отмечены ли все доступные строки(селекторы) в checked : true;
  public allSelected(selected: number, total: number): boolean {
    return selected >= total;
  }

  // Событие нажатия на селектор в шапке
  // перевод/удаление из всех доступных полей(селекторов) checked : true;
  handleClick(event: Event, context) {
    event.stopPropagation();
    event.preventDefault();
    let newSelection: any[] = [];
    if (this.allSelected(context.selectedCount, this.allSelectable)) {
      this.gridRowEdit.deselectAllRows();
    } else {
      newSelection = this.grid.groupingFlatResult
        .filter((row) =>
          this.config.gridConfig.disableSelectRow ? !this.config.gridConfig.disableSelectRow(row) : true
        )
        .map((el) => el[this.config.gridConfig.primaryKey]);
      this.gridRowEdit.selectRows(newSelection);
    }
    this.checkSelection({ newSelection });
  }

  // емитится новое значение выбранных селекторов через Output наверх
  handleRowSelection(e) {
    this.onSelectionEmit.next(e.newSelection);
  }

  // событие изменения значения строки
  // свойсво объекта igx-grid из библиотеки
  // вызывается при выходе из режима редактирования строки
  handleRowEdit(e: IGridEditEventArgs) {
    if (!e.newValue) {
      return;
    }
    const difference = this.table.getDifferenceObjects(e.newValue, e.oldValue);
    this.editRowEmit.next({ difference, newValue: e.newValue, editInfo: e });
  }

  // событие изменения значения ячейки
  // свойсво объекта igx-grid из библиотеки
  // вызывается при выходе из режима редактирования ячейки
  handleCellEdit(e: IGridEditEventArgs) {
    if (!e.newValue) {
      return;
    }
    const difference = this.table.getDifferenceObjects(e.newValue, e.oldValue);
    this.editCellEmit.next({ difference, newValue: e.newValue, editInfo: e });
  }

  // Запустить окно "Загрузка данных", запускается на стадии ngOnInit
  startViewLoading() {
    this.toast.position = 1;
    this.toast.autoHide = false;
    this.toast.show();
    this.cdr.markForCheck();
  }

  // удалить окно "Загрузка данных"
  stopViewLoading() {
    this.toast.hide();
    this.cdr.markForCheck();
  }

  // срабатывает при событии onColumnInit у igx-grid
  // т.е. столбец инициализируется
  initColumns(event) {
    if (this.config.gridConfig.indexTable) {
      this.grid.pinColumn('uniqueIndex');
    }
  }

  // срабатывает при событии onColumnPinning у igx-grid
  // т.е. перед закреплением компонента
  // можно менять индекс закрепленного столбца
  columnPinning(event) {
    if (this.config.gridConfig.indexTable && event.column.field === 'uniqueIndex' && event.isPinned) {
      event.insertAtIndex = 0;
    }
  }

  // срабатывает при изменении текущего шаблона(меняет текущий шаблон)
  changeTemplate(field: string) {
    this.currentTemplateNumber = field;

    // Columns
    this.columns = this.state.getMergeColumns(
      this.table.getColumnsByTemplateField(field, this.config.filtersFields, this.config.templatesTable)
    );

    if (this.config.gridConfig.indexTable) {
      this.grid.unpinColumn('uniqueIndex');
    }

    const templateConfig = this.config.templatesTable.find((x) => x.field === this.currentTemplateNumber);

    if (templateConfig && templateConfig.hasFilterAndSort) {
      this.setFiltersByArrayWithoutFilteringOperandsKey(templateConfig.filter);
      // this.setGridSortingExpressions(templateConfig.sort);
      this.dispatchCfg();
      this.nextChangeFilterFlag();
    }
  }

  // срабатывает при нажатии на кнопку 'Выбор шаблона'
  // принимает массив шаблонов
  changeTemplateArray(event) {
    this.config.templatesTable = event;
    // this.state.saveTableTemplates(this.config.templatesTable);
  }
  /**
   * Эмит события при изменнии списка активных фильтров
   */
  nextChangeFilterFlag() {
    this.table.changeFilterFlag$.next(true);
  }
  /**
   * Временныe костыли под франкинтшейна пока разработчики не доделают норм фильтры
   */
  startTableFilter(filters: string[] | number[], column: FiltersField) {
    const field = column.field;
    const filterType = column.dropdownListMode;
    filters = filterType === 'default' ? filters : column['selectDropdownList'](filters);
    this.table.cachedFieldFilters.push(field);
    this.table.setFilterConfigForIgxFormat(filters, field, column.dropdownListMode);
    this.dispatchCfg();
    this.nextChangeFilterFlag();
  }

  /**
   * Удаление всех фильтров
   */
  clearFilters() {
    if (!this.table.filters.length) {
      return;
    }
    this.table.clearFilters();
    this.dispatchCfg();
    this.nextChangeFilterFlag();
  }

  /**
   * Функция для динамического создания/уничтожения окна для расширенной фильтрации
   */
  createAdvancedFiltersWindow() {
    if (this.isAdvancedClick) {
      const factory = this.factory.resolveComponentFactory(AdvancedFiltersComponent);
      this.advancedFilter.clear();
      this.advancedComponent = this.advancedFilter.createComponent(factory);
      this.advancedComponent.instance.data = {
        parent: this,
      };
      this.allowAdvancedClick();
      this.cdr.detectChanges();
    }
  }

  /**
   * к этой функции обращение идет из динамического компонента,
   * поэтому она не подсвечивается
   */
  allowAdvancedClick() {
    this.isAdvancedClick = !this.isAdvancedClick;
  }
  // Получить начальные значения при открытия фильтра по значению
  getDataForWindow(cfg?) {
    return this.strategy.getDataForWindow(cfg);
  }

  // не используется
  getCheckValues(arg) {
    const field = Object.keys(arg[0] || [{}])[0];
    const valuesCheck = this.table.getFilteringValuesByField(field);
    const checks = [];
    for (let i = 0; i < arg.length; i++) {
      let e = arg[i];
      if (valuesCheck.some((r) => r === e[field])) {
        checks.push({ ...e, checked: true });
        arg.splice(i, 1);
        i--;
      } else {
        e = { ...e, checked: false };
      }
    }
    return [...checks, ...arg];
  }

  // проверка на наличие в headerFeature filed св-ва
  // если true - отображается шаблоны шапки headerTemplateBuffer/headerFeature
  checkColumnForHeaderFeature(field) {
    return this.headerFeature.some((e) => {
      if (e.columnsForFeatures.some((el) => el === field)) {
        this.headerTemplateBuffer = e.templateRef;
        return true;
      }
      return false;
    });
    // if (!this.headerFeature.columnsForFeatures.length) return true;
    // return this.headerFeature.columnsForFeatures.some(el => el === column.field);
  }

  // checkColumnForCellEditor(column) {
  //   if (!this.cellEditor.columnsForCellEditor.length) return false;
  //   return this.cellEditor.columnsForCellEditor.some(el => el === column.field);
  // }
  /**
   * ***********************************************************************************
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // не используется
  // получить скрытые колонки
  getHiddenColumns(e: WbSelectDirective) {
    e.selectedOptions = this.grid.columns.reduce((acc, x) => (x.hidden && x.field ? [...acc, x.field] : acc), []);
  }

  // не используется
  hideColumns(e: any | any[]) {
    e = e.map((x) => x.field);
    this.grid.columns.forEach((x) => (x.hidden = e.includes(x.field)));
    this.checkHiddenColumns();
    this.cdr.markForCheck();
  }

  onTemplateElementsKeydown() {
    this.grid.dataRowList.toArray().forEach((row) => {
      row.cells.toArray().forEach((cell) => {
        const _dispatchEvent = cell.dispatchEvent;
        cell.dispatchEvent = (e) => {
          if (!e.target['tagName'] || e.target['tagName'] === 'IGX-GRID-CELL') {
            _dispatchEvent.call(cell, e);
          } else {
            e.stopPropagation();
          }
        };
      });
    });
  }

  private getQRStateForInit(id: string) {
    this.currentTemplateNumber = '0';
    this.columns = this.config.filtersFields;
    this.table.igxApi.getConfigByQRCodeId({ id }).subscribe((result) => {
      if (result) {
        // this.setGridSortingExpressions(result.sort);
        this.setFiltersByArrayWithoutFilteringOperandsKey(result.filter as any);

        this.table.tableConfig.paginatorCfg = new PaginatorCfg({
          totalCount: 0,
          limit: result.limit,
          start: result.start,
        });

        this.dispatchCfg();
      }
    });
  }

  // TODO not working atm (grid.sortingExpression somehow became empty array)
  private setGridSortingExpressions(sort: { fieldName?: string; sortOption?: 'NONE' | 'ASC' | 'DESC' }) {
    if (sort && sort.fieldName) {
      const sortingExpression: ISortingExpression = {
        fieldName: sort.fieldName,
        dir: sort.sortOption ? this.table.SORTING_TYPES.indexOf(sort.sortOption) : 0,
        ignoreCase: true,
        strategy: DefaultSortingStrategy.instance(),
      };

      this.grid.clearSearch();
      this.grid.sortingExpressions = [sortingExpression];
      this.table.setSortingColumn(sortingExpression);
    }
  }

  // при смене шаблона новые фильтры приводятся к IFilterWrapper[],
  // старые фильтры удаляются
  // присваиваются новые
  private setFiltersByArrayWithoutFilteringOperandsKey(filters: { [key: string]: Array<string | number> }) {
    if (filters) {
      const filtersForConfig = Object.entries(filters).reduce<IFilterWrapper[]>(
        (acc, [fieldName, fieldValues]) => [
          ...acc,
          { fieldName, filteringOperands: fieldValues.map((searchVal) => ({ fieldName, searchVal })) },
        ],
        []
      );
      this.table.clearFilters();
      this.setFilters(filtersForConfig);
    }
  }
}

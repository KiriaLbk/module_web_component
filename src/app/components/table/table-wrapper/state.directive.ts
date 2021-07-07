// tslint:disable:object-literal-sort-keys
import {
  AfterViewInit,
  Directive,
  Host,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Self,
  ViewContainerRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { DefaultSortingStrategy, IGroupingExpression, IgxGridComponent, ISortingExpression } from 'igniteui-angular';
import { FilterField, FiltersField } from '../../../adapters/table-adapter/FilterField';
import { TableWrapperService } from '../table.service';
import { PaginatorCfg } from '../models/PaginatorCfg';

interface IGridState {
  paging: PaginatorCfg;
  selection: any[];
  filtering: any[];
  sorting: ISortingExpression[];
  grouping: IGroupingExpression[];
  groupHeaderMode: boolean;
  columns: any[];
  paginator: boolean;
}

interface TableConfigForState {
  filters: any[];
  paging: PaginatorCfg;
}

@Directive({
  selector: '[igxState]',
})
export class IgxGridStateDirective implements AfterViewInit, OnInit, OnDestroy {
  public perPage = 15;
  public selection = true;
  public filtering = true;
  public paging = true;
  public sorting = true;
  public columns = true;
  public shouldSaveState = true;
  private currentUrl = '';
  storageKey = 'wbTable';

  public initialState: IGridState = {
    filtering: [],
    paging: new PaginatorCfg(),
    selection: [],
    sorting: [],
    grouping: [],
    groupHeaderMode: false,
    columns: [],
    paginator: false,
  };

  public gridState: IGridState;
  public tableConfig: TableConfigForState;
  private filterFieldsConfig: FilterField[];

  constructor(
    @Host() @Self() @Optional() public grid: IgxGridComponent,
    private viewContainerRef: ViewContainerRef,
    private router: Router
  ) {
    this.currentUrl = this.router.url;
  }

  @Input() gridId: string;
  @Input() table: TableWrapperService;
  @Input() paginatorInfo: boolean;
  @Input() stater: boolean;
  @Input() checkSum: number;

  @HostListener('window:beforeunload', ['$event']) unloadHandler(event: Event) {
    if (this.stater && !this.table.tableConfig.gridConfig.initialFiltersConfig) {
      this.saveGridState();
    }
    event.preventDefault();
  }

  public ngOnInit() {
    this.loadGridState();
  }

  public ngAfterViewInit() {
    this.restoreGridState();
    this.grid.cdr.detectChanges();
  }

  setFiltersField(fields: FilterField[]) {
    this.filterFieldsConfig = this.getLinearArrayFields(fields);
  }

  clearFiltersField() {
    this.filterFieldsConfig = [];
  }

  private getLinearArrayFields(arr: FilterField[]): FilterField[] {
    return arr.reduce((acc, el) => {
      const childs = el.childs;
      return el.childs.length ? [...acc, el, ...childs] : [...acc, el];
    }, []);
  }

  public saveGridState() {
    const gridId = !!!this.gridId ? this.currentUrl : this.gridId;
    this.storeState(this.storageKey, {
      grouping: this.table.tableConfig.gridConfig.groupingExpressions,
      groupHeaderMode: this.table.tableConfig.gridConfig.groupHeaderMode,
      paging: {
        limit: this.table.tableConfig.paginatorCfg.limit,
      },
      sorting: this.grid.sortingExpressions,
      filtering: this.table.filters,
      selection: [],
      columns: this.getColumns(),
      booleanFilters: this.table.booleanFilters,
      paginator: this.paginatorInfo,
      templateNumber: this.viewContainerRef['_view'].component.currentTemplateNumber,
      checkSum: JSON.parse(window.localStorage.getItem(this.storageKey + gridId)).checkSum,
    });
  }

  public loadGridState() {
    this.tableConfig = { filters: [], paging: new PaginatorCfg() };
    this.gridState = Object.assign({}, this.initialState);
    const gridId = !!!this.gridId ? this.currentUrl : this.gridId;
    const item = JSON.parse(window.localStorage.getItem(this.storageKey + gridId));

    if (!item) {
      return null;
    }
    if (item['filtering'] && typeof item['filtering'] === 'object' && item['filtering'] !== null) {
      item['filtering'] = [];
    }
    for (const propt in item) {
      if ((this.gridState as any).hasOwnProperty(propt)) {
        this.gridState[propt] = this.getStoredState(propt, item[propt]);
      }
    }
  }

  public customizer(objValue, srcValue) {
    if (Array.isArray(objValue)) {
      objValue.forEach((el, index) => this.customizer(el, srcValue[index]));
      return objValue;
    } else if (typeof objValue === 'object' && objValue !== null) {
      for (const key in objValue) {
        objValue[key] = srcValue[key] ? srcValue[key] : objValue[key];
      }

      return objValue;
    }
    return srcValue;
  }

  public restoreGridState() {
    this.loadGridState();
    // if (this.paging && this.gridState.paging) {
    //     this.tableConfig.paging = this.table.tableConfig.paginatorCfg;
    // }

    if (this.sorting && this.gridState.sorting) {
      const strategy = DefaultSortingStrategy.instance();
      this.gridState.sorting.forEach((expr) => (expr.strategy = strategy));
      this.grid.sortingExpressions = this.gridState.sorting;
    }

    if (this.selection && this.gridState.selection) {
      this.grid.selectRows(this.gridState.selection);
    }
  }

  public storeState(key: string, args: any) {
    const url = !!!this.gridId ? this.currentUrl : this.gridId;
    window.localStorage.setItem(key + url, JSON.stringify(args));
  }

  getMergeColumns(columns: FiltersField[]): FiltersField[] {
    return columns.map((el) => {
      const index = this.filterFieldsConfig.findIndex((r) => {
        return !!r.field && r.field.toLowerCase() === el.field.toLowerCase();
      });
      el = { ...el };
      const target = this.getTargetFieldByIndex(index);
      return new FilterField(!~index ? el : { ...target, ...el });
    });
  }

  getTargetFieldByIndex(index: number) {
    const target = this.filterFieldsConfig[index];
    if (target && target.childs && target.childs.length) {
      target.childs = this.getMergeColumns(target.childs);
    }
    return target;
  }

  public getStoredState(action: string, item): any {
    if (!item) {
      return null;
    }
    switch (action) {
      case 'columns':
        return this.getMergeColumns(item);
      case 'grouping':
      case 'sorting':
        const strategy = DefaultSortingStrategy.instance();
        return item.map((x) => ({ ...x, strategy }));
      default:
        return item;
    }
  }

  public getConfigForGrid(action: string): any {
    const gridId = !this.gridId ? this.currentUrl : this.gridId;
    const item = JSON.parse(window.localStorage.getItem(this.storageKey + gridId));
    if (!item) {
      return;
    }
    if (action === 'filtering' && !Array.isArray(item['filtering'])) {
      item['filtering'] = [];
    }
    return this.getStoredState(action, item[action]);
  }

  public getSavedTableTemplates() {
    const url = !!!this.gridId ? this.currentUrl : this.gridId;
    return JSON.parse(window.localStorage.getItem('custom-template' + url));
  }

  public saveTableTemplates(templatesTable) {
    const url = !!!this.gridId ? this.currentUrl : this.gridId;
    window.localStorage.setItem('custom-template' + url, JSON.stringify(templatesTable.filter((el) => el.custom)));
  }

  /**
   * Жесткий поиск в 1 уровне
   * @param arr
   * @param name
   */
  private getFieldByName(arr: FilterField[], name: string) {
    const find = arr.filter((r) => r.name === name);
    return find.length ? find[0].field : console.error('Не найден field, ошибка в структуре');
  }

  private getRecursiveColumns(columns) {
    const r = columns.map((c) => {
      const field = c.field
        ? c.field
        : this.getFieldByName(this.viewContainerRef['_view'].component.config.filtersFields, c.header);
      return {
        pinned: c.pinned,
        sortable: c.sortable,
        editable: c.editable,
        filterable: c.filterable,
        movable: c.movable,
        hidden: c.hidden,
        dataType: c.dataType,
        infinityScroll: c.infinityScroll,
        field,
        width: c.width,
        name: c.header,
        childs: c.children ? this.getRecursiveColumns(c.children) : [],
      };
    });
    return r;
  }

  private getColumns() {
    const res = this.getRecursiveColumns(
      this.grid.columns.filter(
        (r) => !r.parent && !['Actions', 'Действия', 'П/П', 'No', 'No.', 'P_P', 'ACTIONS'].includes(r.header)
      )
    );
    return res;
  }

  public getColumnsForTemplate() {
    const columns = this.getColumns();
    const res = columns.filter((c) => this.getVisibleColumns(c));
    return this.getCustomColumnFields(res);
  }

  private getVisibleColumns(col) {
    if (!col.hidden) {
      if (col.childs.length) {
        col.childs = col.childs.filter((c) => this.getVisibleColumns(c));
      }
      return col;
    }
  }

  private getCustomColumnFields(columns) {
    return columns.map((c) =>
      c.childs.length
        ? {
            field: c.field,
            name: c.name,
            pinned: c.pinned,
            childs: this.getCustomColumnFields(c.childs),
          }
        : {
            field: c.field,
            name: c.name,
            pinned: c.pinned,
          }
    );
  }

  getFiltersForTemplate() {
    return this.table.filters.reduce(
      (acc, curr) => ({ ...acc, [curr.fieldName]: curr.filteringOperands.map((y) => y.searchVal) }),
      {}
    );
  }

  getSortingForTemplate() {
    return this.sorting ? { fieldName: this.table.activeSorting, sortOption: this.table.typeSorting } : null;
  }

  ngOnDestroy() {
    if (this.stater && !this.table.tableConfig.gridConfig.initialFiltersConfig) {
      this.saveGridState();
    }
  }

  changeUrl(url) {
    this.currentUrl = url;
  }
}

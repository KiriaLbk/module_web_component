import { Injectable, OnDestroy } from '@angular/core';
import { TableConfigInterface } from './models/TableConfig';
import { FiltersField } from '../../adapters/table-adapter/FilterField';
import * as _ from 'lodash';
import { ISortingExpression } from 'igniteui-angular';
import { ITemplateTable } from '../../adapters/table-adapter/templateTable';
import { IAdvancedFilter } from '../../advanced-filters/advancedFilter.model';
import { Subject } from 'rxjs';
import { IFilterValue, IFilterWrapper } from './models/initialFilters';
import { string2Bin } from '../../../../helpers/others/string2Bin';
import { IgxApiService } from '../../igx-api.service';
import { DropdownListMode } from '../../adapters/table-adapter/dropDownListFactory';
import { WbSelectDirective } from '../../../../../../projects/wb-ui/src/lib/modules/wb-select/wb-select/wb-select.directive';

export interface ITemplateInfo {
  nameTemplate: string;
  dataTemplate: any;
  accessibility: boolean;
  typeTemplate: string;
}

@Injectable()
export class TableWrapperService implements OnDestroy {
  cachedFieldFilters: string[] = [];
  activeFilters = [];
  activeSorting = null;
  booleanFilters = [];
  filters: IFilterWrapper[] = [];
  filtersChange$ = new Subject();
  init$ = new Subject();
  SORTING_TYPES = ['NONE', 'ASC', 'DESC'];
  typeSorting = 'NONE';
  tableConfig: TableConfigInterface;
  changeFilterFlag$ = new Subject();
  sortingColumn: ISortingExpression = { fieldName: '', dir: 0 };
  checkSum;

  constructor(public igxApi: IgxApiService) {}

  ngOnDestroy(): void {
    this.init$.complete();
    this.filtersChange$.complete();
    this.changeFilterFlag$.complete();
  }

  /**
   * Проверка фильтра на активность
   * Наличие в activeFilters
   * @param field
   */
  checkFilterOfActive(field: string) {
    return this.activeFilters.some((e) => e === field);
  }

  /**
   * Изменение массива активных фильтров
   * @param length
   * @param field
   */
  changeStateFilter(length: number, field: string) {
    if (length) {
      if (!this.checkFilterOfActive(field)) {
        this.activeFilters.push(field);
      }
    } else {
      this.activeFilters.some((e, index) => {
        if (e === field) {
          this.activeFilters.splice(index, 1);
          return true;
        }
      });
    }
  }
  /**
   * Проверка активности сортировки
   * @param field
   */
  checkSortingOfActive(field: string) {
    if (!this.activeSorting) {
      return;
    }
    return this.activeSorting === field;
  }

  /**
   * Очистка всеч фильтров
   */
  clearFilters() {
    this.filters = [];
    this.activeFilters = [];
  }

  /**
   * @param oldObj
   * @param newObj
   */
  /**
   * Получение колонок для конкректного шаблона по названию field
   * @param templateFields
   * @param filtersField
   */
  getColumnsByTemplateFields(templateFields: FiltersField[], filtersField: FiltersField[]): FiltersField[] {
    return _.intersectionWith(filtersField, templateFields, (el1, el2) => {
      return el2.field ? el1.field === el2.field : el1.name === el2.name;
    }).map((el) => {
      if (el.childs && el.childs.length) {
        const childsFiltersField: FiltersField[] =
          templateFields[0].field === el.field
            ? this.getTemplateByValue<FiltersField>('field', el.field, templateFields).childs
            : this.getTemplateByValue<FiltersField>('name', el.name, templateFields).childs;
        el.childs = _.intersectionWith(el.childs, childsFiltersField, (el1, el2) => el1.field === el2.field);
      }
      return el;
    });
  }

  /**
   * Получение списка колонок по названию field
   * @param field
   * @param filtersFields
   * @param templatesTable
   */
  getColumnsByTemplateField(
    field: string,
    filtersFields: FiltersField[],
    templatesTable: ITemplateTable[]
  ): FiltersField[] {
    if (!field || !templatesTable) {
      return filtersFields;
    }
    filtersFields = _.cloneDeep(filtersFields);
    const template: ITemplateTable = this.getTemplateByValue<ITemplateTable>('field', field, templatesTable);
    //  const t = template ? this.getColumnsByTemplateFields(template.filtersFields, filtersFields) : filtersFields;
    return template ? template.filtersFields : filtersFields;
  }

  getDifferenceObjects(newObj: object, oldObj: object) {
    return oldObj
      ? _.omitBy(oldObj, (v, k) => {
          return newObj[k] === v;
        })
      : {};
  }

  /**
   * Получение отфильтрованных значений для
   * конкретного столбца по field
   * @param field
   */
  getFilteringValuesByField(field: string, wbSelect?: WbSelectDirective) {
    const filterField = this.filters.filter((el) => el.fieldName === field)[0];
    if (!!wbSelect) {
      wbSelect.selectedOptions = filterField ? filterField.filteringOperands.map((e) => e.searchVal) : [];
      wbSelect.hasCache = this.cachedFieldFilters.includes(field);
      if (!this.cachedFieldFilters.includes(field)) {
        this.cachedFieldFilters.push(field);
      }
    }
    return filterField ? filterField.filteringOperands.map((e) => e.searchVal) : [];
  }

  /**
   * Получение элемента массива по value
   * @param type
   * @param value
   * @param templates
   */
  getTemplateByValue<T>(type: string, value: string, templates: T[]): T {
    let template: T;
    templates.some((e) => {
      if (e[type] === value) {
        template = e;
        return true;
      }
    });
    return template;
  }

  /**
   * Инициализация таблицы
   * @param cfg
   */
  initTable(cfg: TableConfigInterface) {
    this.tableConfig = cfg;
    this.init$.next();
  }

  /**
   * Функция для обновления массива
   * filters из расширенного фильтра
   * @param filters
   */
  mergeAllFilters(filters: IAdvancedFilter[]) {
    this.filters = [];
    this.activeFilters = [];
    filters.forEach((e) => this.mergeFilterValue(e));
  }

  /**
   * Обновление одного фильтра по значениям
   * из расширенного фильтра
   * @param filter
   */
  mergeFilterValue(filter: IAdvancedFilter) {
    this.changeStateFilter(filter.value.length, filter.field);
    const newFilter: IFilterValue[] = filter.value.map((r) => ({ searchVal: r, fieldName: filter.field }));
    if (filter.value.length) {
      this.filters.push({ fieldName: filter.field, filteringOperands: newFilter });
    }
  }

  /**
   * Обновление таблицы через ChangeDetection
   * @param cfg
   */
  refreshTable(cfg: TableConfigInterface) {
    this.tableConfig.refreshCfg(cfg);
  }

  /**
   * Приведение фильтра к IFilterValue
   * @param filters
   * @param field
   */
  setFiltersOperands(filters: any[], field: string): IFilterValue[] {
    return filters.map((r: string | number) => ({
      searchVal: r,
      fieldName: field,
    }));
  }

  /**
   * Формирование формата фильтров
   * для запроса на сервер в IFilterValue из
   * формата table-wrapper
   * @param filters
   * @param field
   * @param filterType
   */
  setFilterConfigForIgxFormat(filters: string[] | number[], field: string, filterType: DropdownListMode = 'default') {
    this.changeStateFilter(filters.length, field);
    if (
      !this.filters.some((e, index) => {
        if (e.fieldName === field) {
          if (filters.length) {
            e.filteringOperands = this.setFiltersOperands(filters, field);
          } else {
            this.filters.splice(index, 1);
          }
          return true;
        }
      })
    ) {
      this.filters.push({ fieldName: field, filteringOperands: this.setFiltersOperands(filters, field) });
    }
    this.setConfigByDropdownMode(filters, field, filterType);
    this.filtersChange$.next();
  }

  setConfigByDropdownMode(filters: string[] | number[], field: string, filterType: DropdownListMode = 'default') {
    if (filterType === 'default') {
      return;
    }
    const index = this.booleanFilters.findIndex((r) => r === field);
    if (index >= 0) {
      this.booleanFilters.splice(index, 1);
    }
    if (filters.length) {
      this.booleanFilters.push(field);
    }
  }

  /**
   * Установка сортировки
   * @param sortingExpressions
   */
  setSortingColumn(sortingExpressions: ISortingExpression) {
    this.typeSorting = this.SORTING_TYPES[sortingExpressions.dir];
    if (!sortingExpressions.dir) {
      this.activeSorting = null;
      this.sortingColumn = null;
      return;
    }
    this.activeSorting = sortingExpressions.fieldName;
    this.sortingColumn = sortingExpressions;
  }
  /**
   * Обновление параметров пагинатора
   * @param totalCount
   */
  setTotalCountPaginator(totalCount: number) {
    if (this.tableConfig && this.tableConfig.paginator) {
      this.tableConfig.paginatorCfg.refresh({ totalCount });
    }
  }

  /**
   * Сравнение контрольной суммы LocalStorage и SessionStorage
   * @param config
   * @param url
   */
  checkSumComparison(config, url): boolean {
    const checkSumSession = JSON.parse(window.sessionStorage.getItem('checkSum' + url));
    const checkSumLocal = window.localStorage.getItem('wbTable' + url)
      ? JSON.parse(window.localStorage.getItem('wbTable' + url)).checkSum
      : true;
    if ((!!checkSumSession && !!checkSumLocal && checkSumLocal !== checkSumSession) || !checkSumLocal) {
      window.localStorage.removeItem('wbTable' + url);
      const savedCfg = { checkSum: this.calcCheckSum(config) };
      window.localStorage.setItem('wbTable' + url, JSON.stringify(savedCfg));
      return false;
    }
    return true;
  }
  /**
   * Проверка на наличие и запись значения контрольной суммы session storage
   * @param config
   * @param url
   */
  setCheckSumStorage(config, url) {
    const key = 'checkSum' + url;
    const savedCfg = window.sessionStorage.getItem(key);
    if (!savedCfg) {
      window.sessionStorage.setItem(key, '' + this.calcCheckSum(config));
    }
  }
  /**
   * Проверка на наличие и запись значения контрольной суммы local storage
   * @param config
   * @param url
   */
  setCheckSumLocalStorage(config, url) {
    const key = 'wbTable' + url;
    let savedCfg;
    if (!window.localStorage.getItem(key)) {
      savedCfg = { checkSum: this.calcCheckSum(config) };
      window.localStorage.setItem(key, JSON.stringify(savedCfg));
    } else if (JSON.parse(window.localStorage.getItem(key)).checkSum === null) {
      savedCfg = JSON.parse(window.localStorage.getItem(key));
      savedCfg['checkSum'] = this.calcCheckSum(config);
      window.localStorage.setItem(key, JSON.stringify(savedCfg));
    } else if (JSON.parse(window.localStorage.getItem(key)).checkSum === undefined) {
      window.localStorage.removeItem(key);
      savedCfg = { checkSum: this.calcCheckSum(config) };
      window.localStorage.setItem(key, JSON.stringify(savedCfg));
    }
  }

  /**
   * Подсчет контрольной суммы
   * @param config
   */
  calcCheckSum(config) {
    return string2Bin(JSON.stringify(config));
  }

  /**
   * Сохранение шаблонов таблиц
   * @param cfg
   */
  saveCustomTemplate(cfg: ITemplateInfo) {
    return this.igxApi.saveTemplate(cfg);
  }

  /**
   * Получение шаблонов для соответсу=вующей таблицы
   * @param typeTemplate
   */
  getCustomTemplate(typeTemplate) {
    return this.igxApi.getTemplatesDataByType(typeTemplate);
  }

  /**
   * Удаление таблиц по id
   * @param idTemplate
   */
  deleteCustomTemplate(idTemplate: string) {
    return this.igxApi.deleteTemplateById({ idTemplate });
  }
}

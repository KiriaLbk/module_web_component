import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { TableWrapperService } from '../components/table/table.service';
import { IAdvancedFilter, MAdvancedFilter } from './advancedFilter.model';
import { LanguageService } from '../../../services/language-service/language.service';
import { FiltersField } from '../adapters/table-adapter/FilterField';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IFilterWrapper, InitialFilters } from '../components/table/models/initialFilters';

export interface PropertySelectFormat {
  field: string;
  name: string;
  dataType: string;
}

@Injectable()
export class AdvancedFilterService implements OnDestroy {
  advancedFilters: IAdvancedFilter[] = [];
  propertyOptions: PropertySelectFormat[] = [];
  destroy$ = new Subject();
  alreadyAddedFilters: string[] = [];
  newFilters: PropertySelectFormat[] = [];

  constructor(private lang: LanguageService, public table: TableWrapperService) {
    this.startSubscribers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Добавление фильтра
   */
  addFilter(cfg?: IAdvancedFilter) {
    this.advancedFilters.push(new MAdvancedFilter(cfg));
    if (cfg && cfg.field !== '') {
      if (this.alreadyAddedFilters.every((el) => el !== cfg.field)) this.alreadyAddedFilters.push(cfg.field);
      this.setNewFilters();
    }
  }
  /**
   * Добавление или обновление filter в
   * advancedFilters в зависимости от того есть или нет filter
   * @param filter
   */
  addOrUpdateFilter(filter: IAdvancedFilter) {
    const filterModel = this.getFilterByField(filter.field);
    if (filterModel) {
      filterModel.changeValue(filter.value);
    } else {
      this.addFilter(filter);
    }
  }
  /**
   * Удаление фильтра
   * @param index
   */
  deleteFilter(index: number, filter?) {
    this.alreadyAddedFilters.forEach((el, i) => {
      if (el === filter.field) {
        this.alreadyAddedFilters.splice(i, 1);
      }
    });
    this.setNewFilters();
    this.advancedFilters.splice(index, 1);
    if (this.advancedFilters.length === 0) {
      this.newFilters = [...this.propertyOptions];
    }
  }
  /**
   * Удаление всей структуры расширенных фильтров
   */
  deleteAllFilter() {
    this.advancedFilters = [];
    this.alreadyAddedFilters = [];
    this.newFilters = [...this.propertyOptions];
  }
  /**
   * Проверка на наличие filter
   * в advancedFilters по field
   * @param filter
   */
  getFilterByField(field: string): MAdvancedFilter {
    let filter = null;
    this.advancedFilters.some((r) => {
      if (r.field === field) {
        filter = r;
        return true;
      }
    });
    return filter;
  }
  /**
   * Приведение к рабочему формату
   * входного массива объектов для
   * первых селектов отвечающего за столбец
   * фильтрации
   * @param data
   */
  getDataForNameSelect(data: FiltersField[]): PropertySelectFormat[] {
    return data.reduce((acc, el) => {
      if (!el.filterable) return acc;
      if (el.childs.length) return (acc = [...acc, ...this.getDataForNameSelect(el.childs)]);
      acc.push({
        field: el.field,
        name: this.table.tableConfig.gridConfig.multiLanguage ? (this.lang.word[el.name] as string) : el.name,
        dataType: el.dataType,
      });
      return acc;
    }, []) as PropertySelectFormat[];
  }
  /**
   * Преобразование формата
   * из массива объектов object[]
   * в массив значение string[] | number[]
   * @param value
   */
  getFormatValueForModel(value: object[]) {
    return value.reduce((acc: string[] | number[], el: object) => {
      const vals = Object.values(el);
      return (acc = [...acc, ...vals]);
    }, []);
  }
  /**
   *  Получение массива фильтров из localStorage
   */
  getFromLocalStorage(): IAdvancedFilter[] | null {
    return null;
  }
  /**
   * Получения названия столбца name по field
   * @param field
   */
  getNameByField(field: string): string {
    let name = null;
    this.propertyOptions.some((r) => {
      if (r.field === field) {
        name = r.name;
        return true;
      }
    });
    return name;
  }
  /**
   * Инициализация фильтров из tableWrapper.service
   * @param filters
   */
  initFilters(filters?: IFilterWrapper[]) {
    filters = this.table.filters.length ? this.table.filters : filters ? filters : [new InitialFilters()];
    /**
     * Использовать пока в цикле гиже используется функция addFilter
     * а не addOrUpdateFilter
     */
    this.deleteAllFilter();
    filters.forEach(
      (el) => this.addFilter(this.wrapperFilterToAdvanced(el))
      /**
       * Пока не используется из за наложения фильтров
       * каждый из фильтров просто обновляет состояние другого.
       * Тоесть при изменении фильтров через таблицу, срабатывает эта функция и все расширенные фильтры
       * заменяются фильтрами из таблицы.
       * Тоже самое работает и вобратную сторону
       */
      // this.addOrUpdateFilter(this.wrapperFilterToAdvanced(el))
    );
  }
  /**
   * Очистка значений всех фильтров
   */
  resetFilters() {
    this.advancedFilters.forEach((r) => (r.value = []));
  }
  /**
   * Устанвока значения value в модели filter
   * @param value
   * @param filter
   */
  setFilterValue(value: string[], filter: IAdvancedFilter) {
    // const newFormat = this.getFormatValueForModel(value) as string[] | number[];
    filter.changeValue(value);
  }
  /**
   *  Запуск фильтрации таблицы
   */
  setFilteringConfig() {
    this.table.mergeAllFilters(this.advancedFilters);
  }
  /**
   * Обновление значений field и name в модели filter
   * @param event
   * @param filter
   */
  setMainInfo(event: PropertySelectFormat, filter: IAdvancedFilter) {
    filter.changeField(event.field);
    filter.changeName(event.name);
    filter.changeDataType(event.dataType);
    this.alreadyAddedFilters.push(event.field);
    this.setNewFilters();
  }

  /** получение значений для селекта столбцов, исключая уже выбранные */
  setNewFilters() {
    this.newFilters = this.propertyOptions.filter((el) => {
      return this.alreadyAddedFilters.every((prop) => el.field !== prop);
    });
  }

  /**
   * Слушатели на изменение конфига в
   * tableWrapperService и
   * на изменение фильтров
   */
  startSubscribers() {
    this.table.init$.pipe(takeUntil(this.destroy$)).subscribe((r) => {
      this.propertyOptions = this.getDataForNameSelect(this.table.tableConfig.filtersFields);
      this.newFilters = [...this.propertyOptions];
    });

    this.table.filtersChange$.pipe(takeUntil(this.destroy$)).subscribe((r) => {
      this.initFilters();
    });
  }
  /**
   * Изменение модели из IFilterWrapper в MAdvancedFilter
   * @param filter
   */
  wrapperFilterToAdvanced(filter: IFilterWrapper): MAdvancedFilter {
    return new MAdvancedFilter({
      field: filter.fieldName,
      name: this.getNameByField(filter.fieldName),
      value: filter.filteringOperands.map((r) => r.searchVal),
    });
  }
}

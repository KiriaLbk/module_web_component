import { TestBed } from '@angular/core/testing';
import { AdvancedFilterService } from './advanced-filter.service';
import { TableWrapperService } from '../components/table/table.service';
import { FilterField } from '../adapters/table-adapter/FilterField';
import { MAdvancedFilter } from './advancedFilter.model';
import { TableConfig } from '../components/table/models/TableConfig';
import { IFilterWrapper, InitialFilters } from '../components/table/models/initialFilters';
import { OrgApiService } from '../../pages/org/org-api.service';

describe('AdvancedFilterService Расширенный фильтр в модуле таблиц', () => {
  const wrapperMock = new TableWrapperService(
    jasmine.createSpyObj('IgxApiService', {
      get: () => {},
    })
  );
  wrapperMock.tableConfig = new TableConfig();

  const advancedMock = new AdvancedFilterService(jasmine.createSpyObj('LanguageService', ['word']), wrapperMock);

  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: AdvancedFilterService, useValue: advancedMock }],
    })
  );

  it('should be created', () => {
    const service: AdvancedFilterService = TestBed.get(AdvancedFilterService);
    expect(service).toBeTruthy();
  });

  it('#getDataForNameSelect возвращает формат данных для селекта со столбцами', () => {
    expect(advancedMock.getDataForNameSelect([new FilterField({}), new FilterField({})])).toEqual([
      { field: '', name: '', dataType: 'string' },
      { field: '', name: '', dataType: 'string' },
    ]);
  });

  it('#addFilter Добавления строки в расширенный фильтр', () => {
    const length = advancedMock.advancedFilters.length;
    advancedMock.addFilter();
    expect(advancedMock.advancedFilters.length).toBe(length + 1);
    expect(advancedMock.advancedFilters[advancedMock.advancedFilters.length - 1]).toEqual(new MAdvancedFilter());
  });

  it('#deleteFitler Удаление строки по index', () => {
    advancedMock.advancedFilters = [
      new MAdvancedFilter(),
      new MAdvancedFilter({ field: '1', name: '2' }),
      new MAdvancedFilter(),
    ];
    advancedMock.deleteFilter(1, new MAdvancedFilter());
    expect(advancedMock.advancedFilters.some((r) => r.field === '1')).toBeFalsy();
    const length = advancedMock.advancedFilters.length;
    advancedMock.deleteFilter(advancedMock.advancedFilters.length - 1, new MAdvancedFilter());
    expect(advancedMock.advancedFilters.length).toBe(length - 1);
  });

  it('#setMainInfo Установка field и name для модели filter', () => {
    advancedMock.advancedFilters = [new MAdvancedFilter()];
    const filterModel = advancedMock.advancedFilters[0];
    const testData = new MAdvancedFilter({ field: 'test_field', name: 'test_name' });
    advancedMock.setMainInfo(testData, filterModel);
    expect(advancedMock.advancedFilters[0]).toEqual(new MAdvancedFilter(testData));
  });

  it('#getFormatValueForModel Изменения входного формата данных value для модели', () => {
    expect(advancedMock.getFormatValueForModel([{ a: 1 }, { b: 2 }])).toEqual([1, 2]);
  });

  it('#setMainInfo проверка обновления значения value в модели', () => {
    advancedMock.advancedFilters = [new MAdvancedFilter()];
    const filterModel = advancedMock.advancedFilters[0];
    const setData = ['1', '2'];
    advancedMock.setFilterValue(setData, filterModel);
    expect(advancedMock.advancedFilters[0].value.length).toBe(2);
    expect(advancedMock.advancedFilters[0].value[0]).toBe('1');
  });

  it('#deleteAllFilter удаление всех фильтров', () => {
    advancedMock.advancedFilters = [new MAdvancedFilter(), new MAdvancedFilter(), new MAdvancedFilter()];
    advancedMock.deleteAllFilter();
    expect(advancedMock.advancedFilters.length).toBe(0);
  });

  it('#resetFilters сброс всех фильтров', () => {
    advancedMock.advancedFilters = [new MAdvancedFilter({ value: [1, 2] }), new MAdvancedFilter({ value: [2, 3] })];
    advancedMock.resetFilters();
    expect(advancedMock.advancedFilters.every((r) => r.value.length === 0)).toBeTruthy();
  });

  it('#wrapperFilterToAdvanced Перевод модели фильтра из wrapper сервиса в ModelAdvanced', () => {
    const filter: IFilterWrapper = {
      fieldName: 'TEST12',
      filteringOperands: [
        { searchVal: '1', fieldName: 'TEST12' },
        { searchVal: '2', fieldName: 'TEST12' },
      ],
    };
    expect(advancedMock.wrapperFilterToAdvanced(filter)).toEqual(
      new MAdvancedFilter({ field: 'TEST12', name: null, value: ['1', '2'] })
    );
  });

  it('#getNameByField Получение name по field из propertyOptions', () => {
    advancedMock.propertyOptions = [
      new MAdvancedFilter({ field: 'TEST', name: 'Тест' }),
      new MAdvancedFilter({ field: '1', name: '2' }),
    ];
    expect(advancedMock.getNameByField('TEST')).toBe('Тест');
  });

  it('#checkFilterByField Проверка на наличие advancedFilters по field', () => {
    advancedMock.advancedFilters = [new MAdvancedFilter({ field: 's', name: 't' })];
    expect(advancedMock.getFilterByField('s')).toBeTruthy();
    expect(advancedMock.getFilterByField('as')).toBeFalsy();
  });

  it('#addOrUpdateFilter Обновление или добавление filter в advancedFilters', () => {
    advancedMock.advancedFilters = [
      new MAdvancedFilter({ field: 'RT', name: 'РТ' }),
      new MAdvancedFilter({ field: 'VT', name: 'ВК' }),
    ];
    advancedMock.addOrUpdateFilter(new MAdvancedFilter({ field: 'RT', name: '', value: [1, 2] }));
    expect(advancedMock.getFilterByField('RT')).toEqual(
      new MAdvancedFilter({ field: 'RT', name: 'РТ', value: [1, 2] })
    );
    const other = new MAdvancedFilter({ field: 'WHAT', name: 'ЧТО', value: [1, 3, 4] });
    advancedMock.addOrUpdateFilter(other);
    expect(advancedMock.advancedFilters[advancedMock.advancedFilters.length - 1]).toEqual(other);
  });

  it('#initFilters Инициализация с учетом фильтров (filters) из tableWrapper.service', () => {
    const filtersWrapper: IFilterWrapper[] = [
      { fieldName: 'R1', filteringOperands: [{ searchVal: 2, fieldName: 'R1' }] },
      { fieldName: 'R2', filteringOperands: [{ searchVal: 3, fieldName: 'R2' }] },
    ];
    advancedMock.initFilters(filtersWrapper);
    expect(advancedMock.advancedFilters).toEqual([
      new MAdvancedFilter({ field: 'R1', name: null, value: [2] }),
      new MAdvancedFilter({ field: 'R2', name: null, value: [3] }),
    ]);
    advancedMock.table.filters = [new InitialFilters({ fieldName: '', filteringOperands: [] })];
    advancedMock.initFilters();
    expect(advancedMock.advancedFilters[0]).toEqual(new MAdvancedFilter({ name: null }));
    advancedMock.table.filters = [];
    advancedMock.initFilters();
    expect(advancedMock.advancedFilters[0]).toEqual(new MAdvancedFilter({ name: null }));
  });
});

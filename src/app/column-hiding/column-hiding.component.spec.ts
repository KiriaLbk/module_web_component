import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnHidingComponent } from './column-hiding.component';
import { WbTranslatePipe } from '../../../pipes/wb-translate.pipe';
import { LanguageService } from '../../../services/language-service/language.service';
import { ChangeDetectorRef, ComponentRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { GridBaseAPIService, IgxColumnComponent } from 'igniteui-angular';
import { MultilanguageFilteringStrategy } from './multilanguage-strategies/multilanguage-filtering-strategy';
import { DefaultFilteringStrategy } from './multilanguage-strategies/default-filtering-strategy';
import { ColumnHidingCfg, ColumnHidingCfgModel } from './column-hiding-cfg.model';

export interface TestColumnHidingCfg extends ColumnHidingCfg {
  columns: any[];
}
export class TestColumnHidingCfgModel extends ColumnHidingCfgModel implements TestColumnHidingCfg {
  title = '';
  columnsAreaMaxHeight = '';
  columns = [];
  showAllText = 'Show all';
  hideAllText = 'Hide all';
  filterColumnsPrompt = 'Search column';
  disableFilter = false;
  disableShowAll = false;
  disableHideAll = false;
  multiLanguage = false;

  constructor(cfg = {}) {
    super();
    Object.keys(cfg).forEach((prop) => {
      if (this.hasOwnProperty(prop)) {
        this[prop] = cfg[prop];
      }
    });
  }
}

describe('ColumnHidingComponent', () => {
  let component: ColumnHidingComponent;
  let fixture: ComponentFixture<ColumnHidingComponent>;
  const columnArr = [
    {
      field: 'uniqueIndex',
      header: 'П/П',
      hidden: false,
      disableHiding: false,
    },
    {
      field: 'problems',
      header: 'CONTROL',
      hidden: false,
      disableHiding: false,
    },
    {
      field: 'name',
      header: 'NAME_AND_PARAMETRS_PIPELINE',
      hidden: false,
      disableHiding: false,
    },
    {
      field: 'pipelineType',
      header: 'Ag / Ug',
      hidden: false,
      disableHiding: false,
    },
    {
      field: 'subContractor',
      header: 'TITLE_CONTRACTOR',
      hidden: false,
      disableHiding: false,
    },
    {
      field: 'inspection',
      header: 'RADIOGRAPHIC_INSPECTION_ULTRASONIC',
      hidden: false,
      disableHiding: false,
    },
  ];
  const cfg: TestColumnHidingCfg = new ColumnHidingCfgModel({
    columns: columnArr,
    filterColumnsPrompt: 'COLUMN_SEARCH',
    multiLanguage: true,
  });

  const mockLangService = {
    dictionary: {
      EN: {
        NO: 'П/П',
        CONTROL: 'CONTROL',
        NAME_AND_PARAMETRS_PIPELINE: 'NAME_AND_PARAMETRS_PIPELINE',
        AG: 'Ag / Ug',
        TITLE_CONTRACTOR: 'TITLE_CONTRACTOR',
        RADIOGRAPHIC_INSPECTION_ULTRASONIC: 'RADIOGRAPHIC_INSPECTION_ULTRASONIC',
      },
      RU: {
        NO: 'П/П',
        CONTROL: 'Контроль',
        NAME_AND_PARAMETRS_PIPELINE: 'Наименования и парметры',
        AG: 'Ag / Ug',
        TITLE_CONTRACTOR: 'Подрядчик',
        RADIOGRAPHIC_INSPECTION_ULTRASONIC: 'Радиографический контроль',
      },
    },
    language: 'RU',
    word: {
      HIDE: '',
      SHOW: '',
      COLUMN_SEARCH: '',
      ALL: '',
    },
    getDictionaryKeys: (word: string) => {
      return Object.keys(mockLangService.dictionary[mockLangService.language]).filter((el) =>
        mockLangService.dictionary[mockLangService.language][el].toLowerCase().includes(word.toLowerCase())
      );
    },
    change$: new Subject(),
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ColumnHidingComponent, WbTranslatePipe],
      providers: [[{ provide: LanguageService, useValue: mockLangService }, ChangeDetectorRef]],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    TestBed.overrideProvider(LanguageService, { useValue: mockLangService });
    fixture = TestBed.createComponent(ColumnHidingComponent);
    component = fixture.componentInstance;
    component.cfg = cfg;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Инициализация соответсвующей стратегии по флагу', () => {
    component.cfg.multiLanguage = true;
    expect(component.getMultiLanguageStrategy()).toEqual(new MultilanguageFilteringStrategy(component));
    component.cfg.multiLanguage = false;
    expect(component.getMultiLanguageStrategy()).toEqual(new DefaultFilteringStrategy(component));
  });

  it('Фильтрация с учетом многоязычности', () => {
    component.cfg.multiLanguage = true;
    component.setMultiLanguageStrategy();
    component.createColumnItems();
    component.filterCriteria = 'контроль';
    const filteredColumns = [
      {
        field: 'problems',
        header: 'CONTROL',
        hidden: false,
        disableHiding: false,
      },
      {
        field: 'inspection',
        header: 'RADIOGRAPHIC_INSPECTION_ULTRASONIC',
        hidden: false,
        disableHiding: false,
      },
    ];

    component.filteringColumns();
    expect(component.hidableColumns).toEqual(filteredColumns);
  });
  it('Фильтрация по умолчанию', () => {
    component.cfg.multiLanguage = false;
    component.setMultiLanguageStrategy();
    component.createColumnItems();
    component.filterCriteria = 'cont';
    const filteredColumns = [
      {
        field: 'problems',
        header: 'CONTROL',
        hidden: false,
        disableHiding: false,
      },
      {
        field: 'subContractor',
        header: 'TITLE_CONTRACTOR',
        hidden: false,
        disableHiding: false,
      },
    ];
    component.filteringColumns();
    expect(component.hidableColumns).toEqual(filteredColumns);
  });
});

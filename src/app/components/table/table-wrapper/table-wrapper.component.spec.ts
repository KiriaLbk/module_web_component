import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { TableWrapperComponent } from './table-wrapper.component';
import {
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  Injector,
  NO_ERRORS_SCHEMA,
  ViewContainerRef,
} from '@angular/core';
import { WbTranslatePipe } from '../../../../../pipes/wb-translate.pipe';
import { IgxTooltipDirective, ɵfa as IgxDecimalPipeComponent, ɵez as IgxDatePipeComponent } from 'igniteui-angular';
import { MatDialog } from '@angular/material';
import { TableConfig } from '../models/TableConfig';
import { TableWrapperService } from '../table.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LanguageService } from '../../../../../services/language-service/language.service';
import { Observable, Subject } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LocalFilterStrategy } from './strategies/local-filter-strategy';
import { PaginatorCfg } from '../models/PaginatorCfg';
import { RequestFilterStrategy } from './strategies/request-filter-strategy';
import { ColumnHidingComponent } from '../../../column-hiding/column-hiding.component';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { By } from '@angular/platform-browser';

describe('TableWrapperComponent', () => {
  let component: TableWrapperComponent;
  let fixture: ComponentFixture<TableWrapperComponent>;

  const data = [
    {
      weldId: 1,
      spoolId: 's1',
      joinType: 'aaa',
      joinNumber: 4444,
    },
    {
      weldId: 2,
      spoolId: 's2',
      joinType: 'aaa',
      joinNumber: 4444555,
    },
    {
      weldId: 3,
      spoolId: 's1',
      joinType: 'aaa',
      joinNumber: 4433344,
    },
    {
      weldId: 4,
      spoolId: 's1',
      joinType: 'aaa',
      joinNumber: 4444,
    },
  ];
  const filteredData = [
    {
      weldId: 1,
      spoolId: 's1',
      joinType: 'aaa',
      joinNumber: 4444,
    },
    {
      weldId: 4,
      spoolId: 's1',
      joinType: 'aaa',
      joinNumber: 4444,
    },
  ];
  const uniqueValue = {
    weldId: [1, 2, 3, 4],
    spoolId: ['s1', 's2'],
    joinType: ['aaa'],
    joinNumber: [4444, 4444555, 4433344],
  };

  const startData = JSON.parse(JSON.stringify(data));

  @Component({ selector: 'igx-toast', template: '' })
  class IgxToastComponent {
    show() {}

    hide() {}
  }

  @Component({ selector: 'igx-grid', template: '' })
  class IgxGridComponent {
    columns = [];
  }

  const tableMock = {
    tableConfig: new TableConfig(),
    filters: [],
    activeFilters: [],
    changeFilterFlag$: new Subject(),
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        TableWrapperComponent,
        WbTranslatePipe,
        IgxTooltipDirective,
        IgxToastComponent,
        IgxGridComponent,
        ColumnHidingComponent,
        IgxDecimalPipeComponent,
        IgxDatePipeComponent,
      ],
      imports: [BrowserAnimationsModule],
      providers: [
        { provide: MatDialog, useValue: {} },
        { provide: Router, useValue: {} },
        { provide: LanguageService, useValue: { change$: new Subject(), word: {} } },
        { provide: ViewContainerRef, useValue: {} },
        { provide: Injector, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
        { provide: TableWrapperService, useValue: tableMock },
        ChangeDetectorRef,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [ColumnHidingComponent],
      },
    });

    TestBed.compileComponents();
  }));

  beforeEach(() => {
    TestBed.overrideProvider(TableWrapperService, { useValue: tableMock });
    fixture = TestBed.createComponent(TableWrapperComponent);
    component = fixture.componentInstance;
    component.config = new TableConfig();
    fixture.debugElement.injector.get(ComponentFactoryResolver);

    component.config.gridConfig.localFilter = true;
    component.setStrategy(component.getActualStrategy());
    component.startData = startData;
    component.data = data;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('При включенной локальной фильтрации выбирать стратегию, работающую с локальными данными', () => {
    expect(component.getActualStrategy()).toEqual(new LocalFilterStrategy(component));
  });

  Object.keys(uniqueValue).forEach((field) => {
    it(`Получение уникальных значений для поля ${field} при локальной фильтрации`, () => {
      component.getDataForWindow({ columns: field }).subscribe((res) => expect(res).toEqual(uniqueValue[field]));
    });
  });

  it('Фильтрация локальных данных, полученных при первом запросе', () => {
    component.table.filters = [
      {
        fieldName: 'spoolId',
        filteringOperands: [
          { searchVal: 's1', fieldName: 'spoolId' },
          { searchVal: 's2', fieldName: 'spoolId' },
        ],
      },
      {
        fieldName: 'joinNumber',
        filteringOperands: [{ searchVal: 4444, fieldName: 'joinNumber' }],
      },
    ];
    component.grid.sortingExpressions = [];
    component.table.tableConfig.paginatorCfg = new PaginatorCfg();
    component.dispatchCfg();
    expect(component.data).toEqual(filteredData);
  });

  it('При выключенной локальной фильтрации выбирать стратегию с отправлением запросов', () => {
    component.config.gridConfig.localFilter = false;
    component.setStrategy(component.getActualStrategy());
    expect(component.getActualStrategy()).toEqual(new RequestFilterStrategy(component));
  });

  Object.keys(uniqueValue).forEach((field) => {
    it(`Получение уникальных значений для поля ${field} по отправленному запросу`, () => {
      component.config.gridConfig.localFilter = false;
      component.setStrategy(component.getActualStrategy());
      component.getDataForWindow = () => {
        return new Observable((subscriber) => {
          switch (field) {
            case 'weldId':
              subscriber.next([1, 2, 3, 4]);
              break;
            case 'spoolId':
              subscriber.next(['s1', 's2']);
              break;
            case 'joinType':
              subscriber.next(['aaa']);
              break;
            case 'joinNumber':
              subscriber.next([4444, 4444555, 4433344]);
              break;
          }
        });
      };
      component.getDataForWindow({ columns: field }).subscribe((res) => expect(res).toEqual(uniqueValue[field]));
    });
  });

  it('При выключенной локальной фильтрации получать отфильтрованные данные по запросу', fakeAsync(() => {
    component.config.gridConfig.localFilter = false;
    component.setStrategy(component.getActualStrategy());
    component.dispatchCfg = () => {
      setTimeout(() => {
        component.data = [
          {
            weldId: 1,
            spoolId: 's1',
            joinType: 'aaa',
            joinNumber: 4444,
          },
          {
            weldId: 4,
            spoolId: 's1',
            joinType: 'aaa',
            joinNumber: 4444,
          },
        ];
      }, 100);
    };
    component.dispatchCfg();
    tick(100);
    expect(component.data).toEqual(filteredData);
  }));

  it('Определение функции получения уникальных значений из стратегии с запросами', () => {
    component.config.gridConfig.localFilter = false;
    component.setStrategy(component.getActualStrategy());
    const strategy = new RequestFilterStrategy(component);
    expect(strategy.getDataForWindow.toString()).toEqual(component.strategy.getDataForWindow.toString());
  });

  it('Определение функции с запросом на отфильтрованные данные из стратегии с запросами', () => {
    component.config.gridConfig.localFilter = false;
    component.setStrategy(component.getActualStrategy());
    const strategy = new RequestFilterStrategy(component);
    expect(strategy.dispatchCfg.toString()).toEqual(component.strategy.dispatchCfg.toString());
  });

  it('Вызов функции создания компонента скрытия столбцов по клику на иконку', async(() => {
    spyOn(component, 'chooseColumnHiding');
    const button = fixture.debugElement.nativeElement.querySelector('div.visible');
    button.click();
    fixture.whenStable().then(() => {
      expect(component.chooseColumnHiding).toHaveBeenCalled();
    });
  }));

  it('Создание компонента скрытия столбцов по клику', async () => {
    component.columnHiding = true;
    const button = fixture.debugElement.nativeElement.querySelector('div.visible');
    button.click();
    fixture.whenStable().then((r) => {
      fixture.detectChanges();
      const columnHidingComponent = fixture.debugElement.nativeElement.querySelector('app-column-hiding');
      expect(columnHidingComponent).toBeTruthy();
    });
  });

  it('Уничтожение компонента скрытия столбцов по клику  свободной области', async () => {
    component.columnHiding = true;
    fixture.debugElement.triggerEventHandler('mousedown', document);
    fixture.whenStable().then((r) => {
      fixture.detectChanges();
      const columnHidingComponent = fixture.debugElement.nativeElement.querySelector('app-column-hiding');
      expect(columnHidingComponent).toBe(null);
    });
  });

  it('Отстуствие кнопки с кликом для создания компонента при соответсвуещем флаге', () => {
    fixture.componentInstance.config.gridConfig.columnHiding = false;
    component.cdr.markForCheck();
    fixture.detectChanges();
    const el = fixture.debugElement.query(By.css('.visible'));
    expect(el).toBeNull();
  });
});

import { async, ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { AdvancedFiltersComponent, AdvancedInputCfg } from './advanced-filter.component';
import { WbSelectComponent } from '../../shared/wb-select/wb-select.component';
import { ChangeDetectorRef, Component, Inject, NO_ERRORS_SCHEMA } from '@angular/core';
import { AdvancedFilterService } from './advanced-filter.service';
import { LanguageService } from '../../../services/language-service/language.service';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TableWrapperService } from '../components/table/table.service';

describe('AdvancedFilter Расширенный фильтр', () => {
  let component: AdvancedFiltersComponent;
  let fixture: ComponentFixture<AdvancedFiltersComponent>;
  const modelData: AdvancedInputCfg = {
    parent: {
      advancedComponent: null,
      dispatchCfg: () => {},
      allowAdvancedClick: () => {},
      nextChangeFilterFlag: () => Observable,
      getDataForWindow: (cfg) => Observable,
    },
  };

  const advanced = {
    alreadyAddedFilters: [],
    initFilters: () => {},
    getDataForNameSelect: () => [
      { field: '', name: '' },
      { field: '1', name: '2' },
    ],
  };

  const wrap = {
    filters: [],
    filtersChange$: new Subject(),
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AdvancedFiltersComponent, WbSelectComponent],
      imports: [BrowserAnimationsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: AdvancedFilterService, useValue: advanced },
        { provide: LanguageService, useValue: jasmine.createSpyObj('LanguageService', ['word']) },
        { provide: TableWrapperService, useValue: wrap },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvancedFiltersComponent);
    component = fixture.componentInstance;
    component.availableOptions = [];
    component.data = modelData;
    component.getOptions = () => {};
    fixture.detectChanges();
  });

  it('click add filter button', () => {
    spyOn(component, 'addNewFilter');
    const addBut = fixture.nativeElement.querySelector('.add_button');
    addBut.click();
    expect(component.addNewFilter).toHaveBeenCalled();
  });

  it('click clear all filter button', () => {
    spyOn(component, 'resetFilters');
    const removeBut = fixture.nativeElement.querySelector('.reset');
    removeBut.click();
    expect(component.resetFilters).toHaveBeenCalled();
  });
});

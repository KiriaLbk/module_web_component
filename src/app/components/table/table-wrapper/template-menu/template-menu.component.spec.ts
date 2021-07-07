import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateMenuComponent } from './template-menu.component';
import { ITemplateInfo, TableWrapperService } from '../../table.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatMenuModule } from '@angular/material';
import { of } from 'rxjs/internal/observable/of';
import { MatDialog } from '@angular/material/dialog';
import { SnackbarService } from '../../../../../shared/snackbar/snackbar.service';

describe('TemplateMenuComponent', () => {
  let component: TemplateMenuComponent;
  let fixture: ComponentFixture<TemplateMenuComponent>;

  const customTemplate = {
    wjMainCustomTemplate: [
      {
        id: 1,
        field: 'dGVzdA==',
        name: 'test',
        filterFields: [
          {
            field: 'problems',
            name: 'CONTROL',
          },
          {
            name: 'CHARACTERISTICS_ABUTTING_ELEMENTS',
            childs: [
              {
                field: 'memberOneClass',
                name: 'MATERIAL_CLASS_1',
              },
              {
                field: 'memberOneDescription',
                name: 'MATERIAL_1',
              },
            ],
          },
        ],
        custom: true,
      },
    ],
  };
  const wrapperServiceMock = {
    saveCustomTemplate: () => {},
    getColumnsByTemplateField: () => {},
    getCustomTemplate: (typeTemplate) => {
      return customTemplate[typeTemplate] ? of(customTemplate[typeTemplate]) : of(null);
    },
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TemplateMenuComponent],
      providers: [
        { provide: TableWrapperService, useValue: wrapperServiceMock },
        { provide: MatDialog, useValue: {} },
        { provide: SnackbarService, useValue: {} },
      ],
      imports: [MatMenuModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateMenuComponent);
    component = fixture.componentInstance;
    component.config = {
      templatesTable: [
        {
          id: 0,
          field: 'inspectors',
          name: 'forInspectors',
          filterFields: [
            {
              field: 'problems',
              name: 'CONTROL',
            },
          ],
          custom: false,
        },
      ],
      filtersFields: [],
      gridConfig: {
        templateAdding: true,
      },
    };
    component.getTemplate = () => {
      if (!component.config.templatesTable.some((el) => el.custom))
        component.table.getCustomTemplate(component.state.currentUrl).subscribe((res) => {
          component.config.templatesTable = [...component.config.templatesTable, ...(res as any)];
        });
    };
    component.deleteTemplate = (event, field: string) => {
      component.config.templatesTable.some((el, index) => {
        if (el.field === field && el.custom) {
          component.table.deleteCustomTemplate(el.id).subscribe((res) => {
            if (res.status) {
              component.config.templatesTable.splice(index, 1);
            }
          });
          return true;
        }
        return false;
      });
    };
    component.table.getCustomTemplate = (typeTemplate) => {
      return customTemplate[typeTemplate] ? of(customTemplate[typeTemplate]) : of(null);
    };
    component.table.saveCustomTemplate = (cfg) => {
      const flag1 = Object.keys(cfg).every((el) => {
        return cfg[el] !== undefined;
      });
      const flag2 =
        typeof cfg.nameTemplate === 'string' &&
        typeof cfg.dataTemplate === 'string' &&
        typeof cfg.accessibility === 'boolean' &&
        typeof cfg.typeTemplate === 'string';
      return flag1 && flag2 ? of({ status: true }) : of({ status: false, data: 2 });
    };
    component.table.deleteCustomTemplate = (id) => {
      const flag = customTemplate[component.state.currentUrl].some((el, index) => {
        if (el.id === id) {
          customTemplate[component.state.currentUrl].splice(index, 1);
          return true;
        }
        return false;
      });
      return flag ? of({ status: true, data: true }) : of({ status: false, data: false });
    };
    component.state = {
      getSavedTableTemplates: () => {},
      getColumnsForTemplate: () => {
        return [
          {
            field: 'problems',
            name: 'CONTROL',
          },
        ];
      },
      currentUrl: 'wjMainCustomTemplate',
    };
    component.currentTemplateNumber = '0';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('Получение шаблонов', () => {
    const mergeArrayTemplate = JSON.parse(JSON.stringify(customTemplate['wjMainCustomTemplate']));
    mergeArrayTemplate.unshift({
      id: 0,
      field: 'inspectors',
      name: 'forInspectors',
      filterFields: [
        {
          field: 'problems',
          name: 'CONTROL',
        },
      ],
      custom: false,
    });
    component.getTemplate();
    expect(component.config.templatesTable).toEqual(mergeArrayTemplate);
  });
  it('Сохранение шаблона', () => {
    const templateName = 'testTemplateName';
    let previewRequestFlag = false;
    const fields = component.state.getColumnsForTemplate();
    component.createTemplate = () => {
      const cfgTemplate: ITemplateInfo = {
        nameTemplate: templateName,
        dataTemplate: JSON.stringify(fields),
        accessibility: false,
        typeTemplate: component.state.currentUrl,
      };
      component.table.saveCustomTemplate(cfgTemplate).subscribe((res) => {
        previewRequestFlag = res.status;
        if (res.status) {
          const newTemplate = {
            id: res.data,
            field: window.btoa(encodeURIComponent(templateName)),
            name: templateName,
            filtersFields: fields,
            custom: true,
          };
          component.config.templatesTable.push(newTemplate);
        }
      });
    };
    component.createTemplate();
    expect(previewRequestFlag).toBe(true);
  });
  it('Удаление шаблона', () => {
    component.getTemplate();
    component.deleteTemplate('', 'dGVzdA==');
    expect(customTemplate).toEqual({ wjMainCustomTemplate: [] });
    expect(component.config.templatesTable).toEqual([
      {
        id: 0,
        field: 'inspectors',
        name: 'forInspectors',
        filterFields: [
          {
            field: 'problems',
            name: 'CONTROL',
          },
        ],
        custom: false,
      },
    ]);
  });
});

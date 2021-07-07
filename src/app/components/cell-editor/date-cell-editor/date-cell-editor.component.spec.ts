import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DateCellEditorComponent } from './date-cell-editor.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('DateCellEditorComponent', () => {
  let component: DateCellEditorComponent;
  let fixture: ComponentFixture<DateCellEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DateCellEditorComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DateCellEditorComponent);
    component = fixture.componentInstance;
    component.cell = {
      editValue: '',
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

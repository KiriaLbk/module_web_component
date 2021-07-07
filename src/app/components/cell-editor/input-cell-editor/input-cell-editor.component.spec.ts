import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InputCellEditorComponent } from './input-cell-editor.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('InputCellEditorComponent', () => {
  let component: InputCellEditorComponent;
  let fixture: ComponentFixture<InputCellEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [InputCellEditorComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputCellEditorComponent);
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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { GroupHeaderModeComponent } from './group-header-mode.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('GroupHeaderModeComponent', () => {
  let component: GroupHeaderModeComponent;
  let fixture: ComponentFixture<GroupHeaderModeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GroupHeaderModeComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupHeaderModeComponent);
    component = fixture.componentInstance;
    component.columns = [];
    component.groupsRecords = [];
    component.groupRow = {
      records: [],
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

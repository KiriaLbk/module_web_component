import {
  Component,
  OnInit,
  Input,
  ComponentRef,
  NgZone,
  ChangeDetectorRef,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { AdvancedFilterService, PropertySelectFormat } from './advanced-filter.service';
import { Observable } from 'rxjs';
import { IAdvancedFilter, MAdvancedFilter } from './advancedFilter.model';
import { state, style, trigger } from '@angular/animations';

export const changeAdvance = trigger('changeAdvance', [
  state(
    'open',
    style({
      transform: 'translateX(0px)',
    })
  ),
  state(
    'close',
    style({
      transform: 'translateX(520px)',
    })
  ),
]);

export interface AdvancedInputCfg {
  /**
   * Component в котором
   * есть функция вызова обновления таблицы
   * dispatchCfg
   */
  parent: {
    advancedComponent: ComponentRef<AdvancedFiltersComponent>;
    getDataForWindow(cfg): any;
    dispatchCfg(): void;
    allowAdvancedClick(): any;
    nextChangeFilterFlag(): any;
  };
}

@Component({
  selector: 'app-advanced-filter',
  templateUrl: './advanced-filter.component.html',
  styleUrls: ['./advanced-filter.component.scss'],
  animations: [changeAdvance],
})
export class AdvancedFiltersComponent implements OnInit {
  changeAdvance = 'open';
  availableOptions = [];

  @Input() data: AdvancedInputCfg;

  constructor(public advanced: AdvancedFilterService, private zone: NgZone) {}

  ngOnInit(): void {
    this.advanced.initFilters();
    this.getOptions();
  }

  addNewFilter() {
    this.advanced.addFilter();
    this.getOptions();
  }

  close() {
    this.changeAdvance = 'close';
    this.zone.runOutsideAngular(() => {
      setTimeout(() => {
        this.data.parent.advancedComponent.destroy();
        this.data.parent.allowAdvancedClick();
      }, 900);
    });
  }

  getOptions() {
    this.availableOptions = [...this.advanced.advancedFilters.filter((el) => !!el.field), ...this.advanced.newFilters];
  }

  deleteFilter(filter, index) {
    this.advanced.deleteFilter(index, filter);
    this.getOptions();
  }

  deleteAllFilter() {
    this.advanced.deleteAllFilter();
    this.getOptions();
  }

  filterStart() {
    this.advanced.setFilteringConfig();
    this.data.parent.dispatchCfg();
    this.data.parent.nextChangeFilterFlag();
  }

  getSelectValues(field: string) {
    return this.data.parent.getDataForWindow({ columns: field });
  }

  resetFilters() {
    this.advanced.resetFilters();
    this.advanced.setFilteringConfig();
    this.data.parent.dispatchCfg();
    this.data.parent.nextChangeFilterFlag();
  }

  setPropertyValue(event: PropertySelectFormat, filterModel: IAdvancedFilter) {
    this.advanced.setMainInfo(event, filterModel);
  }

  setSignificationValue(event: string[], model: IAdvancedFilter) {
    this.advanced.setFilterValue(event, model);
  }
}

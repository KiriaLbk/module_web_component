import { ComponentFactoryResolver, Injectable, ViewContainerRef } from '@angular/core';
import { FiltersField } from './FilterField';
import { Router } from '@angular/router';
import { MultipleDropdownlistComponent } from '../../../shared/multiple-select/multiple-dropdownlist/multiple-dropdownlist.component';
import { VirtualScrollDropdownlistComponent } from '../../../shared/multiple-select/virtual-scroll-dropdownlist/virtual-scroll-dropdownlist.component';

@Injectable()
export class TableAdapterService {
  currentUrl = '';

  constructor(private router: Router, private resolveFactory: ComponentFactoryResolver) {
    this.currentUrl = this.router.url;
  }

  getLikeFiltersProperties(arr: FiltersField[]) {
    return arr.reduce((acc, el) => {
      if (el.likeFilter) acc.push(el.field);
      return acc;
    }, []);
  }

  getLikeFiltersConfig(likeFilters: string[]) {
    return { likeFilterColumns: { columns: likeFilters } };
  }
}

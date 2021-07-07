import { AfterViewInit, Component, Input, OnChanges, OnInit } from '@angular/core';
import { FiltersField } from '../../../../adapters/table-adapter/FilterField';

@Component({
  selector: 'app-group-columns',
  templateUrl: './group-columns.component.html',
  styleUrls: ['./group-columns.component.scss'],
})
export class GroupColumnsComponent implements OnChanges {
  @Input() columns: FiltersField[];

  constructor() {}

  ngOnChanges(changes): void {
    console.log(changes);
  }
}

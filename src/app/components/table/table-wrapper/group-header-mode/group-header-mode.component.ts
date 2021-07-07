import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FiltersField } from '../../../../adapters/table-adapter/FilterField';

@Component({
  selector: 'app-group-header-mode',
  templateUrl: './group-header-mode.component.html',
  styleUrls: ['./group-header-mode.component.scss'],
})
export class GroupHeaderModeComponent implements OnInit, OnChanges {
  @Input() columns: FiltersField[];
  @Input() groupsRecords;
  @Input() groupRow;
  headerGroupingRow: any[];

  constructor(public cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.createGroupHeaderInfo(this.groupsRecords);
    this.cdr.markForCheck();
  }

  ngOnInit() {}

  createGroupHeaderInfo(arg) {
    if (!arg.length) {
      return;
    }
    const fieldNameArr = [];
    const widthCol = [];
    this.columns.forEach((el) => {
      if (el.field) {
        fieldNameArr.push(el.field);
        el.width ? widthCol.push(parseInt(el.width, 10)) : widthCol.push(null);
      } else {
        el.childs.forEach((item) => {
          fieldNameArr.push(item.field);
          item.width ? widthCol.push(parseInt(item.width, 10)) : widthCol.push(null);
        });
      }
    });
    arg.forEach((group, idx) => {
      this.headerGroupingRow = fieldNameArr.map((el, index) => {
        return {
          id: idx,
          groupField: group.expression.fieldName,
          groupValue: group.value,
          field: el,
          data: group.records[0][el],
          width: widthCol[index],
        };
      });
    });
  }
}

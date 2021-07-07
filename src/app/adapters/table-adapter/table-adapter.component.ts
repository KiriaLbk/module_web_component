import {
  ChangeDetectorRef,
  Component,
  ContentChild,
  ContentChildren,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { TableAdapterService } from './table-adapter.service';
import { TableConfig, TableConfigInterface } from '../../components/table/models/TableConfig';
import { IRowFormatConfig, TableRowType, WBConvert } from '../../helpers/wb-convert';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ApiConfigInterface } from '../../components/table/models/ApiConfig';
import { SendAdapterCfg, TableAdapterConfig } from '../../components/table/models/TableAdapter.config';
import { TableAdapter } from './tableAdapter';
import { EditRowConfig } from '../../components/table/models/EditRow.config';
import { TableAdapterActionsDirective } from '../../directives/tableAdapterActions.directive';
import { PaginatorInfoDirective } from '../../directives/paginator-info.directive';
import { WbTableFeatureTemplateDirective } from '../../directives/wb-table-feature-template.directive';
import { TableWrapperComponent } from '../../components/table/table-wrapper/table-wrapper.component';
import { ControlPanelDirective } from '../../directives/control-panel.directive';
import * as _ from 'lodash';
import { HeaderFeatureTemplateDirective } from '../../directives/header-feature-template.directive';
import { WbCellEditorTemplateDirective } from '../../directives/cell-editor-template.directive';
import { GroupHeaderRowTemplateDirective } from '../../directives/group-header-row-template.directive';
import { WbTableRowIndexTemplateDirective } from '../../directives/wb-table-row-index-template.directive';
import { getParentContext } from '../../helpers/parentContext';

@Component({
  selector: 'app-table-adapter',
  templateUrl: './table-adapter.component.html',
  styleUrls: ['./table-adapter.component.scss'],
  providers: [TableAdapterService],
})
export class TableAdapterComponent implements OnInit, OnChanges, OnDestroy {
  data;
  currentTableCfg: TableAdapterConfig;
  destroy$ = new Subject();
  rowItemFormatConfig: IRowFormatConfig = {};

  context: TableAdapter;
  @Input() config: TableConfigInterface;

  @ContentChild(ControlPanelDirective, { static: true }) controls: ControlPanelDirective;
  @ContentChild(TableAdapterActionsDirective, { static: true }) actions: TableAdapterActionsDirective;
  @ContentChild(WbTableRowIndexTemplateDirective, { static: true }) indexTemplate: WbTableRowIndexTemplateDirective;
  @ContentChild(PaginatorInfoDirective, { static: true })
  infoPaginator: PaginatorInfoDirective;
  @ContentChildren(WbTableFeatureTemplateDirective) features: QueryList<WbTableFeatureTemplateDirective>;
  @ContentChildren(HeaderFeatureTemplateDirective) headerFeature: QueryList<HeaderFeatureTemplateDirective>;
  @ContentChildren(WbCellEditorTemplateDirective) cellEditor: QueryList<WbCellEditorTemplateDirective>;
  @ContentChild(GroupHeaderRowTemplateDirective, { static: true }) groupHeader: GroupHeaderRowTemplateDirective;

  @ViewChild('wrapper', { static: true }) wrapper: TableWrapperComponent;

  constructor(
    private adapterService: TableAdapterService,
    private cdRef: ChangeDetectorRef,
    private vcr: ViewContainerRef
  ) {
    this.context = getParentContext(this.vcr);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.config) {
      this.config = new TableConfig(changes.config.currentValue);
      this.rowItemFormatConfig = this.config.filtersFields.reduce((acc, el) => {
        if (el.dataType === 'date') {
          acc[el.field] = Date;
        }
        return acc;
      }, {});
    }
  }

  ngOnInit() {
    this.currentTableCfg = this.getCurrentTableCfg();
    // this.setPreviousConfig();
  }

  getCurrentTableCfg() {
    // Здесь проверку на localStorage потом воткнуть
    const likeFilter = this.adapterService.getLikeFiltersProperties(this.config.filtersFields);
    return new TableAdapterConfig(this.adapterService.getLikeFiltersConfig(likeFilter));
  }

  getDataForFilter(cfgParams?): any {
    const cfg: SendAdapterCfg = this.currentTableCfg.getSendDataForFilter(cfgParams);
    return this.context['getDataForFilter'](cfg).pipe(
      map((e) => {
        // const values = e.body[0] && e.body[0].length ? WBConvert.rowsToItems(e) : e.body;
        const values = e.body[0] && e.body[0].length ? _.flattenDeep(e.body) : e.body;
        return cfgParams.hasOwnProperty('filterStart') ? { values, info: e.info } : values;
        // return e.body[0] && e.body[0].length ? WBConvert.rowsToItems(e, this.rowItemFormatConfig) : e.body;
      }),
      takeUntil(this.destroy$)
    );
  }

  loadDataForTable(): any {
    this.wrapper.startViewLoading();
    const cfg: SendAdapterCfg = this.currentTableCfg.getSendData();
    this.context
      .loadDataForTable(cfg)
      .pipe(
        map((res: TableRowType) => {
          try {
            if (res.body) {
              this.config.paginatorCfg.totalCount =
                res.info && !!res.info.amount ? res.info.amount : this.config.paginatorCfg.totalCount;
              return res.body[0] && res.body[0].length
                ? WBConvert.rowsToItems(res, this.rowItemFormatConfig)
                : res.body;
            }
          } catch (e) {
            console.error('Некорректные входные данные для таблицы: ', e.message);
          }
          return !!res ? res : [];
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((res) => {
        this.data = res;
      });
  }

  editRow(changes: EditRowConfig) {
    if (!this.context.onRowEdit) {
      return;
    }
    this.context.onRowEdit(changes);
  }

  editCell(changes) {
    if (!this.context.onCellEdit) {
      return;
    }
    this.context.onCellEdit(changes);
  }

  onSelectionChange(selections: string[]) {
    if (!this.context.onSelectionChange) {
      return;
    }
    this.context.onSelectionChange(selections);
  }

  refresh(cfg: ApiConfigInterface) {
    this.currentTableCfg.setFilterByWrapperData(cfg);
    this.destroy$.next();
    this.loadDataForTable();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

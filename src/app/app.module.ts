import {Injector} from '@angular/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IgxButtonGroupModule,
  IgxButtonModule,
  IgxColumnHidingModule,
  IgxCsvExporterService,
  IgxDatePickerModule,
  IgxExcelExporterService,
  IgxFocusModule,
  IgxGridModule,
  IgxIconComponent,
  IgxIconModule,
  IgxInputGroupModule,
  IgxRippleModule,
  IgxSelectModule,
  IgxSliderModule,
  IgxSwitchModule,
  IgxToastModule,
  IgxToggleModule,
  IgxTooltipModule,
} from 'igniteui-angular';
import { FormsModule } from '@angular/forms';
import { TableAdapterComponent } from './adapters/table-adapter/table-adapter.component';
import { TableWrapperComponent } from './components/table/table-wrapper/table-wrapper.component';
import { PagingComponent } from './components/paging/paging.component';
import { GroupColumnsComponent } from './components/table/table-wrapper/group-columns/group-columns.component';
import { _MatMenuDirectivesModule, MatIconModule, MatMenuModule, MatSelectModule } from '@angular/material';
import { IgxGridStateDirective } from './components/table/table-wrapper/state.directive';
// import { SharedModule } from '../shared/shared.module';
import { TableAdapterActionsDirective } from './directives/tableAdapterActions.directive';
import { PaginatorInfoDirective } from './directives/paginator-info.directive';
import { WbTableFeatureTemplateDirective } from './directives/wb-table-feature-template.directive';
import { TemplateMenuComponent } from './components/table/table-wrapper/template-menu/template-menu.component';
import { ControlPanelDirective } from './directives/control-panel.directive';
import { AdvancedFiltersComponent } from './advanced-filters/advanced-filter.component';
import { ColumnHidingComponent } from './column-hiding/column-hiding.component';
import { HeaderFeatureTemplateDirective } from './directives/header-feature-template.directive';
// import { MaterialModule } from '../shared/material.module';
import { WbCellEditorTemplateDirective } from './directives/cell-editor-template.directive';
import { WbCellEditorTypeDirective } from './directives/cell-editor-type.directive';
import { DateCellEditorComponent } from './components/cell-editor/date-cell-editor/date-cell-editor.component';
import { InputCellEditorComponent } from './components/cell-editor/input-cell-editor/input-cell-editor.component';
import { IgxApiService } from './igx-api.service';
import { GroupHeaderModeComponent } from './components/table/table-wrapper/group-header-mode/group-header-mode.component';
import { GroupHeaderRowTemplateDirective } from './directives/group-header-row-template.directive';
import { WbTableRowIndexTemplateDirective } from './directives/wb-table-row-index-template.directive';
// import { WbSelectModule } from '../../../../projects/wb-ui/src/lib/modules/wb-select/wb-select.module';

import {createCustomElement} from "@angular/elements";

@NgModule({
  declarations: [
    TableAdapterComponent,
    TableWrapperComponent,
    PagingComponent,
    GroupColumnsComponent,
    IgxGridStateDirective,
    TableAdapterActionsDirective,
    PaginatorInfoDirective,
    WbTableFeatureTemplateDirective,
    WbTableRowIndexTemplateDirective,
    HeaderFeatureTemplateDirective,
    WbCellEditorTemplateDirective,
    WbCellEditorTypeDirective,
    TemplateMenuComponent,
    ControlPanelDirective,
    AdvancedFiltersComponent,
    ColumnHidingComponent,
    DateCellEditorComponent,
    InputCellEditorComponent,
    GroupHeaderModeComponent,
    GroupHeaderRowTemplateDirective
  ],
  imports: [
    IgxSelectModule,
    IgxInputGroupModule,
    IgxColumnHidingModule,
    MatIconModule,
    MatSelectModule,
    CommonModule,
    FormsModule,
    IgxButtonGroupModule,
    IgxIconModule,
    IgxSliderModule,
    IgxToggleModule,
    IgxButtonModule,
    IgxSwitchModule,
    IgxRippleModule,
    IgxGridModule,
    IgxToastModule,
    IgxFocusModule,
    // SharedModule,
    // WbSelectModule,
    _MatMenuDirectivesModule,
    MatMenuModule,
    IgxDatePickerModule,
    IgxTooltipModule,
    // MaterialModule
  ],
  providers: [IgxExcelExporterService, IgxCsvExporterService, IgxApiService],
  // bootstrap: [AppComponent],
  entryComponents: [
    AdvancedFiltersComponent, ColumnHidingComponent, DateCellEditorComponent, InputCellEditorComponent
  ]
})
export class AppModule {

  constructor(private injector: Injector){}

  ngDoBootstrap() {
    const tileCE = createCustomElement(TableAdapterComponent, { injector: this.injector });
    customElements.define('app-table-adapter', tileCE);
  }

}
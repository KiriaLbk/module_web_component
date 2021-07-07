import {
  ComponentFactoryResolver,
  Directive,
  Input,
  OnChanges,
  SimpleChanges,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { CellEditorType } from '../adapters/table-adapter/FilterField';
import { DateCellEditorComponent } from '../components/cell-editor/date-cell-editor/date-cell-editor.component';
import { InputCellEditorComponent } from '../components/cell-editor/input-cell-editor/input-cell-editor.component';
import { WbControlWindowComponent } from '../../shared/wb-control-window/wb-control-window.component';
import { DataControlWindowModel } from '../../shared/wb-control-window/dataControlWindow.model';

/**
 * Директива для выбора типа редактора по умолчанию
 */

export type EditorType = 'date' | 'none';

@Directive({
  selector: '[wbCellEditorType]',
})
export class WbCellEditorTypeDirective implements OnChanges {
  @Input() type: EditorType = 'none';
  @Input() cell;
  constructor(private vcr: ViewContainerRef, private resolver: ComponentFactoryResolver) {}
  ngOnChanges(changes: SimpleChanges): void {
    const editorDate = this.resolver.resolveComponentFactory(DateCellEditorComponent);
    const editorInput = this.resolver.resolveComponentFactory(InputCellEditorComponent);
    const editorTemplate = this.vcr.createComponent(this.type === 'date' ? editorDate : editorInput);
    editorTemplate.instance.cell = this.cell;
  }
}

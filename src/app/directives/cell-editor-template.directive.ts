import { Directive, Input, TemplateRef } from '@angular/core';

/**
 * Директива для кастомизации редактора ячеек
 */
@Directive({
  selector: '[wbCellEditor]',
})
export class WbCellEditorTemplateDirective {
  @Input() columnsForCellEditor = [];
  constructor(public templateRef: TemplateRef<any>) {}
}

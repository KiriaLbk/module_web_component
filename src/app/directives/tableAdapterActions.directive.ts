import { Directive, TemplateRef } from '@angular/core';

/**
 * Директива для кастомизации функционала колонок таблицы
 */

@Directive({
  selector: '[wbTableActions]',
})
export class TableAdapterActionsDirective {
  constructor(public templateRef: TemplateRef<any>) {}
}

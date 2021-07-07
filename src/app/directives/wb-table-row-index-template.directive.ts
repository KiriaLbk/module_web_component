import { Directive, TemplateRef } from '@angular/core';

/**
 * Директива для кастомизации функционала колонок таблицы
 */

@Directive({
  selector: '[wbTableRowIndexTemplate]',
})
export class WbTableRowIndexTemplateDirective {
  constructor(public templateRef: TemplateRef<any>) {}
}

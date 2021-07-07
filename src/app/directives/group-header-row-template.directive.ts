import { Directive, Input, TemplateRef } from '@angular/core';

/**
 * Директива для кастомизации группирующей строки
 */

@Directive({
  selector: '[groupHeaderRow]',
})
export class GroupHeaderRowTemplateDirective {
  @Input() columnsForFeatures = [];
  constructor(public templateRef: TemplateRef<any>) {}
}

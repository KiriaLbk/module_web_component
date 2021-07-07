import { Directive, Input, TemplateRef } from '@angular/core';

/**
 * Директива для кастомизации функционала шапки колонок таблицы
 */

@Directive({
  selector: '[wbHeaderFeature]',
})
export class HeaderFeatureTemplateDirective {
  @Input() columnsForFeatures = [];
  constructor(public templateRef: TemplateRef<any>) {}
}

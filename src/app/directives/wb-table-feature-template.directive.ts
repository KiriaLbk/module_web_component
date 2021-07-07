import { Directive, Input, TemplateRef } from '@angular/core';

/**
 * Директива для дополнительного функционала для содержимого колонок
 */

@Directive({
  selector: '[wbTableFeatureTemplate]',
})
export class WbTableFeatureTemplateDirective {
  @Input() columnsForFeatures = [];
  constructor(public templateRef: TemplateRef<any>) {}
}

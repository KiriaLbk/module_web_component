import { Directive, TemplateRef } from '@angular/core';

/**
 * Директива для дополнительного функционала в управляющей панели над таблицей
 */

@Directive({
  selector: '[wbControlPanel]',
})
export class ControlPanelDirective {
  constructor(public templateRef: TemplateRef<any>) {}
}

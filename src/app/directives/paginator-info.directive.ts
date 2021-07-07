import { Directive, TemplateRef } from '@angular/core';

/**
 * Директива для сохранения информации о пагинаторе
 */

@Directive({
  selector: '[wbPaginatorInfo]',
})
export class PaginatorInfoDirective {
  constructor(public templateRef: TemplateRef<any>) {}
}

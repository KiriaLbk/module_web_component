import { ViewContainerRef } from '@angular/core';

export function getParentContext(r: ViewContainerRef) {
  let i;
  try {
    if (r.hasOwnProperty('_view')) {
      return r['_view'].component;
    }
    i = r['_hostView'].findIndex((s) => s && typeof s === 'object' && s['__ngContext__'] && !s['firstElementChild']);
  } catch (e) {
    throw new Error('Отсутствует _hostView  в getParentContext function');
  }
  return r['_hostView'][i];
}

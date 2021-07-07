export type DropdownListMode = 'default' | 'boolean';

export const HAVE_VALUE = 'Присутствует';
export const IS_NOT_HAVE_VALUE = 'Отсутствует';

export class DropdownListFactory {
  getList: (arr) => {};
  selectValue: (arr) => {};
  constructor(type: DropdownListMode = 'default') {
    switch (type) {
      case 'boolean':
        this.getList = DropDownListWorker.empty;
        this.selectValue = DropDownListWorker.selectEmpty;
        break;
      default:
        this.getList = null;
        this.selectValue = null;
    }
  }
}
/* tslint:disable */
class DropDownListWorker {
  static empty<T>(arr: T[]): string[] {
    return [IS_NOT_HAVE_VALUE, HAVE_VALUE];
  }

  static selectEmpty(arr: string[]) {
    return arr.map((r) => (r === HAVE_VALUE ? 1 : 0));
  }
}

export interface IFilterValue {
  searchVal: string | number;
  fieldName: string;
}

export interface IFilterWrapper {
  fieldName: string;
  filteringOperands: IFilterValue[];
}

export class InitialFilters implements IFilterWrapper {
  fieldName = '';
  filteringOperands = [];

  constructor(cfg = {}) {
    Object.keys(cfg).forEach((prop) => {
      if (this.hasOwnProperty(prop)) this[prop] = cfg[prop];
    });
  }
}

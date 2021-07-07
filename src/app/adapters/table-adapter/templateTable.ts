import { FilterField, FiltersField } from './FilterField';

export interface ITemplateTable {
  field: string;
  name?: string;
  filtersFields?: FiltersField[];

  id?: string;
  custom?: boolean;

  hasFilterAndSort?: boolean;
  filter?: { [key: string]: Array<string | number> };
  sort?: { fieldName: string; sorOptions: 'NONE' | 'ASC' | 'DESC' };
}

export class TemplateTable implements ITemplateTable {
  name = '';
  field = '';
  filtersFields: FiltersField[] = null;

  id = null;
  custom = false;

  hasFilterAndSort = false;
  filter: { [key: string]: Array<string | number> } = null;
  sort: { fieldName: string; sorOptions: 'NONE' | 'ASC' | 'DESC' } = null;

  constructor(cfg) {
    Object.keys(cfg).forEach((prop) => {
      if (this.hasOwnProperty(prop)) {
        switch (prop) {
          case 'filtersFields':
            this[prop] = cfg[prop] && Array.isArray(cfg[prop]) ? cfg[prop] : this[prop];
            break;
          case 'custom':
          case 'hasFilterAndSort':
            this[prop] = typeof cfg[prop] === 'boolean' ? cfg[prop] : this[prop];
            break;
          default:
            this[prop] = cfg[prop] || this[prop];
        }
      }
    });

    if (!this.name) {
      this.name = this.field;
    }
  }
}

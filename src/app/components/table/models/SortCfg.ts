type sortType = 'DESC' | 'ASC';

export interface SortAdapterCfgInterface {
  filterName: string;
  sortOption: sortType;
  type?: string;
}

export class SortCfg implements SortAdapterCfgInterface {
  filterName = '';
  sortOption: sortType = 'ASC';
  constructor(cfg) {
    if (cfg.fieldName) this.filterName = cfg.fieldName;
    if (cfg.dir) {
      this.sortOption = cfg.dir === 1 ? this.sortOption : 'DESC';
    }
  }
}

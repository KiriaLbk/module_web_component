import { ApiConfigInterface } from './ApiConfig';
import { SortCfg } from './SortCfg';

export interface LikeFilterColumnsInterface {
  columns: string[];
}

export interface SendAdapterCfg {
  start: number;
  limit: number;
  filter: string;
  sort: string;
  likeFilterColumns: string;
  boolean?: string;
}

export interface TableAdapterConfigInterface {
  start: number;
  limit: number;
  filter: object;
  sort: object;
  likeFilterColumns: LikeFilterColumnsInterface;

  setFilterByWrapperData(cfg: ApiConfigInterface): void;
  getSendData(): SendAdapterCfg;
  getSortCfg(object): object;
}

export class TableAdapterConfig implements TableAdapterConfigInterface {
  filter = {};
  likeFilterColumns = { columns: [] };
  limit = 50;
  sort = {};
  start = 0;
  booleanFilters: string[] = [];

  constructor(cfg = {}) {
    Object.keys(cfg).forEach((prop) => {
      if (this.hasOwnProperty(prop)) {
        this[prop] = cfg[prop];
      }
    });
  }

  setFilterByWrapperData(cfg: ApiConfigInterface) {
    this.filter = Object.assign(
      {},
      ...cfg.filter.map((e) => ({ [e.fieldName]: e.filteringOperands.map((f) => f.searchVal) }))
    );
    this.start = cfg.paginatorCfg.start;
    this.limit = cfg.paginatorCfg.limit;
    this.sort = this.getSortCfg(cfg.sort);
    this.booleanFilters = cfg.booleanFilters;
  }

  getSendData(): SendAdapterCfg {
    const data = {
      filter: JSON.stringify(this.filter),
      sort: JSON.stringify(this.sort),
      limit: this.limit,
      start: this.start,
      likeFilterColumns: JSON.stringify(this.likeFilterColumns),
    };
    if (this.booleanFilters.length) {
      data['boolean'] = JSON.stringify(this.booleanFilters);
    }
    return data;
  }
  /**
   * Подумать о конфигах фильтра. Связь бэка с фронтом.
   * Временное решение по удалению из фильтра текущего столбца
   * для получения уникальных значений.
   */
  getSendDataForFilter(cfg?) {
    return Object.assign(this.deleteCurrentFilters(cfg.columns), { distinct: true, notNULL: true, ...cfg });
  }
  /**
   * Подумать об улучшении структуры общения
   * между фронтом и бэком для получения уникальных
   * значений фильтра
   * @param field
   */
  deleteCurrentFilters(field: string) {
    const sendData = this.getSendData();
    const filters = JSON.parse(sendData.filter);
    delete filters[field];
    sendData.filter = JSON.stringify(filters);
    return sendData;
  }

  getSortCfg(cfgSort) {
    if (!cfgSort) {
      return {};
    }
    return new SortCfg(cfgSort);
  }
}

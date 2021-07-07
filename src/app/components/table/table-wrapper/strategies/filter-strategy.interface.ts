export interface IFilterStrategy {
  getDataForWindow(field: string, cfg?): any;
  dispatchCfg(cfg: any): void;
}

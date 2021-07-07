export interface PaginatorFormatInterface {
  /**
   * показать линию "открыть"
   */
  isShowLine: boolean;
  /**
   * показать кнопку информации
   */
  isShowButtonInfo: boolean;
  /**
   * показать кнопку управления
   */
  isShowButtonPagin: boolean;
  /**
   * показать кнопки крайних страниц
   */
  isShowPagesButtons: boolean;
  /**
   * показать селект с количеством страниц
   */
  isShowSelect: boolean;
}

export class PaginatorFormat implements PaginatorFormatInterface {
  isShowLine = false;
  isShowButtonInfo = true;
  isShowButtonPagin = true;
  isShowPagesButtons = true;
  isShowSelect = true;

  constructor(cfg = {}) {
    Object.keys(cfg).forEach((prop) => {
      if (this.hasOwnProperty(prop)) this[prop] = cfg[prop];
    });
  }
}

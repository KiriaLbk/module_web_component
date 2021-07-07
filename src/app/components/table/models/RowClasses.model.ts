import { fillProps } from '../../../../../helpers/others/fillProps';

type rowClass = (rowData) => boolean;

/**
 * Для добавления нового типа строчки, необходимо прописать стиль в table-wrapper.component.scss
 * по аналогии с уже созданными
 */
export interface IRowClasses {
  /**
   * Красная строчка
   */
  error_row?: rowClass;
  /**
   * Желтая стрчока
   */
  warning_row?: rowClass;
  /**
   * Красная рамка
   */
  error_border?: rowClass;
}

export class RowClassesModel implements IRowClasses {
  error_row = null;
  warning_row = null;
  error_border = null;
  /**
   * В cfg не может быть 2 параметра, так как цвет у строки может быть только один.
   * В контсрукторе берется первый цвет из объекта
   * @param cfg
   */
  constructor(cfg: IRowClasses) {
    fillProps(cfg, this);
  }
}

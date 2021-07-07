export interface TableRowType {
  head: string[];
  body: any[];
  info?: any;
}

/**
 * Для добавления другого формата, поменять тип
 * Пример Date | Moment | CustomClass
 * Сейчас только для даты
 */
export interface IRowFormatConfig {
  [prop: string]: Date;
}

export class WBConvert {
  /**
   * @description Конвертирует TableRowType формат в формат массива oбъектов.
   * @param rowType - конвертируемый объект
   * @param config - объект с информацией для дополнительной конвертации
   */
  static rowsToItems<T>(rowType: TableRowType, config?: IRowFormatConfig): T[] {
    if (!rowType || !rowType.hasOwnProperty('body') || !rowType.hasOwnProperty('head')) {
      throw Error(`TableRowType объект не правильного формата: ${rowType}`);
    }

    return rowType.body.map((row) => {
      const item = {};
      row.forEach((col, colIndex) => {
        const cfgCol: any = config ? config[rowType.head[colIndex]] : config;
        /**
         * TODO доработать. Убрать жесткую проверку на null.
         */
        item[rowType.head[colIndex]] = !!cfgCol
          ? config[rowType.head[colIndex]] instanceof Date && col
            ? new cfgCol(col)
            : col
          : col;
      });
      return item as T;
    });
  }

  /**
   * @description Конвертирует массив oбъектов в TableRowType формат:
   * @param items - конвертируемый объект
   * @param props - свойства которые необхдимо оставить при ковертации объектов.
   * Если отсутствует то берутся все свойства объекта.
   * @returns - {
   *    head: string[];
   *    body: any[];
   * }
   */
  static itemsToRows(items: any[], props?: string[]): TableRowType {
    if (!Array.isArray(items)) {
      throw Error(`Ошибка itemToRow(items). items не правильного формата: ${items}`);
    }

    let clearedItems = items;
    if (props && props.length) {
      clearedItems = this.filterProps(items, props);
    }

    return {
      head: Object.keys(clearedItems[0] || []),
      body: clearedItems.map((item) => Object.values(item)),
    };
  }

  /**
   * Отсекаем те свойства объекта, которые не перечислены в параметре props.
   */
  private static filterProps(items: any[], props: string[]) {
    return items.map((item) => {
      Object.keys(item)
        .filter((key) => props.indexOf(key) >= 0)
        .reduce((obj, key) => (obj[key] = item[key]), {});
    });
  }
}

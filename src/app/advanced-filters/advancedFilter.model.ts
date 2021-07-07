export interface IAdvancedFilter {
  /**
   * Название столбца
   */
  name: string;
  /**
   * Ключ по которому фильтруется столбец
   */
  field: string;
  /**
   * Список значений
   * по текущему фильтру
   */
  value: Array<string | number>;

  /**
   * Формат данных
   * @param val
   */
  dataType: string;

  changeValue?(val: any[]): void;
  changeField?(field: string): void;
  changeName?(name: string): void;
  changeDataType?(type: string): void;
}

export class MAdvancedFilter implements IAdvancedFilter {
  name = '';
  field = '';
  value = [];
  dataType = null;

  constructor(cfg = {}) {
    Object.keys(cfg).forEach((prop) => {
      if (this.hasOwnProperty(prop)) this[prop] = cfg[prop];
    });
  }

  changeValue(value: Array<string | number>) {
    this.value = value;
  }

  changeField(field: string) {
    this.field = field;
  }

  changeName(name: string) {
    this.name = name;
  }

  changeDataType(type: string): void {
    this.dataType = type;
  }
}

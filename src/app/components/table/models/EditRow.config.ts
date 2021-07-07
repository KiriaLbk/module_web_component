/**
 * Редактирование строки
 * difference - объект с изменениями
 * newValue - вся строка после изменения
 */
export interface EditRowConfig {
  difference: object;
  newValue: object;
  editInfo?: object;
}

/**
 * Редактирование ячейки
 * difference - объект с изменениями
 * newValue - вся строка после изменения
 */
export interface EditCellConfig {
  difference: object;
  newValue: object;
  editInfo?: object;
}

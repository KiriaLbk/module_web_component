import { throwError } from 'rxjs';

export interface IFormatters {
  [prop: string]: (val) => {};
}

export const Formatters: IFormatters = {
  date: defaultDate,
  dateTime: defaultDateTime,
};

/**
 * функция для конвертации даты в формат "dd.mm.yyyy"
 */
function defaultDate(val?) {
  if (!val) {
    return null;
  }
  try {
    return new Intl.DateTimeFormat('ru-RU').format(new Date(val));
  } catch (e) {
    return null;
  }
}
/**
 * Функция для конвертация даты в формат "hh-mm-ss dd.mm.yyyy"
 */
function defaultDateTime(val) {
  if (!val) return null;
  const options = {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  };
  return new Intl.DateTimeFormat('ru-RU', options).format(new Date(val));
}

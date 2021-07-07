/**
 * Формирование активных колонок(отфильтрованных по значению) Lazy load
 * @param cfg
 */
export function getActiveLazyLoadColumns(cfg) {
  let activeColumns = [];
  if (cfg.columns) {
    activeColumns.push(cfg.columns);
  }
  if (cfg['filter']) {
    const filterConfig = JSON.parse(cfg['filter']);
    Object.keys(filterConfig).forEach((prop) => {
      if (filterConfig[prop].length || prop === cfg['columns']) {
        activeColumns.push(prop);
      }
    });
    cfg['activeColumns'] = JSON.stringify(activeColumns);
  }
  if (cfg['sort']) {
    const sortConfig = JSON.parse(cfg['sort']);
    activeColumns =
      !!sortConfig.filterName && !activeColumns.includes(sortConfig.filterName)
        ? [...activeColumns, sortConfig.filterName]
        : activeColumns;
    cfg['activeColumns'] = JSON.stringify(activeColumns);
  }
  return cfg;
}

import { TableConfigInterface } from './TableConfig';
import { FilterField, FiltersField } from '../../../adapters/table-adapter/FilterField';
import { GridTableInterface } from './GridTable';

interface IFilterFieldBuild {
  editable?: boolean;
  groupable?: boolean;
  customFilterStrategy?: (options, value) => any[];
}

export class FilterFieldBuilder {
  constructor(cfg: GridTableInterface, filterField: FiltersField) {
    const builder: IFilterFieldBuild = {};
    if (cfg.cellEdit) {
      builder.editable = cfg.cellEdit;
    }
    if (cfg.rowEditable) {
      builder.editable = cfg.rowEditable;
    }
    if (cfg.groupingExpressions) {
      builder.groupable = true;
    }
    if (cfg.customFilterStrategy) {
      builder.customFilterStrategy = cfg.customFilterStrategy;
    }
    return { ...builder, ...filterField };
  }
}

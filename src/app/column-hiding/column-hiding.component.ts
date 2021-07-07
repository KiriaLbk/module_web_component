import {
  ChangeDetectorRef,
  Component,
  ComponentRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { IgxColumnComponent } from 'igniteui-angular';
import { LanguageService } from '../../../services/language-service/language.service';
import { takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { MultilanguageFilteringStrategy } from './multilanguage-strategies/multilanguage-filtering-strategy';
import { DefaultFilteringStrategy } from './multilanguage-strategies/default-filtering-strategy';
import { IFilterStrategy } from './multilanguage-strategies/filtering-strategy.interface';
import { ColumnHidingCfg } from './column-hiding-cfg.model';

@Component({
  selector: 'app-column-hiding',
  templateUrl: './column-hiding.component.html',
  styleUrls: ['./column-hiding.component.scss'],
})
export class ColumnHidingComponent implements OnInit, OnDestroy {
  hidableColumns: any[];
  filterCriteria: string;
  destroy$ = new Subject();
  filteringStrategy: IFilterStrategy;

  @Input() cfg: ColumnHidingCfg;

  constructor(public lang: LanguageService, private cdr: ChangeDetectorRef) {
    this.lang.change$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.createColumnItems();
    this.setMultiLanguageStrategy();
  }

  /**
   * Получение экземпляра стратегии в соответсвии с вкл/выкл мультиязычностью
   */
  getMultiLanguageStrategy() {
    return this.cfg && this.cfg.multiLanguage
      ? new MultilanguageFilteringStrategy(this)
      : new DefaultFilteringStrategy(this);
  }

  /**
   * Установка актуальной стратегии
   */
  setMultiLanguageStrategy() {
    this.filteringStrategy = this.getMultiLanguageStrategy();
  }
  onVisibilityChanged(e) {}

  /**
   * Функция для отображения всех столбцов
   */
  showAllColumns() {
    this.hidableColumns.forEach((col) => {
      col.hidden = false;
    });
  }

  /**
   * Функция для скрытия всех столбцов
   */
  hideAllColumns() {
    this.hidableColumns.forEach((col) => {
      col.hidden = true;
    });
  }

  /**
   * Функция для поиска столбца
   */
  filteringColumns() {
    this.filteringStrategy.filteringColumns();
  }

  /**
   * Фильтрация входного массива столбцов с учетом возможности скрытия
   */
  createColumnItems() {
    if (this.cfg && this.cfg.columns && this.cfg.columns.length > 0) {
      this.hidableColumns = this.cfg.columns.filter((col) => !col.disableHiding);
    }
  }
}

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import { PaginatorCfg, PaginatorCfgInterface } from '../table/models/PaginatorCfg';
import { LanguageService } from '../../../../services/language-service/language.service';

@Component({
  selector: 'app-paging',
  templateUrl: './paging.component.html',
  styleUrls: ['./paging.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PagingComponent implements OnChanges, OnDestroy {
  public page = 0;
  public lastPage = false;
  public firstPage = true;
  public totalPages = 0;
  public pages = [];
  public pageSizes = [];
  public _perPage = 50;
  private _dataLengthSubscriber;
  invalidPaginate = false;

  infoPagin = false;
  buttonPagin = true;

  @Input() totalCount = 0;
  @Input() currentCount = 0;
  @Input() paginatorConfig = new PaginatorCfg();
  @Input() paginatorTemplate;
  @Input() paginatorForm;
  @Output() changePage = new EventEmitter<PaginatorCfgInterface>();
  @Output() paginatorInfo = new EventEmitter<boolean>();

  public get pageShow() {
    return this.totalPages ? this.page + 1 : 0;
  }

  public get perPage(): number {
    return this._perPage;
  }

  public set perPage(val: number) {
    this._perPage = val;
    this.page = 0;
    this.paginate(this.page, true);
  }

  public get shouldShowLastPage() {
    return this.pages[this.pages.length - 1] !== this.totalPages - 1;
  }

  private visibleElements = 5;

  constructor(public lang: LanguageService, private cdr: ChangeDetectorRef) {
    this.buttonDeselection(this.page, this.totalPages);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.paginatorConfig) {
      this.pageSizes = this.paginatorConfig.pageSizes;
      const cfg = new PaginatorCfg(changes.paginatorConfig.currentValue);
      this.paginatorConfig = cfg;
      this.initPaginator(cfg);
    }
    if (changes.totalCount && changes.totalCount.currentValue) {
      this.totalPages = Math.ceil(this.totalCount / this.perPage);
      this.buttonDeselection(this.page, this.totalPages);
    }
  }

  private initPaginator(cfg: PaginatorCfg) {
    this.page = cfg.start / cfg.limit;
    this._perPage = cfg.limit;
    this.infoPagin = this.paginatorForm;
  }

  private changePaginator(start: number, limit: number) {
    if (this.invalidPaginate) return;
    this.changePage.emit({ totalCount: this.totalCount, start, limit });
  }

  public paginate(page: number, recalc: boolean) {
    if (page === 0 || page === this.totalPages - 1) {
      this.page = page;
    }
    if (page > this.totalPages - 1 || page === -1) {
      this.buttonDeselection(page, this.totalPages);
    } else {
      const skip = page * this.perPage;
      const top = this.perPage;
      this.page = page;
      if (recalc) {
        this.totalPages = Math.ceil(this.totalCount / this.perPage);
      }
      this.changePaginator(skip, top);
      this.buttonDeselection(this.page, this.totalPages);
    }
    this.cdr.detectChanges();
  }

  public previousPage() {
    this.lastPage = false;
    this.page--;
    const skip = this.page * this.perPage;
    const top = this.perPage;
    if (this.page <= 0) {
      this.firstPage = true;
    }
    this.changePaginator(skip, top);
  }

  public nextPage() {
    this.firstPage = false;
    this.page++;
    const skip = this.page * this.perPage;
    const top = this.perPage;
    if (this.page + 1 >= this.totalPages) {
      this.lastPage = true;
    }
    this.changePaginator(skip, top);
  }

  public buttonDeselection(page: number, totalPages: number) {
    this.invalidPaginate = page > totalPages || !(page + 1) || page < 0;
    if (totalPages <= 1 || page > totalPages || page === -1) {
      this.lastPage = true;
      this.firstPage = true;
    } else if (page + 1 >= totalPages) {
      this.lastPage = true;
      this.firstPage = false;
    } else if (page !== 0 && page !== totalPages) {
      this.lastPage = false;
      this.firstPage = false;
    } else {
      this.lastPage = false;
      this.firstPage = true;
    }
  }

  public parseToInt(val) {
    this.perPage = parseInt(val, 10);
  }

  infoPaginator() {
    this.infoPagin = !this.infoPagin;
    this.paginatorInfo.emit(this.infoPagin);
  }

  buttonPaginator() {
    this.buttonPagin = !this.buttonPagin;
  }

  public ngOnDestroy() {
    if (this._dataLengthSubscriber) {
      this._dataLengthSubscriber.unsubscribe();
    }
  }
}

import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ITemplateInfo, TableWrapperService } from '../../table.service';
import { catchError, map, takeUntil } from 'rxjs/operators';
import { ITemplateTable, TemplateTable } from '../../../../adapters/table-adapter/templateTable';
import { MatDialog } from '@angular/material/dialog';
import { AcceptDialogComponent } from '../../../../../../../../projects/wb-ui/src/lib/modules/wb-accept-dialog/accept-dialog/accept-dialog.component';
import { IAcceptDialogInterface } from '../../../../../../../../projects/wb-ui/src/lib/interfaces/accept-dialog/accept-dialog.interface';
import { of, Subject } from 'rxjs';
import { SnackbarService } from '../../../../../shared/snackbar/snackbar.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-template-menu',
  templateUrl: './template-menu.component.html',
  styleUrls: ['./template-menu.component.scss'],
})
export class TemplateMenuComponent implements OnInit, OnDestroy {
  form: FormGroup;

  showIconTemplate = true;
  activeTemplate = '0';
  icon = 'done';
  customTemplateLoad = false;

  destroy$ = new Subject();

  @Input() config;
  @Input() state;
  @Input() currentTemplateNumber;

  @Output() changeTemplateArray = new EventEmitter();
  @Output() updateTemplate = new EventEmitter();
  @Output() changeCurrentTemplate = new EventEmitter();

  constructor(public table: TableWrapperService, private dialog: MatDialog, private snackbar: SnackbarService) {}

  ngOnInit() {
    this.activeTemplate = this.currentTemplateNumber;

    this.form = new FormGroup({ templateName: new FormControl('', [Validators.required, Validators.minLength(4)]) });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  show() {
    this.showIconTemplate = true;
  }

  getTemplate() {
    if (!this.config.templatesTable.some((el) => el.custom)) {
      this.table
        .getCustomTemplate({ typeTemplate: this.state.currentUrl })
        .pipe(
          map((res) => {
            return res && res.data
              ? res.data.map((item) => {
                  let data = JSON.parse(item.data);

                  // костыль для ранее созданных шаблонов.
                  if (Array.isArray(data)) {
                    data = { filtersFields: data };
                  }

                  return new TemplateTable({
                    ...data,
                    id: item.id,
                    field: window.btoa(encodeURIComponent(item.nameTemplate)),
                    name: item.nameTemplate,
                    custom: true,
                  });
                })
              : [];
          }),
          takeUntil(this.destroy$)
        )
        .subscribe((res) => {
          this.config.templatesTable = res.reduce<ITemplateTable[]>(
            (acc, curr) => [...acc, ...(acc.some((x) => +x.id === +curr.id) ? [] : [curr])],
            this.config.templatesTable
          );

          this.changeTemplateArray.emit(this.config.templatesTable);
          this.customTemplateLoad = true;
          this.updateTemplate.emit();
        });
    } else {
      this.customTemplateLoad = true;
    }
  }

  createTemplate() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    const templateName = this.form.get('templateName').value;

    const data: IAcceptDialogInterface = { message: 'Сохранить текущее состояние фильтров?' };
    this.dialog
      .open(AcceptDialogComponent, { data })
      .afterClosed()
      .subscribe((accept) => {
        const dataTemplate: Partial<ITemplateTable> = {
          filtersFields: this.state.getColumnsForTemplate(),
          hasFilterAndSort: !!accept,
        };

        if (accept) {
          dataTemplate.filter = this.state.getFiltersForTemplate();
          dataTemplate.sort = this.state.getSortingForTemplate();
        }

        this.changeMenuState(true);

        const cfg: ITemplateInfo = {
          nameTemplate: templateName,
          dataTemplate: JSON.stringify(dataTemplate),
          accessibility: false,
          typeTemplate: this.state.currentUrl,
        };
        this.table
          .saveCustomTemplate(cfg)
          .pipe(
            catchError(() => of({ status: false })),
            takeUntil(this.destroy$)
          )
          .subscribe((res) => {
            if (res.status) {
              this.config.templatesTable.push(
                new TemplateTable({
                  id: res.data,
                  field: window.btoa(encodeURIComponent(templateName)),
                  name: templateName,
                  ...dataTemplate,
                  custom: true,
                })
              );
              this.changeTemplateArray.emit(this.config.templatesTable);

              this.form.reset();
            }

            this.snackbar.openWithOptions({
              message: res.status ? 'Шаблон загружен успешно!' : 'Не удалось загрузить шаблон.',
              panelClass: res.status ? 'success' : 'error',
            });
          });
      });
  }

  changeTemplate(field: string) {
    this.changeMenuState(true);

    this.activeTemplate = field;
    this.currentTemplateNumber = field;
    this.changeCurrentTemplate.emit(field);

    this.icon = 'done';
  }

  deleteTemplate(event, field: string) {
    event.stopPropagation();
    this.config.templatesTable.some((el, index) => {
      if (el.field === field && el.custom) {
        this.table.deleteCustomTemplate(el.id).subscribe((res) => {
          if (res.status) {
            this.config.templatesTable.splice(index, 1);
            this.changeTemplateArray.emit(this.config.templatesTable);
          }
        });
        return true;
      }
      return false;
    });
    this.icon = 'done';
  }

  deleteCurrentTemplate(event, field: string) {
    this.changeTemplate('0');
    this.deleteTemplate(event, field);
  }

  changeMenuState(state?: boolean) {
    this.showIconTemplate = state ? state : !this.showIconTemplate;
  }

  cancelCreate() {
    this.changeMenuState(true);
    this.form.reset();
  }

  changeIconType(type: string) {
    this.icon = type;
  }
}

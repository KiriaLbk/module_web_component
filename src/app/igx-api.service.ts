import { Injectable } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Api } from '../../helpers/decorators/api.decorator';
import { Observable } from 'rxjs';
import { ApiRest } from '../../helpers/decorators/api-restful.decorator';
import { HttpClient } from '@angular/common/http';
import { TableAdapterConfigInterface } from './components/table/models/TableAdapter.config';

@Injectable()
export class IgxApiService {
  constructor(public auth: AuthService, public http: HttpClient) {}
  /**
   * Получение конфига фильтрации по QR code
   * @param cfg
   */
  @ApiRest({ url: '/newApi/navigation/qrCode/:id', type: 'GET' })
  getConfigByQRCodeId(cfg: {
    id: string;
  }): Observable<Pick<TableAdapterConfigInterface, 'filter' | 'limit' | 'sort' | 'start'>> {
    return;
  }
  /**
   * Получение шаблонов таблиц с сервера
   * @param cfg
   */
  @Api({ url: 'documentation&type=template&page=getTemplatesDataByType&ajax=true' })
  getTemplatesDataByType(
    cfg?
  ): Observable<{ data: Array<{ data: string; id: string; nameTemplate: string }>; status: boolean }> {
    return;
  }

  /**
   * Сохранение шаблонов таблиц на сервере
   * @param cfg
   */
  @Api({ url: 'documentation&type=template&page=saveTemplate&ajax=true' })
  saveTemplate(cfg?): Observable<any> {
    return;
  }
  /**
   * Удаление шаблонов таблиц на сервере
   * @param cfg
   */
  @Api({ url: 'documentation&type=template&page=deleteTemplateById&ajax=true' })
  deleteTemplateById(cfg?): Observable<any> {
    return;
  }
}

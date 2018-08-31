import { Injectable } from '@angular/core';
import { HttpService } from '../../../providers/httpClient';
import * as _ from 'lodash';

@Injectable()
export class FormService {
  private modelName = 'data';  // URL to web api
  constructor(private _httpService: HttpService) {
  }

  getForms(viewname: string) {
    return this._httpService.getDataServer2(this.modelName + '/' + viewname);
  }

  getFormsField() {
    return this._httpService.getDataServer2('fields');
  }
  getFormsFieldByName(viewname: string) {
    return this._httpService.getDataServer2('fields/' + viewname);
  }
  delete(viewname: string, id: any) {
    return this._httpService.delete2('delete/' + viewname, id);
  }

  create(view: string, user: any) {
    return this._httpService.create2(this.modelName + '/' + view, user);
  }
  update(view: string, user: any) {
    return this._httpService.create2(this.modelName + '/' + view, user);
  }
}

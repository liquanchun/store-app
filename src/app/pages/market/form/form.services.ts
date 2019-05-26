import { Injectable } from '@angular/core';
import { HttpService } from '../../../providers/httpClient';
import * as _ from 'lodash';

@Injectable()
export class FormService {
  private modelName = 'data';  // URL to web api
  constructor(private _httpService: HttpService) {
  }

  getDataCount(tablename: string) {
    return this._httpService.getDataServer2(this.modelName + 'count/' + tablename);
  }
  getMaxId(tablename: string) {
    return this._httpService.getDataServer2('maxid/' + tablename);
  }
  getForms(viewname: string) {
    return this._httpService.getDataServer2(this.modelName + '/' + viewname);
  }

  getFormsByPost(viewname: string, paradata: any) {
    return this._httpService.create2('datalist/' + viewname, paradata);
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
  delete2(viewname: string, id: any) {
    return this._httpService.delete2('delete2/' + viewname, id);
  }
  deleteser(viewname: string, id: any) {
    return this._httpService.delete2('deleteser/' + viewname, id);
  }
  create(view: string, user: any) {
    return this._httpService.create2(this.modelName + '/' + view, user);
  }
  createser(view: string, user: any) {
    return this._httpService.create2('dataarray/' + view, user);
  }
  update(view: string, user: any) {
    return this._httpService.create2(this.modelName + '/' + view, user);
  }
}

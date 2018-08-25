import { Injectable } from '@angular/core';
import { HttpService } from '../../../providers/httpClient';

@Injectable()
export class FiledService {
  private modelName = 'fields';  // URL to web api
  constructor(private _httpService: HttpService) {
  }

  getFields() {
    return this._httpService.getDataServer2(this.modelName);
  }
  getUsersById(userId:any) {
    return this._httpService.getModelList(this.modelName + '/' + userId);
  }
  getUsersByOrgId(orgId:any) {
    return this._httpService.getModelList(this.modelName + '/org/' + orgId);
  }
  delete(viewname: string, id: any) {
    return this._httpService.delete2('delete/' + viewname, id);
  }

  create(view: string, user: any) {
    return this._httpService.create2(view, user);
  }
  update(view: string, user: any) {
    return this._httpService.create2(this.modelName + '/' + view, user);
  }
  userAuth(modelName:any,user:any){
    return this._httpService.create(modelName, user);
  }
}

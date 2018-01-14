import { Injectable } from '@angular/core';
import { HttpService } from '../../../../providers/httpClient';

@Injectable()
export class UserService {
  private modelName = 'sysuser';  // URL to web api
  constructor(private _httpService: HttpService) {
  }

  getUsers() {
    return this._httpService.getModelList(this.modelName);
  }
  getUsersById(userId:any) {
    return this._httpService.getModelList(this.modelName + '/' + userId);
  }
  getUsersByOrgId(orgId:any) {
    return this._httpService.getModelList(this.modelName + '/org/' + orgId);
  }
  delete(id: any) {
    return this._httpService.delete(this.modelName , id);
  }

  create(user: any) {
    return this._httpService.create(this.modelName, user);
  }
  update(id:any,user: any) {
    return this._httpService.update(this.modelName,id, user);
  }
  userAuth(modelName:any,user:any){
    return this._httpService.create(modelName, user);
  }
}

import { Injectable } from '@angular/core';
import { HttpService } from '../../../../providers/httpClient';

@Injectable()
export class RoleService {
  private modelName = 'sysrole';  // URL to web api
  constructor(private _httpService: HttpService) {
  }

  getRoles() {
    return this._httpService.getModelList(this.modelName);
  }

  delete(id: any) {
    return this._httpService.delete(this.modelName , id);
  }
  create(name: string) {
    return this._httpService.create(this.modelName, { roleName: name });
  }

}

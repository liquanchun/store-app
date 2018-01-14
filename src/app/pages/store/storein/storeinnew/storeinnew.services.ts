import { Injectable } from '@angular/core';
import { HttpService } from '../../../../providers/httpClient';

@Injectable()
export class StoreinNewService {
  private modelName = 'KcStorein';  // URL to web api
  constructor(private _httpService: HttpService) {
  }

  getStoreins() {
    return this._httpService.getModelList(this.modelName);
  }

  delete(id: any) {
    return this._httpService.delete(this.modelName , id);
  }
  create(storein: any) {
    return this._httpService.create(this.modelName, storein);
  }

}

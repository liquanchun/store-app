import { Injectable } from '@angular/core';
import { HttpService } from '../../../providers/httpClient';
import * as _ from 'lodash';

@Injectable()
export class StorelistService {
  private modelName = 'kcstore';  // URL to web api
  constructor(private _httpService: HttpService) {
  }

  getGoodsstores() {
    return this._httpService.getModelList(this.modelName);
  }
  getGoodsstoresById(storeId:any) {
    return this._httpService.getModelList(this.modelName + '/' + storeId);
  }
  create(model: any) {
    delete model.id;
    return this._httpService.create(this.modelName, model);
  }

  update(modelId: number, model: any) {
    return this._httpService.update(this.modelName, modelId, model);
  }

  delete(id: any) {
    return this._httpService.delete(this.modelName, id);
  }
}

import { Injectable } from '@angular/core';
import { HttpService } from '../../../providers/httpClient';
import * as _ from 'lodash';

@Injectable()
export class DepartmentOutService {
  private modelName = 'kcstoreout';  // URL to web api
  constructor(private _httpService: HttpService) {
  }
  getStoreoutsByPara(queryModel:any) {
    const model = this.modelName + '/report'
    return this._httpService.getModelListByPara(model,queryModel);
  }
  getStoreouts() {
    return this._httpService.getModelList(this.modelName);
  }
  getStoreinsByOrg() {
    return this._httpService.getModelList(this.modelName + '/byorg');
  }
  getStoreinsByMonth() {
    return this._httpService.getModelList(this.modelName + '/bymonth');
  }
  cancel(id:any) {
    return this._httpService.getModelList(this.modelName + '/cancel/' + id);
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
